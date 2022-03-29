import { KuRequest } from './api/index.api';

async function main() {
    const res = await KuRequest
        .GET['/api/v1/market/orderbook/level2_100']
        .symbol('LUNA-USDT')
        .exec();
    console.log(res);
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
