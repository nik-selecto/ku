import qs from 'qs';
import { v4 } from 'uuid';
import Ws from 'ws';
import { KuRequest } from '../api/index.api';
import { RedisController } from '../redis-controller';
import { IWsMessage } from './ws-types';

export async function wsInitialization() {
    const redisController = await RedisController.init();

    redisController.onStateProposition({ ws: 'open' }, async (state, rC) => {
        const { instanceServers, token } = (await KuRequest.POST['/api/v1/bullet-private'].exec())!;
        const [server] = instanceServers;
        const id = v4();
        const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

        ws.on('message', (message: string) => {
            const jMessage = JSON.parse(message) as IWsMessage;

            if (jMessage.type !== 'message') return;

            redisController.publish(jMessage.subject!, jMessage);
        });

        ws.on('open', () => {
            console.info('ws.on("open")');

            const stopPingPong = setInterval(() => {
                ws.send(JSON.stringify({ id, type: 'ping' }));
            }, 30000);

            rC.setOnRedisOff(() => {
                clearInterval(stopPingPong);
                ws.close();
                console.info('ws.close()');

                return rC.rewriteState({ ws: 'close' });
            });

            rC.rewriteState({ ws: 'open' });

            rC.onStateProposition({ ws: 'close' }, (_state, _rC) => {
                clearInterval(stopPingPong);
                ws.close();
                console.info('ws.close()');
                _rC.rewriteState({ ws: 'close' });
            }, { ws: 'open' });
        });
    }, { ws: 'close' });
}
