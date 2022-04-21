import { NodeOrderBookWriter } from './node/node-order-book-writer';
import { PgOrderBookWriter } from './pg/pg-order-book-writer';

export function getOrderBookWriter() {
    return {
        node: new NodeOrderBookWriter(),
        async postgres() {
            return PgOrderBookWriter.connect(true);
        },
    };
}
