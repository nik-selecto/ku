import qs from 'qs';
import { v4 } from 'uuid';
import Ws, { WebSocket as Tws } from 'ws';
import { KuRequest } from '../api/index.api';
import { ChannelEnum } from '../redis/global-state';
import { KuRedis } from '../redis/ku-redis';

const channels = [
    ChannelEnum.WS_OPEN,
];

export class KuWs {
    private ws?: Tws;

    private kuRedis?: KuRedis;

    private constructor() {}

    public static async init() {
        const kuRedis = await KuRedis.generate(channels);
        const kuWs = new KuWs();

        kuRedis
            .on(ChannelEnum.WS_OPEN)
            .do(({}) => {
                KuRequest.POST['/api/v1/bullet-private'].exec().then((res) => {
                    const id = v4();
                    const { instanceServers, token } = res!;
                    // TODO check all servers. May be we should choose the best.
                    const [server] = instanceServers;

                    kuWs.ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);
                    // TODO dev pause
                    console.log('hi');
                });
            }, { [ChannelEnum.WS_OPEN]: 'yes' });
        kuWs.kuRedis = kuRedis;

        return kuWs;
    }
}
