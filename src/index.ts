import { Ku } from './ku';
import { WsChannelDataType, wsInitialization } from './ws/ws-initialization';

async function main() {
    const rC = await Ku.init();

    await wsInitialization();

    rC.proposeState<WsChannelDataType>('ws', { ws: 'open' });
    rC.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
}).finally(() => {
    Ku.finally();
});
