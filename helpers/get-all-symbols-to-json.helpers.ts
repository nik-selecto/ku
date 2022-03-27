import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

async function main() {
    const { data: res } = await axios({
        url: 'https://api.kucoin.com/api/v1/symbols',
    });
    const jData = (res.data as any[]).map(({ symbol }) => symbol).filter((s: string) => /-USDT$/.test(s));
    const data = JSON.stringify(jData);

    fs.writeFileSync(join(__dirname, '../../all-kucoin-pairs.json'), data, { encoding: 'utf-8' });
}

main();
