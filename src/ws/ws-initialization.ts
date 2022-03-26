import qs from 'qs';
import { EventEmitter } from 'stream';
import { v4 } from 'uuid';
import Ws, { WebSocket } from 'ws';
import { KuRequest } from '../api/index.api';
import { Ku } from '../common/ku';
import { KU_ALL_STATE_TYPE, PubSubType } from '../common/ku.mapper';
import { IWsMessage, WsSubjectEnum } from './ws-types';
import {
    CLOSE_WS_EVENT, CONNECTING_WS_EVENT, OPEN_WS_EVENT,
} from './ws.resources';

export async function wsInitialization() {
    const redisController = await Ku.init<
        [KU_ALL_STATE_TYPE[0]],
        [
            PubSubType<'subscribe' | 'unsubscribe', {}>,
            PubSubType<WsSubjectEnum, {}>,
        ]>('ws');
    // TODO -------------------------------- this code need more elegant solution!
    const emitter = new EventEmitter();
    let websocket: WebSocket | null = null;
    let isConnecting = false;

    emitter.on(CONNECTING_WS_EVENT, () => {
        isConnecting = true;
    });
    emitter.on(CLOSE_WS_EVENT, () => {
        websocket = null;
        isConnecting = false;
    });

    const getWs = () => {
        if (websocket) return Promise.resolve(websocket);
        return isConnecting
            ? Promise.resolve(null)
            : new Promise<WebSocket>((resolve) => {
                emitter.once(OPEN_WS_EVENT, (ws) => {
                    resolve(ws);
                });
            });
    };

    redisController.setOnRedisDown(async () => {
        const ws = await getWs();

        ws?.close();
    });
    // ----------------------- or at least make general solution like function for situations like this.

    redisController.onStateProposition('ws', { ws: 'open' }, async () => {
        const { instanceServers, token } = (await KuRequest.POST['/api/v1/bullet-private'].exec())!;
        const [server] = instanceServers;
        const id = v4();
        const ws = new Ws(`${server.endpoint}${qs.stringify({ token, id }, { addQueryPrefix: true })}`);

        emitter.emit(CONNECTING_WS_EVENT);

        ws.on('message', (message: string) => {
            const jMessage = JSON.parse(message) as Required<IWsMessage>;

            if (jMessage.type !== 'message') return;

            redisController.message(jMessage.subject, jMessage);
        });

        ws.on('open', () => {
            emitter.emit(OPEN_WS_EVENT, ws);
            console.info('ws.on("open")');

            const stopPingPong = setInterval(() => {
                ws.send(JSON.stringify({ id, type: 'ping' }));
            }, 30000);

            ws.on('close', () => {
                emitter.emit(CLOSE_WS_EVENT);
                clearInterval(stopPingPong);
                console.info('ws.on("close")');

                redisController.patchState('ws', { ws: 'close' });
            });

            redisController.patchState('ws', { ws: 'open' });
        });

        redisController.onStateProposition(
            'ws',
            { ws: 'close' },
            () => {
                ws.close();
            },
            { onlyIfStateLike: { ws: 'open' } },
        );
    }, { onlyIfStateLike: { ws: 'close' } });
}
