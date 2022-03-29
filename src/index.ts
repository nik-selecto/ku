import { Ku } from './common/ku';
import { KU_STATE_TYPE } from './common/ku.mapper';
import { pause } from './utils/pause';
import { WsSubjectEnum } from './ws/types/enums/ws-subject.enum';
import { Level2Best50CPS, Level2Best5CPS, publishLevel2Best50 } from './ws/types/ws-level-2-best-5.type';
import { Level2MarketBookCPS } from './ws/types/ws-market-data-level-2.type';
import { WsSendCPS } from './ws/ws.mapper';

async function main() {
    const ku = await Ku.init<KU_STATE_TYPE, [
        WsSendCPS,
        Level2MarketBookCPS,
        Level2Best5CPS,
        Level2Best50CPS,
    ]>(['ws', 'ws-send', WsSubjectEnum.TRADE_L2UPDATE, WsSubjectEnum.LEVEL2]);

    ku.proposeState('ws', { ws: 'open' });
    ku.onMessage<Level2Best50CPS>(WsSubjectEnum.LEVEL2, (message) => {
        console.log(message.data);
    });

    ku.ifState('ws', { ws: 'open' }, () => {
        ku.message('ws-send', publishLevel2Best50(['LUNA-USDT']));
    }, { orInFuture: true });

    await pause(20);

    ku.message('ws-send', publishLevel2Best50(['LUNA-USDT'], 'unsubscribe'));

    await pause(3);

    ku.proposeState('ws', { ws: 'close' });

    await pause(2);

    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
