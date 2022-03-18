import { ChannelEnum } from './redis/global-state';
import { KuRedis } from './redis/ku-redis';
import { pause } from './utils/pause';
import { KuWs } from './ws/ku-ws';

async function main() {
    const i = await KuRedis
        .generate();

    await KuWs
        .init();

    i.on(ChannelEnum.WS_OPEN, console.log);

    await i
        .to(ChannelEnum.WS_OPEN)
        .onlyIfStateLike({ WS: 'closed' })
        .publish({ hello: 'world' });

    await pause(3);
    console.log(await i.getState());

    i.to(ChannelEnum.WS_CLOSE)
        .onlyIfStateLike({ WS: 'open' })
        .publish({ ok: 'google' });

    console.log('===');
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
