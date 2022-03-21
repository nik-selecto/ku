import { RedisController } from './redis-controller';
import { pause } from './utils/pause';
import { wsInitialization } from './ws/ws-initialization';

async function main() {
    const rC = await RedisController.init();

    await wsInitialization();

    rC.makeStateProposition({ ws: 'open' });

    await pause(4);

    rC.makeStateProposition({ redis: 'off' });
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
