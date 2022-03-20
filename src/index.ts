import { RedisController } from './redis-controller';

async function main() {
    const rc = await RedisController.init();

    rc.on({ ws: 'open' }, (state) => {
        console.log(state);
    });
    rc.rewriteState({ ws: 'open' });
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
