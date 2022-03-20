import { RedisController } from './redis-controller';
import { wsInitialization } from './ws-initialization';

async function main() {
    const rC = await RedisController.init();

    await wsInitialization();

    rC.onState({ ws: 'open' }, (state) => {
        console.log('ws is open!', state);
    });

    rC.makeStateProposition({ ws: 'open' });
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
