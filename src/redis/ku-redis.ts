/* eslint-disable max-classes-per-file */
import { Redis as TRedis } from 'ioredis';
import { ChannelEnum, GLOBAL_STATE, StateTumbler } from './global-state';

async function setDefaultState(pub: TRedis) {
    await Promise.all(Object.entries(GLOBAL_STATE).map(([channel, tumbler]) => pub.set(channel, tumbler)));
}

class DoNode {
    // eslint-disable-next-line no-use-before-define
    and!: KuRedis;

    // eslint-disable-next-line no-use-before-define
    setState!: (key: ChannelEnum, tumbler: StateTumbler) => Promise<DoNode>;
}

export class KuRedis {
    private static isDefaultReady = false;

    private constructor(private pub: TRedis, private sub: TRedis) {}

    public static async generate(pub: TRedis, channels: ChannelEnum[]) {
        const sub = pub.duplicate();

        await Promise.all([
            sub.subscribe(channels),
            KuRedis.isDefaultReady
                ? Promise.resolve()
                : setDefaultState(pub),
        ]);

        return new KuRedis(pub, sub);
    }

    public on<T extends object>(channel: ChannelEnum) {
        const thisIs: KuRedis = this;

        return {
            do(cb: (data: T) => void) {
                thisIs.sub.on('message', (_channel: string, _data: string) => {
                    if (_channel !== channel) return;

                    cb(JSON.parse(_data));
                });

                const node: Omit<DoNode, 'setState'> = {
                    and: thisIs,
                };

                (node as DoNode).setState = async (key: ChannelEnum, tumbler: StateTumbler = 'yes') => {
                    await thisIs.pub.set(key, tumbler);

                    return node as DoNode;
                };
            },
        };
    }

    public to(channel: ChannelEnum) {
        const thisIs: KuRedis = this;
        const action = (_data: object) => thisIs.pub.publish(channel as string, JSON.stringify(_data));

        return {
            async ifState(state: Partial<typeof GLOBAL_STATE>) {
                const entries = Object.entries(state);
                const currentState = await Promise.all(entries.map(([key]) => thisIs.pub.get(key)));

                return {
                    async publish(data: object) {
                        if (!entries.some(([value], i) => value !== currentState[i])) {
                            await action(data);
                        }

                        return thisIs;
                    },
                };
            },
            async publish(data: object) {
                await action(data);

                return thisIs;
            },
        };
    }
}
