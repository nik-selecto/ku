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

    public onState<StateName extends string, StateType extends {}>(
        name: StateName,
        expectedState: Partial<StateType>,
        cb: OnStateCbType<StateType>,
    ): OffCbType {
        const entries = Object.entries(expectedState) as [keyof StateType, any][];
        const fullCallback = (channel: string, data: string) => {
            if (channel !== name) return;

            const jData = JSON.parse(data) as StateType;

            if (entries.some(([k, v]) => jData[k] !== v)) return;

            cb(jData, this);
        };

        this.sub.on(MESSAGE, fullCallback);
        this.cbStorage.set(fullCallback.toString(), fullCallback);

        return fullCallback as OffCbType;
    }
}
