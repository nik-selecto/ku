import moment from 'moment';
import { KuRequest } from './api/index.api';

async function main() {
    const res = await KuRequest.GET['/api/v1/accounts'].setParams({ type: 'trade', currency: 'LUNA' }).exec();

    console.log(res);

    const ledgersRes = await KuRequest
        .GET['/api/v1/accounts/ledgers']
        .setParams({
            startAt: moment().add(-4, 'months').unix().toString(),
            currency: '1EARTH',
        })
        .exec();

    console.log(ledgersRes);
}

main().catch((error) => {
    console.error('================== ERROR =================');
    console.error(error);
    console.error('================== ERROR =================');
});
