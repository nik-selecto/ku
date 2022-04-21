import { Ku } from '../common/ku';
import { KU_STATE_TYPE } from '../common/ku.mapper';
import { WsSubjectEnum } from '../ws/types/enums/ws-subject.enum';
import { Level2MarketBookCPS } from '../ws/types/ws-market-data-level-2.type';
import { getOrderBookWriter } from './get-order-book-writer';

export async function initOrderBook() {
    const writer = await getOrderBookWriter().node;
    const ku = await Ku.init<[
        KU_STATE_TYPE[0]
    ], [
            Level2MarketBookCPS
        ]>(['ws', WsSubjectEnum.TRADE_L2UPDATE]);

    ku.onMessage<Level2MarketBookCPS>(WsSubjectEnum.TRADE_L2UPDATE, (message) => {
        const { changes, symbol } = message.data;
        const { asks, bids } = changes;

        asks.forEach(([price, amount, sequence]) => {
            writer.writeAsk(symbol, price, amount, sequence, 1);
        });
        bids.forEach(([price, amount, sequence]) => {
            writer.writeBid(symbol, price, amount, sequence, 1);
        });
    });
}
