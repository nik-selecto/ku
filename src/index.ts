import { RedisController2 } from './ku';
import { pause } from './utils/pause';
import { WsChannelDataType, wsInitialization } from './ws/ws-initialization';

async function main() {
    const rC = await RedisController2.init();

    await wsInitialization();

    rC.proposeState<WsChannelDataType>('ws', { ws: 'open' });
    await pause(3);
    rC.disconnect();
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
}).finally(() => {
    RedisController2.finally();
});
