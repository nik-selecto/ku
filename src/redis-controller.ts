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

            return _pub.set('state', updateState);
        }).then(() => {
            _pub.publish('state', updateState);
        });
    }

    public on(data: Partial<StateType>, cb: (redisController: RedisController, state: StateType) => void) {
        const entries = Object.entries(data);

        this.sub.on('state', (_data) => {
            const dataAsObj = JSON.parse(_data);
            if (entries.some(([k, v]) => dataAsObj[k] !== v)) return;

            cb(this, dataAsObj);
        });
    }
}
