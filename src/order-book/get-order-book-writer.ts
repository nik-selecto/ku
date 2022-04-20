import { PgOrderBookWriter } from './pg/pg-order-book-writer';

export function getOrderBookWriter(dbType: 'mongo' | 'postgres') {
    if (dbType === 'mongo') {
        throw new Error('order-book-writer for mongo is not implemented yet');
    }

    return new PgOrderBookWriter();
}
