/* eslint-disable max-classes-per-file */
import { v4 } from 'uuid';
import { BaseMethod } from '../common/base-method.api';
import { PostEndpointEnum } from '../enums/endpoint.enum';
import { PostBulletPrivateReq } from './bullet/bullet.post.api';
import { LIMIT } from './orders/limit-order/limit-order.post.api';
import { TMarketOrderBody } from './orders/market-order/market-order.type';
import { TOrderRes } from './orders/orders.type';

class PostOrderMarketReq extends BaseMethod<TOrderRes, any, TMarketOrderBody> {
    constructor() {
        super('POST', PostEndpointEnum.ORDERS);
    }

    public setBody(body: TMarketOrderBody) {
        super.setBody(body);

        return this;
    }
}

export const MARKET = (
    side: 'buy' | 'sell',
) => ({
    symbol(symbol: string) {
        return {
            size(sizeOrFunds: string) {
                return new PostOrderMarketReq().setBody({
                    clientOid: v4(),
                    side,
                    type: 'market',
                    symbol,
                    size: sizeOrFunds,
                }) as Pick<PostOrderMarketReq, 'exec'>;
            },
            funds(sizeOrFunds: string) {
                return new PostOrderMarketReq().setBody({
                    clientOid: v4(),
                    side,
                    type: 'market',
                    symbol,
                    funds: sizeOrFunds,
                }) as Pick<PostOrderMarketReq, 'exec'>;
            },
        };
    },
});

export class PostReq {
    public static [PostEndpointEnum.ORDERS] = {
        buy: {
            limit: LIMIT('buy'),
            market: {
                size: MARKET('buy'),
                funds: MARKET('buy'),
            },
        },
        sell: {
            limit: LIMIT('sell'),
            market: MARKET('sell'),
        },
    };

    public static [PostEndpointEnum.BULLET_PRIVATE] = new PostBulletPrivateReq();
}
