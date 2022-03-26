import { Ku } from './common/ku';
import { ChannelPubSub, KU_ALL_STATE_TYPE } from './common/ku.mapper';
import { WsSubjectEnum } from './ws/ws-types';

async function main() {
    const ku = await Ku.init<KU_ALL_STATE_TYPE, [
        ChannelPubSub<WsSubjectEnum.TRADE_TICKER>,
        ChannelPubSub<WsSubjectEnum.TRADE_SNAPSHOT>,
    ]>();
    ku.proposeState('ws', { ws: 'open' });
    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
