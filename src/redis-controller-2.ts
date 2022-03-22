import { Redis as RedisType } from 'ioredis';

// eslint-disable-next-line no-use-before-define
type OnStateCbType<StateType> = (state: StateType, rC: RedisController2) => void;
type OffCbType = (...args: any[]) => void;
type AssertionCbType<StateType> = (actual: StateType, expected: Partial<StateType>) => boolean;

const MESSAGE = 'message' as const;
const PROPOSITION_POSTFIX = '-proposition' as const;
const STR_EMPTY_OBJ = '{}' as const;

function defaultAssertionCb<StateType>(actual: StateType, expected: Partial<StateType>) {
    return !(Object.entries(expected) as [keyof StateType, any][]).some(([k, v]) => actual[k] !== v);
}

export class RedisController2 {
    private constructor(private pub: RedisType, private sub: RedisType) { }

    private cbStorage!: Map<string, OffCbType>;

    public patchState<StateName extends string, StateType extends {}>(name: StateName, changes: Partial<StateType>): void {
        const { pub } = this;

        pub.get(name)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state ?? STR_EMPTY_OBJ), changes });

                return pub.set(name, updatedState)
                    .then(() => updatedState);
            })
            .then((updatedState) => pub.publish(name, updatedState));
    }

    public onStatePatched<StateName extends string, StateType extends {}>(
        name: StateName,
        expectedState: Partial<StateType>,
        cb: OnStateCbType<StateType>,
        isExpectedState: AssertionCbType<StateType> = defaultAssertionCb,
    ): OffCbType {
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as StateType;

            if (isExpectedState(jData, expectedState)) cb(jData, this);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.cbStorage.set(fullCallback.toString(), fullCallback);

        return fullCallback as OffCbType;
    }

    public proposeState<StateName extends string, StateType extends {}>(name: StateName, proposition: Partial<StateType>): void {
        this.pub.publish(`${name}${PROPOSITION_POSTFIX}`, JSON.stringify(proposition));
    }

    public onStateProposition<StateName extends string, StateType extends {}>(
        name: StateName,
        expectedProposition: Partial<StateType>,
        cb: OnStateCbType<StateType>,
        options: {
            onlyIfStateLike?: Partial<StateType>,
            isExpectedProposition?: AssertionCbType<StateType>,
            isExpectedState?: AssertionCbType<StateType>
        },
    ): OffCbType {
        const rC = this;
        const { pub, sub } = this;
        const {
            isExpectedProposition = defaultAssertionCb,
            onlyIfStateLike,
            isExpectedState = defaultAssertionCb,
        } = options;
        const fullCallback = (channel: string, proposition: string) => {
            if (channel !== `${name}${PROPOSITION_POSTFIX}`) return;

            if (!isExpectedProposition((JSON.parse(proposition) as StateType), expectedProposition)) return;

            pub.get(name)
                .then((state) => {
                    const jState = JSON.parse(state ?? STR_EMPTY_OBJ);

                    if (onlyIfStateLike && !isExpectedState(jState, onlyIfStateLike)) return;

                    cb(jState, rC);
                });
        };

        sub.on(MESSAGE, fullCallback);
        this.cbStorage.set(fullCallback.toString(), fullCallback);

        return fullCallback;
    }
}
