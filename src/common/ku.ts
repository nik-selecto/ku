import Redis, { Redis as RedisType } from 'ioredis';
import {
    ArrElement, KU_DEFAULT_BEGIN_STATES_ACC,
} from './ku.mapper';
import {
    DefaultChannelsType, defaultPreCbGuard, DEFAULT_CHANNELS, KU_ALREADY_DOWN, KU_ALREADY_INIT, MESSAGE, OffCbType, PreCbAndGuardType, PROPOSITION_POSTFIX, RmListenerType, STR_EMPTY_OBJ,
} from './ku.resources';

export class Ku<
    TStates extends [string, Record<string, any>][],
    TChats extends [string, Record<string, any>, Record<string, any>][],
    > {
    public message<T extends ArrElement<TChats>>(channel: T[0], message: T[1]): void {
        if (this.isDown) return;

        this.pub.publish(channel, JSON.stringify(message));
    }

    public onMessage<T extends ArrElement<TChats>>(channel: T[0], cb: (message: T[2]) => void): RmListenerType {
        const fullCallback = (_channel: string, data: string) => {
            if (channel !== _channel) return;

            cb(JSON.parse(data));
        };

        this.sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            channel,
            offCb: fullCallback,
        };
    }

    public patchState<T extends ArrElement<TStates>>(name: T[0], changes: Partial<T[1]>): void {
        if (this.isDown) return;

        const { pub } = this;

        pub.get(name)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state ?? STR_EMPTY_OBJ), ...changes });

                return pub.set(name, updatedState)
                    .then(() => updatedState);
            })
            .then((updatedState) => pub.publish(name, updatedState));
    }

    public ifState<T extends ArrElement<TStates>>(
        name: T[0],
        cb: (state: T[1]) => void,
        expectedState: Partial<T[1]>,
        options: {
            orInFuture?: boolean,
            preCbAndGuard?: PreCbAndGuardType<T[1]>,
        } = {},
    ) {
        const { preCbAndGuard = defaultPreCbGuard, orInFuture = false } = options;

        this.pub.get(name)
            .then((actualStrState) => {
                const actualState = JSON.parse(actualStrState!);

                if (preCbAndGuard(actualState, expectedState)) {
                    cb(actualState);

                    return;
                }

                if (orInFuture) {
                    this.onStatePatched(name, cb, expectedState, { preCbAndGuard, often: 'once' });
                }
            });
    }

    public onStatePatched<T extends ArrElement<TStates>>(
        name: T[0],
        cb: (state: T[1]) => void,
        expectedState: Partial<T[1]>,
        options: {
            often?: 'on' | 'once',
            preCbAndGuard?: PreCbAndGuardType<T[1]>,
        } = {},
    ): RmListenerType {
        const { preCbAndGuard = defaultPreCbGuard, often = 'on' } = options;
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as T[1];

            if (preCbAndGuard(jData, expectedState)) cb(jData);
        };

        this.sub[often](MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            offCb: fullCallback,
            channel: name,
        };
    }

    public proposeState<T extends ArrElement<TStates>>(name: T[0], proposition: Partial<T[1]>): void {
        if (this.isDown) return;

        this.pub.publish(`${name}${PROPOSITION_POSTFIX}`, JSON.stringify(proposition));
    }

    public onStateProposition<T extends ArrElement<TStates>>(
        name: T[0],
        expectedProposition: Partial<T[1]>,
        cb: (state: T[1]) => void,
        options: {
            onlyIfStateLike?: Partial<T[1]>,
            isExpectedProposition?: PreCbAndGuardType<T[1]>,
            isExpectedState?: PreCbAndGuardType<T[1]>
        },
    ): RmListenerType {
        const { pub, sub } = this;
        const {
            isExpectedProposition = defaultPreCbGuard,
            onlyIfStateLike,
            isExpectedState = defaultPreCbGuard,
        } = options;
        const fullCallback = (channel: string, proposition: string) => {
            if (channel !== `${name}${PROPOSITION_POSTFIX}`) return;

            if (!isExpectedProposition((JSON.parse(proposition) as T[1]), expectedProposition)) return;

            pub.get(name)
                .then((state) => {
                    const jState = JSON.parse(state ?? STR_EMPTY_OBJ);

                    if (onlyIfStateLike && !isExpectedState(jState, onlyIfStateLike)) return;

                    cb(jState);
                });
        };

        sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            channel: name,
            offCb: fullCallback,
        };
    }

    public setOnRedisDown(cb: (pub: RedisType, sub: RedisType) => Promise<void> | void) {
        const { pub, sub } = this;
        this.onRedisDown = cb.bind(this, pub, sub);
    }

    public disconnect(all: boolean = true) {
        if (all) {
            this.pub.publish(('redis-down' as DefaultChannelsType), STR_EMPTY_OBJ);
        } else {
            this.isDown = true;
            this.pub.disconnect();
            this.sub.disconnect();
        }
    }

    public static async init<
        _TState extends [[string, any][0], [string, any][1]][],
        _TChats extends [string, Record<string, any>, Record<string, any>][],
        >(channels: (ArrElement<_TChats>[0] | ArrElement<_TState[0]>)[]): Promise<Ku<_TState, _TChats>> {
        const pub = new Redis();
        const sub = pub.duplicate();
        const ku = new Ku<_TState, _TChats>(pub, sub);
        const isFirstInit = await pub.get(KU_ALREADY_INIT);
        const isDown = await pub.get(KU_ALREADY_DOWN);
        const allChannels = [...DEFAULT_CHANNELS, ...channels].reduce((acc, channel) => {
            acc.push(channel, `${channel}${PROPOSITION_POSTFIX}`);

            return acc;
        }, [] as string[]);

        ku.listenersStorage = new Map();

        if (!isFirstInit) {
            await Promise.all(KU_DEFAULT_BEGIN_STATES_ACC.map(([k, v]) => pub.set(k, JSON.stringify(v))));
            await pub.set(KU_ALREADY_INIT, KU_ALREADY_INIT);
            await pub.del(KU_ALREADY_DOWN);
        } else if (isDown) {
            process.exit(0);
        }

        await sub.subscribe(...allChannels);

        console.info('Connect to Redis');

        return ku;
    }

    private isDown = false;

    private constructor(private pub: RedisType, private sub: RedisType) {
        sub.on(MESSAGE, (channel: DefaultChannelsType, data: string) => {
            if (this.isDown) return;

            const resolver: Record<DefaultChannelsType, (() => void) | undefined> = {
                'rm-listener': () => {
                    const jData = JSON.parse(data) as Record<keyof RmListenerType, string>;
                    const myCb = this.listenersStorage.get(jData.offCb);

                    if (!myCb) return;

                    sub.removeListener(jData.channel, myCb);
                },
                'redis-down': () => {
                    const disconnect = () => {
                        this.pub.del(KU_ALREADY_INIT).then(() => {
                            this.pub.set(KU_ALREADY_DOWN, KU_ALREADY_DOWN).then(() => {
                                this.pub.disconnect();
                                this.sub.disconnect();
                                this.isDown = true;

                                console.info('Disconnect from Redis');
                            });
                        });
                    };

                    if (!this.onRedisDown) {
                        disconnect();

                        return;
                    }

                    const downResult = this.onRedisDown();

                    if (downResult instanceof Promise) {
                        downResult.then(() => disconnect());

                        return;
                    }

                    disconnect();
                },
            };

            resolver[channel]?.();
        });
    }

    private listenersStorage!: Map<string, OffCbType>;

    private onRedisDown?: () => Promise<void> | void;
}
