import { Ku } from './common/ku';
import { KU_STATE_TYPE } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/types/enums/ws-subject.enum';
import { MarketTickerCPS, publishMarketTicker } from './ws/types/ws-market-ticker.type';
import { WsSendCPS } from './ws/ws.mapper';

async function main() {
    const ku = await Ku.init<KU_STATE_TYPE, [
        WsSendCPS,
        MarketTickerCPS,
    ]>(['ws', WsSubjectEnum.TRADE_TICKER, 'ws-send']);

    ku.proposeState('ws', { ws: 'open' });

    const listenerId = ku.onMessage<MarketTickerCPS>(WsSubjectEnum.TRADE_TICKER, (message) => {
        console.log(message.data.price);
    });

    ku.ifState('ws', async () => {
        ku.message('ws-send', publishMarketTicker(['LUNA-USDT']));
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
