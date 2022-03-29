import fs from 'fs';
import { join } from 'path';
import { Ku } from '../common/ku';
import { KU_STATE_TYPE } from '../common/ku.mapper';
import { WsSubjectEnum } from '../ws/types/enums/ws-subject.enum';
import { Level2MarketBookCPS } from '../ws/types/ws-market-data-level-2.type';

const acc: Record<string, {
    asks: Record<string, {
        amount: string,
        sequence: string,
    }>,
    bids: Record<string, {
        amount: string,
        sequence: string,
    }>,
}> = {
    'LUNA-USDT': {
        asks: {
        },
        bids: {
        },
    },
};

export async function initOrderBook() {
    const ku = await Ku.init<[
        KU_STATE_TYPE[0]
    ], [
            Level2MarketBookCPS
        ]>(['ws', WsSubjectEnum.TRADE_L2UPDATE]);

    ku.onMessage<Level2MarketBookCPS>(WsSubjectEnum.TRADE_L2UPDATE, (message) => {
        const { changes, symbol } = message.data;
        const { asks, bids } = changes;

        asks.forEach(([price, amount, sequence]) => {
            const _price = (acc as any)[symbol].asks[price];

            if (!_price) {
                (acc as any)[symbol].asks[price] = {
                    amount, sequence,
                };
            } else if (
                parseFloat((acc as any)[symbol].asks[price].sequence) > parseFloat(sequence)
            ) {
                if (parseFloat(amount) === 0) {
                    delete (acc as any)[symbol].asks[price];
                } else {
                    (acc as any)[symbol].asks[price] = {
                        amount, sequence,
                    };
                }
            }
        });
        bids.forEach(([price, amount, sequence]) => {
            const _price = (acc as any)[symbol].bids[price];

            if (!_price) {
                (acc as any)[symbol].bids[price] = {
                    amount, sequence,
                };
            } else if (
                parseFloat((acc as any)[symbol].bids[price].sequence) > parseFloat(sequence)
            ) {
                if (parseFloat(amount) === 0) {
                    delete (acc as any)[symbol].bids[price];
                } else {
                    (acc as any)[symbol].bids[price] = {
                        amount, sequence,
                    };
                }
            }
        });

        fs.writeFile(join(
            __dirname,
            '../../src/order-book',
            'acc.json',
        ), JSON.stringify(acc), { encoding: 'utf-8' }, () => { });
    });
}
