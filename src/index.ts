import { KuRequest } from './api/index.api';

async function main() {
    const res = await KuRequest
        .GET['/api/v3/market/orderbook/level2']
        .symbol('LUNA-USDT')
        .exec();
    console.log(res);
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
