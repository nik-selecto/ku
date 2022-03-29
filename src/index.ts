import { Ku } from './common/ku';
import { KU_STATE_TYPE } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/types/enums/ws-subject.enum';
import { Level2MarketBookCPS, publishLevel2MarketData } from './ws/types/ws-market-data-level-2.type';
import { WsSendCPS } from './ws/ws.mapper';

async function main() {
    const ku = await Ku.init<KU_STATE_TYPE, [
        WsSendCPS,
        Level2MarketBookCPS,
    ]>(['ws', 'ws-send', WsSubjectEnum.TRADE_L2UPDATE]);

    ku.proposeState('ws', { ws: 'open' });

    ku.ifState('ws', { ws: 'open' }, () => {
        ku.message('ws-send', publishLevel2MarketData(['LUNA-USDT']));
    });

    await pause(300);

    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
