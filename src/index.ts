import { ChannelEnum } from './redis/global-state';
import { KuRedis } from './redis/ku-redis';

async function main() {
    const ku = await KuRedis.generate(ChannelEnum.WS_NEW);

    ku.to(ChannelEnum.WS_NEW).publish({ hello: 'world' });
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
