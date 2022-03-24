import Redis, { Redis as RedisType } from 'ioredis';

// eslint-disable-next-line no-use-before-define
type OnStateCbType<TState> = (state: TState, rC: Ku) => void;
type OffCbType = (...args: any[]) => void;
type RmListenerType = { offCb: OffCbType, channel: string };
type AssertionCbType<TState> = (actual: TState, expected: Partial<TState>) => boolean;
type DefaultChannelsType = 'rm-listener' | 'redis-down';

const KU_ALREADY_INIT = 'ku-is-already-init';
const KU_ALREADY_DOWN = 'ku-is-already-down';
const MESSAGE = 'message' as const;
const PROPOSITION_POSTFIX = '-proposition' as const;
const STR_EMPTY_OBJ = '{}' as const;

function defaultAssertionCb<TState>(actual: TState, expected: Partial<TState>) {
    return !(Object.entries(expected) as [keyof TState, any][]).some(([k, v]) => actual[k] !== v);
}

const DEFAULT_CHANNELS: DefaultChannelsType[] = [
    'rm-listener',
    'redis-down',
];

const DEFAULT_BEGIN_STATES_ACC: Record<string, Record<string, any>> = {
    ws: {
        ws: 'close',
        subscriptions: [],
    },
};

export type ChannelDataType<TChannel extends string, TData extends {}> = [TChannel, TData];

export class Ku {
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
                    } else if (this.onRedisDown instanceof Promise) {
                        (this.onRedisDown() as Promise<void>).then(() => disconnect());
                    } else {
                        this.onRedisDown();
                        disconnect();
                    }
                },
            };

            resolver[channel]?.();
        });
    }

    private listenersStorage!: Map<string, OffCbType>;

    private onRedisDown?: () => Promise<void> | void;

    public setOnRedisDown(cb: (pub: RedisType, sub: RedisType) => Promise<void> | void) {
        const { pub, sub } = this;
        this.onRedisDown = cb.bind(this, pub, sub);
    }

    public patchState<T extends ChannelDataType<string, {}>>(name: T[0], changes: Partial<T[1]>): void {
        if (this.isDown) return;

        const { pub } = this;

        pub.get(name)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state ?? STR_EMPTY_OBJ), changes });

                return pub.set(name, updatedState)
                    .then(() => updatedState);
            })
            .then((updatedState) => pub.publish(name, updatedState));
    }

    public onStatePatched<T extends ChannelDataType<string, {}>>(
        name: T[0],
        expectedState: Partial<T[1]>,
        cb: OnStateCbType<T[1]>,
        isExpectedState: AssertionCbType<T[1]> = defaultAssertionCb,
    ): RmListenerType {
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as T[1];

            if (isExpectedState(jData, expectedState)) cb(jData, this);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            offCb: fullCallback,
            channel: name,
        };
    }

    public proposeState<T extends ChannelDataType<string, {}>>(name: T[0], proposition: Partial<T[1]>): void {
        if (this.isDown) return;

        this.pub.publish(`${name}${PROPOSITION_POSTFIX}`, JSON.stringify(proposition));
    }

    public onStateProposition<T extends ChannelDataType<string, {}>>(
        name: T[0],
        expectedProposition: Partial<T[1]>,
        cb: OnStateCbType<T[1]>,
        options: {
            onlyIfStateLike?: Partial<T[1]>,
            isExpectedProposition?: AssertionCbType<T[1]>,
            isExpectedState?: AssertionCbType<T[1]>
        },
    ): RmListenerType {
        const rC = this;
        const { pub, sub } = this;
        const {
            isExpectedProposition = defaultAssertionCb,
            onlyIfStateLike,
            isExpectedState = defaultAssertionCb,
        } = options;
        const fullCallback = (channel: string, proposition: string) => {
            if (channel !== `${name}${PROPOSITION_POSTFIX}`) return;

            if (!isExpectedProposition((JSON.parse(proposition) as T[1]), expectedProposition)) return;

            pub.get(name)
                .then((state) => {
                    const jState = JSON.parse(state ?? STR_EMPTY_OBJ);

                    if (onlyIfStateLike && !isExpectedState(jState, onlyIfStateLike)) return;

                    cb(jState, rC);
                });
        };

        sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            channel: name,
            offCb: fullCallback,
        };
    }

    public message<T extends ChannelDataType<string, {}>>(channel: T[0], message: T[1]): void {
        if (this.isDown) return;

        this.pub.publish(channel, JSON.stringify(message));
    }

    public onMessage<T extends ChannelDataType<string, {}>>(channel: T[0], cb: OnStateCbType<T[1]>): RmListenerType {
        const rC = this;
        const fullCallback = (_channel: string, data: string) => {
            if (channel !== _channel) return;

            cb(JSON.parse(data), rC);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            channel,
            offCb: fullCallback,
        };
    }

    public static async init(...channels: string[]): Promise<Ku> {
        const pub = new Redis();
        const sub = pub.duplicate();
        const redisController = new Ku(pub, sub);
        const isFirstInit = await pub.get(KU_ALREADY_INIT);
        const isDown = await pub.get(KU_ALREADY_DOWN);
        const allChannels = [...DEFAULT_CHANNELS, ...channels].reduce((acc, channel) => {
            acc.push(channel, `${channel}${PROPOSITION_POSTFIX}`);

            return acc;
        }, [] as string[]);

        redisController.listenersStorage = new Map();

        if (!isFirstInit) {
            await Promise.all(Object.entries((DEFAULT_BEGIN_STATES_ACC)).map(([k, v]) => pub.set(k, JSON.stringify(v))));
            await pub.set(KU_ALREADY_INIT, KU_ALREADY_INIT);
            await pub.del(KU_ALREADY_DOWN);
        } else if (isDown) {
            process.exit(0);
        }

        await sub.subscribe(...allChannels);

        console.info('Connect to Redis');

        return redisController;
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
}
