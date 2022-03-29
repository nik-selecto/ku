import { KuRequest } from './api/index.api';
import { Ku } from './common/ku';
import { KU_STATE_TYPE } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/types/enums/ws-subject.enum';
import { Level2MarketBookCPS, publishLevel2MarketData } from './ws/types/ws-market-data-level-2.type';
import { WsSendCPS } from './ws/ws.mapper';

async function main() {
    let loop = true;

    const ku = await Ku.init<KU_STATE_TYPE, [
        WsSendCPS,
        Level2MarketBookCPS,
    ]>(['ws', 'ws-send', WsSubjectEnum.TRADE_L2UPDATE]);

    ku.proposeState('ws', { ws: 'open' });

    ku.ifState('ws', { ws: 'open' }, () => {
        ku.message('ws-send', publishLevel2MarketData(['LUNA-USDT']));
    });

    pause(10).then(() => {
        loop = false;
        ku.disconnect();
    });

    while (loop) {
        console.log(
            // eslint-disable-next-line no-await-in-loop
            await KuRequest.GET['/api/v3/market/orderbook/level2'].symbol('LUNA-USDT').exec(),
        );
    }
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
