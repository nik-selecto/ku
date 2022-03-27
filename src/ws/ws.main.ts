import { wsInit } from './ws.init';

async function wsMain() {
    await wsInit();
}

wsMain().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
