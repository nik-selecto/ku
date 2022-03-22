import Redis, { Redis as RedisType } from 'ioredis';

// eslint-disable-next-line no-use-before-define
type OnStateCbType<TState> = (state: TState, rC: RedisController2) => void;
type OffCbType = (...args: any[]) => void;
type RmListenerType = { offCb: OffCbType, channel: string };
type AssertionCbType<TState> = (actual: TState, expected: Partial<TState>) => boolean;

const MESSAGE = 'message' as const;
const PROPOSITION_POSTFIX = '-proposition' as const;
const STR_EMPTY_OBJ = '{}' as const;

function defaultAssertionCb<TState>(actual: TState, expected: Partial<TState>) {
    return !(Object.entries(expected) as [keyof TState, any][]).some(([k, v]) => actual[k] !== v);
}

const DEFAULT_CHANNELS = [

] as const;

export class RedisController2 {
    private constructor(private pub: RedisType, private sub: RedisType) { }

    private listenersStorage!: Map<string, OffCbType>;

    public patchState<TStateName extends string, TState extends {}>(name: TStateName, changes: Partial<TState>): void {
        const { pub } = this;

        pub.get(name)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state ?? STR_EMPTY_OBJ), changes });

                return pub.set(name, updatedState)
                    .then(() => updatedState);
            })
            .then((updatedState) => pub.publish(name, updatedState));
    }

    public onStatePatched<TStateName extends string, TState extends {}>(
        name: TStateName,
        expectedState: Partial<TState>,
        cb: OnStateCbType<TState>,
        isExpectedState: AssertionCbType<TState> = defaultAssertionCb,
    ): RmListenerType {
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as TState;

            if (isExpectedState(jData, expectedState)) cb(jData, this);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.listenersStorage.set(fullCallback.toString(), fullCallback);

        return {
            offCb: fullCallback,
            channel: name,
        };
    }

    public proposeState<TStateName extends string, TState extends {}>(name: TStateName, proposition: Partial<TState>): void {
        this.pub.publish(`${name}${PROPOSITION_POSTFIX}`, JSON.stringify(proposition));
    }

    public onStateProposition<TStateName extends string, TState extends {}>(
        name: TStateName,
        expectedProposition: Partial<TState>,
        cb: OnStateCbType<TState>,
        options: {
            onlyIfStateLike?: Partial<TState>,
            isExpectedProposition?: AssertionCbType<TState>,
            isExpectedState?: AssertionCbType<TState>
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

            if (!isExpectedProposition((JSON.parse(proposition) as TState), expectedProposition)) return;

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

    public message<TChannel extends string, TMessage extends {}>(channel: TChannel, message: TMessage): void {
        this.pub.publish(channel, JSON.stringify(message));
    }

    public onMessage<TChannel extends string, TMessage extends {}>(channel: TChannel, cb: OnStateCbType<TMessage>): RmListenerType {
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

    public static async init(...channels: string[]): Promise<RedisController2> {
        const pub = new Redis();
        const sub = pub.duplicate();
        const redisController = new RedisController2(pub, sub);

        redisController.listenersStorage = new Map();

        await sub.subscribe(...DEFAULT_CHANNELS, ...channels);

        console.info('Connect to Redis');

        return redisController;
    }
}
