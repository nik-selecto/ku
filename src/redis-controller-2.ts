import { Redis as RedisType } from 'ioredis';

export class RedisController2 {
    private constructor(private pub: RedisType, private sub: RedisType) {}

    public rewriteState<StateName extends string, StateType extends {}>(channel: StateName, changes: Partial<StateType>): Promise<void> {
        const { pub } = this;

        return pub.get(channel)
            .then((state) => {
                const updatedState = JSON.stringify({ ...JSON.parse(state || '{}'), changes });

                return pub.set(channel, updatedState)
                    .then(() => updatedState);
            }).then((updatedState) => pub.publish(channel, updatedState)) as Promise<void>;
    }
}
