import qs from 'qs';
import { v4 } from 'uuid';
import Ws from 'ws';
import { KuRequest } from '../api/index.api';
import { ChannelEnum } from '../redis/global-state';
import { KuRedis } from '../redis/ku-redis';

const channels = [
    ChannelEnum.WS_OPEN,
];

export class KuWs {
    private constructor(private kuRedis: KuRedis) {

    }

    public static async init() {
        const kuRedis = await KuRedis.generate(channels);

        kuRedis
            .on(ChannelEnum.WS_OPEN)
            .do(({}) => {
                KuRequest.POST['/api/v1/bullet-private'].exec().then((res) => {
                    const id = v4();
                    const { instanceServers, token } = res!;
                    // TODO check all servers. May be we should choose the best.
                    const [server] = instanceServers;

                    const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);
                    // TODO dev pause
                    console.log('hi');
                });
            }, { [ChannelEnum.WS_OPEN]: 'yes' });

        return new KuWs(kuRedis);
    }
}
