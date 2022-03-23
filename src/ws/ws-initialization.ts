import qs from 'qs';
import { v4 } from 'uuid';
import Ws from 'ws';
import { KuRequest } from '../api/index.api';
import { ChannelDataType, RedisController2 } from '../redis-controller-2';
import { IWsMessage } from './ws-types';

export type WsChannelDataType = ChannelDataType<'ws', {
    ws: 'open' | 'close',
}>;

export async function wsInitialization() {
    const redisController = await RedisController2.init('ws');

    redisController.onStateProposition<WsChannelDataType>('ws', { ws: 'open' }, async (state, rC) => {
        const { instanceServers, token } = (await KuRequest.POST['/api/v1/bullet-private'].exec())!;
        const [server] = instanceServers;
        const id = v4();
        const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

        ws.on('message', (message: string) => {
            const jMessage = JSON.parse(message) as IWsMessage;

            if (jMessage.type !== 'message') return;

            redisController.message(jMessage.subject!, jMessage);
        });

        ws.on('open', () => {
            console.info('ws.on("open")');

            const stopPingPong = setInterval(() => {
                ws.send(JSON.stringify({ id, type: 'ping' }));
            }, 30000);

            rC.setOnRedisDown(() => {
                clearInterval(stopPingPong);
                ws.close();
                console.info('ws.close()');
            });

            rC.patchState<WsChannelDataType>('ws', { ws: 'open' });

            rC.onStateProposition<WsChannelDataType>(
                'ws',
                { ws: 'close' },
                () => {
                    clearInterval(stopPingPong);
                    ws.close();
                    console.info('ws.close()');
                },
                { onlyIfStateLike: { ws: 'open' } },
            );
        });
    }, { onlyIfStateLike: { ws: 'close' } });
}
