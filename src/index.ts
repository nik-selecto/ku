import { Ku } from './common/ku';
import { KU_ALL_STATE_TYPE, WsSendChannel, WsSubjectPubSub } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/ws-types';

async function main() {
    const ku = await Ku.init<KU_ALL_STATE_TYPE, [
        WsSubjectPubSub[0],
        [WsSendChannel, {}, {}],
    ]>(['ws', WsSubjectEnum.TRADE_TICKER, 'ws-send']);

    ku.proposeState('ws', { ws: 'open' });
    ku.ifState('ws', () => {
        ku.message('ws-send', {
            type: 'subscribe',
            topic: '/market/ticker:LUNA-USDT',
        });
    }, { ws: 'open' }, { orInFuture: true });

    await pause(7);

    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
