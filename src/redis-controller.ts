import Redis, { Redis as RedisType } from 'ioredis';
import { v4 } from 'uuid';

type RedisValueType = 'on' | 'off';
type WsValueType = 'open' | 'close';
type StateType = {
    ws: WsValueType,
    redis: RedisValueType,
}
type OffCallbackType = (...args: any[]) => void;

const beginState: StateType = {
    redis: 'on',
    ws: 'close',
};

const STATE_CHANNEL = 'state' as const;
const STATE_PROPOSITION_CHANNEL = 'ask-state' as const;
const RM_LISTENER_CHANNLE = 'rm-listener' as const;

// eslint-disable-next-line no-shadow
export enum ChannelEnum {
    TRADE_TICKER_ws_message = 'trade-ticker-ws-message',
}

export class RedisController {
    private static isFirstRun = true;

    private callbacksMap!: Map<string, { channel: string, cb: OffCallbackType }>;

    private onRedisOff?: () => Promise<void> | void;

    private constructor(private pub: RedisType, private sub: RedisType) { }

    public static async init(...channels: ChannelEnum[]) {
        const pub = new Redis();
        const sub = pub.duplicate();
        const redisController = new RedisController(pub, sub);

        redisController.callbacksMap = new Map();

        if (RedisController.isFirstRun) {
            pub.set(STATE_CHANNEL, JSON.stringify(beginState));
            this.isFirstRun = false;
        }

        await sub.subscribe(STATE_CHANNEL, STATE_PROPOSITION_CHANNEL, RM_LISTENER_CHANNLE, ...channels);

        sub.on('message', (channel, data) => {
            if (channel !== STATE_PROPOSITION_CHANNEL) {
                if (channel !== RM_LISTENER_CHANNLE) return;

                const myCb = redisController.callbacksMap.get(data);

                if (!myCb) return;

                sub.removeListener(myCb.channel, myCb.cb);

                return;
            }

            const stateProposition = JSON.parse(data) as Partial<StateType>;

            if (stateProposition.redis !== 'off') return;

            if (!redisController.onRedisOff) {
                pub.disconnect();
                sub.disconnect();
                console.info('Disconnect from Redis');

                return;
            }

            const offResult = redisController.onRedisOff();

            if (offResult instanceof Promise) {
                offResult.then(() => {
                    pub.disconnect();
                    sub.disconnect();
                    console.info('Disconnect from Redis');
                });

                return;
            }

            pub.disconnect();
            sub.disconnect();
            console.info('Disconnect from Redis');
        });

        console.info('Connect to Redis');

        return redisController;
    }

    public setOnRedisOff(onRedisOff: () => Promise<void> | void) {
        this.onRedisOff = onRedisOff;
    }

    public rewriteState(data: Partial<StateType>) {
        const _pub = this.pub;
        let updateState = '';

        return _pub.get(STATE_CHANNEL).then((state) => {
            updateState = JSON.stringify({ ...JSON.parse(state!), ...data });
            _pub.set(STATE_CHANNEL, updateState);
        }).then(() => {
            _pub.publish(STATE_CHANNEL, updateState);
        }) as Promise<void>;
    }

    public onState(data: Partial<StateType>, cb: (state: StateType, rC: RedisController) => void) {
        const entries = Object.entries(data);

        this.sub.on('message', (channel, _data) => {
            if (channel !== STATE_CHANNEL) return;

            const dataAsObj = JSON.parse(_data);

            if (entries.some(([k, v]) => dataAsObj[k] !== v)) return;

            cb(dataAsObj, this);
        });
    }

    public onStateProposition(
        data: Partial<StateType>,
        cb: (state: StateType, rC: RedisController) => void,
        ifStateLike?: Partial<StateType>,
    ) {
        const entries = Object.entries(data);
        const { sub, pub } = this;

        sub.on('message', async (channel, _data) => {
            if (channel !== STATE_PROPOSITION_CHANNEL) return;

            const dataAsObj = JSON.parse(_data);

            if (entries.some(([k, v]) => dataAsObj[k] !== v)) return;

            if (!ifStateLike) {
                cb(dataAsObj, this);

                return;
            }

            const currentState = JSON.parse((await pub.get('state'))!);

            if (Object.entries(ifStateLike).some(([k, v]) => currentState[k] !== v)) return;

            cb(dataAsObj, this);
        });
    }

    public makeStateProposition(data: Partial<StateType>) {
        this.pub.publish(STATE_PROPOSITION_CHANNEL, JSON.stringify(data));
    }

    public publish<T extends {}>(channel: ChannelEnum, data: T) {
        this.pub.publish(channel, JSON.stringify(data));
    }

    public on<T>(channel: ChannelEnum, cb: (data: T) => void) {
        const onMessageCb = (_channel: ChannelEnum, _data: string) => {
            if (_channel !== channel) return;

            cb(JSON.parse(_data));
        };
        const cbId = v4();

        this.sub.on('message', onMessageCb);
        this.callbacksMap.set(cbId, { channel, cb: onMessageCb });

        return cbId;
    }

    public removeListener(cbId: string) {
        const myCb = this.callbacksMap.get(cbId);

        if (myCb) {
            this.sub.removeListener(myCb.channel, myCb.cb);
            this.callbacksMap.delete(cbId);
        } else {
            this.pub.publish(RM_LISTENER_CHANNLE, cbId);
        }
    }
}
