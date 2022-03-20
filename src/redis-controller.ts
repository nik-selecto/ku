import Redis, { Redis as RedisType } from 'ioredis';

type StateType = {
    ws: 'open' | 'close',
    redis: 'up' | 'down',
}

const beginState: StateType = {
    redis: 'down',
    ws: 'close',
};

export class RedisController {
    private static isFirstRun = true;

    private constructor(private pub: RedisType, private sub: RedisType) { }

    public static async init() {
        const pub = new Redis();
        const sub = pub.duplicate();

        if (RedisController.isFirstRun) {
            pub.set('state', JSON.stringify(beginState));
            this.isFirstRun = false;
        }

        await sub.subscribe('state');

        return new RedisController(pub, sub);
    }

    public rewriteState(data: Partial<StateType>) {
        const _pub = this.pub;
        let updateState = '';
        _pub.get('state').then((state) => {
            updateState = JSON.stringify({ ...JSON.parse(state!), ...data });
            _pub.set('state', updateState);
        }).then(() => {
            _pub.publish('state', updateState);
        });
    }

    public on(data: Partial<StateType>, cb: (state: StateType, redisController: RedisController) => void) {
        const entries = Object.entries(data);

        this.sub.on('message', (channel, _data) => {
            if (channel !== 'state') return;

            const dataAsObj = JSON.parse(_data);

            if (entries.some(([k, v]) => dataAsObj[k] !== v)) return;

            cb(dataAsObj, this);
        });
    }
}
