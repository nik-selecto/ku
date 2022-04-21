import { PgOrderBookWriter } from './pg/pg-order-book-writer';

export function getOrderBookWriter(dbType: 'mongo' | 'postgres') {
    if (dbType === 'mongo') {
        throw new Error('order-book-writer for mongo is not implemented yet');
    }

    return {
        async freshDb() {
            return PgOrderBookWriter.connect(true);
        },
        // TODO not fresh, with preload data etc.
    };
}
