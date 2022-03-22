import { Redis as RedisType } from 'ioredis';

const MESSAGE = 'message' as const;

// eslint-disable-next-line no-use-before-define
type OnStateCbType<StateType> = (state: StateType, rC: RedisController2) => void;
type OffCbType = (...args: any[]) => void;

export class RedisController2 {
    private constructor(private pub: RedisType, private sub: RedisType) { }

    private cbStorage!: Map<string, OffCbType>;

    public patchState<StateName extends string, StateType extends {}>(name: StateName, changes: Partial<StateType>): Promise<void> {
        const { pub } = this;

        return pub.get(name)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state || '{}'), changes });

                return pub.set(name, updatedState)
                    .then(() => updatedState);
            }).then((updatedState) => pub.publish(name, updatedState)) as Promise<void>;
    }

    public onStatePatched<StateName extends string, StateType extends {}>(
        name: StateName,
        expectedState: Partial<StateType>,
        cb: OnStateCbType<StateType>,
        isNotExpectedAssertion: ((
            expected: Partial<StateType>,
            actual: StateType) => boolean
        ) = (
            expected,
            actual,
            ) => (Object.entries(expected) as [keyof StateType, any][])
                .some(([k, v]) => actual[k] !== v),
    ): OffCbType {
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as StateType;

            if (isNotExpectedAssertion(expectedState, jData)) return;

            cb(jData, this);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.cbStorage.set(fullCallback.toString(), fullCallback);

        return fullCallback as OffCbType;
    }

    public proposeState<StateName extends string, StateType>(name: StateName, proposition: Partial<StateType>) {
        this.pub.publish(name, JSON.stringify(proposition));
    }
}
