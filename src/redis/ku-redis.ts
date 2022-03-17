/* eslint-disable max-classes-per-file */
import Redis, { Redis as TRedis } from 'ioredis';
import {
    ChannelEnum, GLOBAL_STATE, REDIS_DB,
} from './global-state';

async function setDefaultState(pub: TRedis) {
    await Promise.all(Object.entries(GLOBAL_STATE).map(([channel, tumbler]) => pub.set(channel, tumbler)));
}
export class KuRedis {
    private static isDefaultReady = false;

    private constructor(private pub: TRedis, private sub: TRedis) {}

    public static async generate(channels?: ChannelEnum[]) {
        const pub = new Redis();
        const sub = pub.duplicate();

        await Promise.all([
            sub.subscribe(channels && channels.length ? channels : Object.values(ChannelEnum)),
            KuRedis.isDefaultReady
                ? Promise.resolve()
                : setDefaultState(pub),
        ]);

        KuRedis.isDefaultReady = true;

        return new KuRedis(pub, sub);
    }

    public async set(data: Partial<REDIS_DB>) {
        await Promise.all(Object.entries(data).map(([key, value]) => this.pub.set(key, JSON.stringify(value))));
    }

    public async get(key: keyof REDIS_DB) {
        const res = await this.pub.get(key);

        return res
            ? JSON.parse(res)
            : null;
    }

    public async getState() {
        const thisIs = this;
        const entries = await Promise
            .all((Object.keys(GLOBAL_STATE) as ChannelEnum[])
                .map((key) => new Promise((resolve) => {
                    thisIs.pub.get(key).then((value) => resolve({ [key]: value || '' }));
                }))) as Record<ChannelEnum, string>[];

        return entries.reduce((acc, item) => {
            const [[key, value]] = Object.entries(item);
            (acc as any)[key] = value;

            return acc;
        }, {} as typeof GLOBAL_STATE);
    }

    public _pub() {
        return this.pub;
    }

    public _sub() {
        return this.sub;
    }

    public on<T extends object>(channel: ChannelEnum) {
        const thisIs: KuRedis = this;

        return {
            do(cb: (data: T) => void, updateState?: Partial<typeof GLOBAL_STATE>, updateOnEachEvent: boolean = true) {
                let isFirst = true;

                thisIs.sub.on('message', (_channel: string, _data: string) => {
                    if (_channel !== channel) return;

                    cb(JSON.parse(_data));

                    if (updateState && (isFirst || updateOnEachEvent)) {
                        Promise.all(Object.entries((updateState)).map(([key, value]) => thisIs.pub.set(key, value)))
                            .then(() => {
                                isFirst = false;
                            });
                    }
                });
            },
        };
    }

    public to(channel: ChannelEnum) {
        const thisIs: KuRedis = this;
        const action = async (_data: object, updateState?: Partial<typeof GLOBAL_STATE>) => {
            await thisIs.pub.publish(channel as string, JSON.stringify(_data));

            if (!updateState) return;

            await Promise.all(Object.entries((updateState)).map(([key, value]) => thisIs.pub.set(key, value)));
        };

        return {
            onlyIfStateLike(state: Partial<typeof GLOBAL_STATE>) {
                return {
                    async publish(data: object, updateState?: Partial<typeof GLOBAL_STATE>) {
                        const entries = Object.entries(state);
                        const currentState = await Promise.all(entries.map(([key]) => thisIs.pub.get(key)));

                        entries.some(([, value], i) => value !== currentState[i]);

                        if (entries.some(([, value], i) => value !== currentState[i])) return;

                        await action(data, updateState);
                    },
                };
            },
            async publish(data: object, updateState?: Partial<typeof GLOBAL_STATE>) {
                await action(data, updateState);
            },
        };
    }

    public async close() {
        return Promise.all([this.pub.disconnect(), this.sub.disconnect()]);
    }
}
