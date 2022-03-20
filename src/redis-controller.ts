import Redis, { Redis as RedisType } from 'ioredis';

type RedisValueType = 'on' | 'off';
type WsValueType = 'open' | 'close';
type StateType = {
    ws: WsValueType,
    redis: RedisValueType,
}

const beginState: StateType = {
    redis: 'on',
    ws: 'close',
};

const STATE_CHANNEL = 'state' as const;
const STATE_PROPOSITION_CHANNEL = 'ask-state' as const;

export class RedisController {
    private static isFirstRun = true;

    private onRedisOff?: () => Promise<void> | void;

    private constructor(private pub: RedisType, private sub: RedisType) { }

    public static async init() {
        const pub = new Redis();
        const sub = pub.duplicate();
        const redisController = new RedisController(pub, sub);

        if (RedisController.isFirstRun) {
            pub.set(STATE_CHANNEL, JSON.stringify(beginState));
            this.isFirstRun = false;
        }

        await sub.subscribe(STATE_CHANNEL, STATE_PROPOSITION_CHANNEL);

        sub.on('message', (channel, data) => {
            if (channel !== STATE_PROPOSITION_CHANNEL) return;

            const stateProposition = JSON.parse(data) as Partial<StateType>;

            if (stateProposition.redis !== 'off') return;

            redisController.onRedisOff?.();
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

        _pub.get(STATE_CHANNEL).then((state) => {
            updateState = JSON.stringify({ ...JSON.parse(state!), ...data });
            _pub.set(STATE_CHANNEL, updateState);
        }).then(() => {
            _pub.publish(STATE_CHANNEL, updateState);
        });
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
}
