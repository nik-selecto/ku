/* eslint-disable no-nested-ternary */
import qs from 'qs';
import { v4 } from 'uuid';
import Ws, { WebSocket as Tws } from 'ws';
import { KuRequest } from '../api/index.api';
import { ChannelEnum } from '../redis/global-state';
import { KuRedis } from '../redis/ku-redis';

const channels = [
    ChannelEnum.WS_OPEN,
    ChannelEnum.WS_CLOSE,
];

export class KuWs {
    private ws?: Tws;

    private kuRedis?: KuRedis;

    private constructor() {}

    public static async init() {
        const kuRedis = await KuRedis.generate(channels);
        const kuWs = new KuWs();

        // TODO remove this
        setInterval(() => {
            const readyState = kuWs.ws && kuWs.ws.readyState;

            switch (readyState) {
            case Ws.CLOSED:
                console.info('closed');
                break;
            case Ws.CLOSING:
                console.info('closing');
                break;
            case Ws.CONNECTING:
                console.info('connecting');
                break;
            case Ws.OPEN:
                console.info('open');
                break;
            default:
                console.info(undefined);
            }
        }, 1000);

        kuRedis
            .on(ChannelEnum.WS_OPEN, ({}) => {
                KuRequest.POST['/api/v1/bullet-private'].exec().then((res) => {
                    const id = v4();
                    const { instanceServers, token } = res!;
                    // TODO check all servers. May be we should choose the best.
                    const [server] = instanceServers;

                    kuWs.ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

                    kuWs.ws.on('open', () => {
                        kuRedis
                            .on(ChannelEnum.WS_CLOSE, async ({}) => {
                                kuWs.ws?.close();
                                await new Promise<void>((resolve) => {
                                    kuWs.ws!.on('close', () => {
                                        kuWs.kuRedis!.set({ WS: 'closed' });
                                        resolve();
                                    });
                                });
                            });
                        kuWs.kuRedis!.set({ WS: 'open' });
                    });
                });
            });

        kuWs.kuRedis = kuRedis;

        return kuWs;
    }
}
