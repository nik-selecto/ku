import { Ku } from './common/ku';
import { KU_STATE_TYPE } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/types/enums/ws-subject.enum';
import { AccountBalanceCPS, publishAccountBalance } from './ws/types/ws-account-balance.type';
import { MarketTickerCPS, publishMarketTicker } from './ws/types/ws-market-ticker.type';
import { WsSendCPS } from './ws/ws.mapper';

async function main() {
    const ku = await Ku.init<KU_STATE_TYPE, [
        WsSendCPS,
        MarketTickerCPS,
        AccountBalanceCPS,
    ]>(['ws', WsSubjectEnum.TRADE_TICKER, 'ws-send']);

    ku.proposeState('ws', { ws: 'open' });
    ku.onMessage<MarketTickerCPS>(WsSubjectEnum.TRADE_TICKER, (message) => {
        console.log(message.data.price);
    });
    ku.onMessage(WsSubjectEnum.ACCOUNT_BALANCE, (message) => {
        console.log(message);
    });

    ku.ifState('ws', async () => {
        ku.message('ws-send', publishMarketTicker(['LUNA-USDT']));
        await pause(2);
        ku.message('ws-send', publishMarketTicker(['LUNA-USDT'], 'unsubscribe'));
        console.log('stop ws');
    }, { ws: 'open' }, { orInFuture: true });

    await pause(6);
    console.log('------------------------');
    ku.ifState('ws', async () => {
        ku.message('ws-send', publishAccountBalance());
    }, { ws: 'open' });
    await pause(200);
    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
