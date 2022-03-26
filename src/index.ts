import { Ku } from './common/ku';
import { PubSubType, KU_ALL_STATE_TYPE } from './common/ku.mapper';
import { WsSubjectEnum } from './ws/ws-types';

async function main() {
    const ku = await Ku.init<KU_ALL_STATE_TYPE, [
        PubSubType<WsSubjectEnum.TRADE_TICKER>,
        PubSubType<WsSubjectEnum.TRADE_SNAPSHOT>,
    ]>();
    ku.proposeState('ws', { ws: 'open' });
    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
