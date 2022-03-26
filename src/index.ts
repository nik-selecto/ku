import { Ku } from './common/ku';
import { WsMessagingListType, WsStateType } from './ws/ws.resources';

async function main() {
    const ku = await Ku.init<[WsStateType], WsMessagingListType>();
    ku.proposeState('ws', { ws: 'open' });
    ku.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
