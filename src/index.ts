import { Ku } from './common/ku';
import { KU_ALL_STATE_TYPE, WsSendChannel } from './common/ku.mapper';
import { WsSubjectEnum } from './ws/ws-types';

async function main() {
    const ku = await Ku.init<KU_ALL_STATE_TYPE, [
        [WsSubjectEnum, {}, {}],
        [WsSendChannel, {}, {}],
    ]>(['ws', ...Object.values(WsSubjectEnum), 'ws-send']);
    ku.proposeState('ws', { ws: 'open' });
    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
