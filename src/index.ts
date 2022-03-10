import { KuRequest } from './api/index.api';

async function main() {
    const res = await KuRequest.GET['/api/v1/accounts'].setParams({ type: 'trade' }).exec();

    console.log(res);
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
