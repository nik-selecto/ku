import { ChannelEnum } from './redis/global-state';
import { KuRedis } from './redis/ku-redis';
import { KuWs } from './ws/ku-ws';

async function main() {
    const i = await KuRedis
        .generate();

    await KuWs
        .init();
    i.on(ChannelEnum.WS_OPEN).do(console.log);
    await i
        .to(ChannelEnum.WS_OPEN)
        .onlyIfStateLike({ 'kuWs.open()': 'not' })
        .publish({ hello: 'world' });
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
