import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

async function main() {
    const { data: res } = await axios({
        url: 'https://api.kucoin.com/api/v1/symbols',
    });
    const typeString = `'${(res.data as any[])
        .map(({ symbol }) => symbol)
        .filter((s: string) => /-USDT$/.test(s))
        .map((c: string) => c.substring(0, c.indexOf('-')))
        .reduce((prev, next) => `${prev}' | '${next}`)}'`;

    fs.writeFileSync(
        join(
            __dirname,
            '..',
            'src/general/currency.general-type.ts',
        ),
        `export type CurrencyType = ${typeString};

export type CurrencyUsdt = \`\${CurrencyType}-\${'USDT'}\`;

export type UsdtCurrency = \`\${'USDT'}-\${CurrencyType}\`;

export type CurrencyPair = CurrencyUsdt | UsdtCurrency;
`,

        { encoding: 'utf-8' },
    );
}

main();
