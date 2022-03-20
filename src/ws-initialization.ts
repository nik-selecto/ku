import qs from 'qs';
import { v4 } from 'uuid';
import Ws from 'ws';
import { KuRequest } from './api/index.api';
import { RedisController } from './redis-controller';

export async function wsInitialization() {
    const redisController = await RedisController.init();

    redisController.onStateProposition({ ws: 'open' }, async (state, rC) => {
        const { instanceServers, token } = (await KuRequest.POST['/api/v1/bullet-private'].exec())!;
        const [server] = instanceServers;
        const id = v4();
        const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

        ws.on('open', () => {
            console.info('ws.on("open")');
            rC.setOnRedisOff(() => {
                ws.close();
                console.info('ws.close()');
            });
            rC.rewriteState({ ws: 'open' });
        });
    }, { ws: 'close' });
}
