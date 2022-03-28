import { KuRequest } from './api/index.api';

async function main() {
    const res = await KuRequest.DELETE['cancel/all/orders'].exec();

    console.log(res);
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
