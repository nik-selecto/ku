/* eslint-disable max-classes-per-file */
import Redis, { Redis as TRedis } from 'ioredis';
import {
    ChannelEnum, STATE, STATE_TYPE,
} from './global-state';

async function setDefaultState(pub: TRedis) {
    await Promise.all(Object.entries(STATE).map(([k, v]) => pub.set(k, v)));
}
export class KuRedis {
    private static isDefaultReady = false;

    private constructor(private pub: TRedis, private sub: TRedis) { }

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

    public async set(data: Partial<STATE_TYPE>) {
        await Promise.all(Object.entries(data).map(([key, value]) => this.pub.set(key, typeof value === 'object' ? JSON.stringify(value) : value)));
    }

    public async get(key: keyof STATE_TYPE) {
        const res = await this.pub.get(key);

        return res
            ? JSON.parse(res)
            : null;
    }

    public async getState() {
        const thisIs = this;
        const entries = await Promise
            .all((Object.keys(STATE) as ChannelEnum[])
                .map((key) => new Promise((resolve) => {
                    thisIs.pub.get(key).then((value) => resolve({ [key]: value || '' }));
                }))) as Record<ChannelEnum, string>[];

        return entries.reduce((acc, item) => {
            const [[key, value]] = Object.entries(item);
            (acc as any)[key] = value;

            return acc;
        }, {} as STATE_TYPE);
    }

    public _pub() {
        return this.pub;
    }

    public _sub() {
        return this.sub;
    }

    public on<T extends {} = {}>(channel: ChannelEnum, cb: (data: T) => void) {
        this.sub.on('message', (_channel: string, _data: string) => {
            if (_channel !== channel) return;

            cb(JSON.parse(_data));
        });
    }

    public to(channel: ChannelEnum) {
        const thisIs: KuRedis = this;
        const action = async (_data: object) => {
            await thisIs.pub.publish(channel as string, JSON.stringify(_data));
        };

        return {
            onlyIfStateLike(state: Partial<STATE_TYPE>) {
                return {
                    async publish(data: Record<string, any>) {
                        const entries = Object.entries(state);
                        const currentState = await Promise.all(entries.map(([key]) => thisIs.pub.get(key)));

                        entries.some(([, value], i) => value !== currentState[i]);

                        if (entries.some(([, value], i) => value !== currentState[i])) return;

                        await action(data);
                    },
                };
            },
            async publish(data: Record<string, any>) {
                await action(data);
            },
        };
    }

    public async close() {
        return Promise.all([this.pub.disconnect(), this.sub.disconnect()]);
    }
}
