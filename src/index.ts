import { Ku } from './common/ku';
import { KU_ALL_STATE_TYPE, WsSendChannel, WsSubjectPubSub } from './common/ku.mapper';
import { pause } from './utils/pause';
import { publishMarketTicker } from './ws/types/ws-market-ticker.type';
import { WsSubjectEnum } from './ws/ws-types';

async function main() {
    const ku = await Ku.init<KU_ALL_STATE_TYPE, [
        WsSubjectPubSub[0],
        [WsSendChannel, {}, {}],
    ]>(['ws', WsSubjectEnum.TRADE_TICKER, 'ws-send']);

    ku.proposeState('ws', { ws: 'open' });

    const listenerId = ku.onMessage(WsSubjectEnum.TRADE_TICKER, (message) => {
        console.log(message);
    });

    ku.ifState('ws', async () => {
        ku.message('ws-send', publishMarketTicker(['LUNA-USDT', 'REAP-USDT']));
    }, { ws: 'open' }, { orInFuture: true });

    await pause(5);
    ku.rmListener(listenerId);

    await pause(10);

    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
