import { Ku } from './ku';
import { WsChannelDataType } from './ws/ws-initialization';

async function main() {
    const rC = await Ku.init();
    rC.proposeState<WsChannelDataType>('ws', { ws: 'open' });
    rC.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
