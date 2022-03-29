import qs from 'qs';
import { EventEmitter } from 'stream';
import { v4 } from 'uuid';
import Ws, { WebSocket } from 'ws';
import { KuRequest } from '../api/index.api';
import { Ku } from '../common/ku';
import { KU_STATE_TYPE } from '../common/ku.mapper';
import { WsSubjectEnum } from './types/enums/ws-subject.enum';
import { WsSubAnyMessageType } from './types/general/ws-any-sub-message.type';
import { WS_MAPPER } from './ws.mapper';

const CONNECTING_WS_EVENT = 'ws-is-connecting' as const;
const OPEN_WS_EVENT = 'ws-is-open' as const;
const CLOSE_WS_EVENT = 'ws-is-close' as const;

export async function wsInit() {
    const redisController = await Ku.init<
        [KU_STATE_TYPE[0]],
        WS_MAPPER>(['ws-send', 'ws', ...Object.values(WsSubjectEnum)]);
    // TODO -------------------------------- this code need more elegant solution!
    const emitter = new EventEmitter();
    let websocket: WebSocket | null = null;
    let isConnecting = false;

    emitter.on(CONNECTING_WS_EVENT, (ws) => {
        websocket = ws;
        isConnecting = true;
    });
    emitter.on(CLOSE_WS_EVENT, () => {
        websocket = null;
        isConnecting = false;
    });

    const getWs = () => {
        if (websocket) return Promise.resolve(websocket);

        return isConnecting
            ? new Promise<WebSocket>((resolve) => {
                emitter.once(OPEN_WS_EVENT, (ws) => {
                    resolve(ws);
                });
            })
            : Promise.resolve(null);
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

        emitter.emit(CONNECTING_WS_EVENT, ws);

        ws.on('message', (message: string) => {
            const jMessage = JSON.parse(message) as WsSubAnyMessageType;

            if (jMessage.type !== 'message') {
                console.info(jMessage);

                return;
            }

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

        redisController.onMessage('ws-send', (message) => {
            console.info('--------------------- WS.send() --------------------------------');
            console.info(message);
            console.info('----------------------------------------------------------------');

            ws.send(JSON.stringify({ ...message, id, response: true }));
        });
    }, { onlyIfStateLike: { ws: 'close' } });
}
