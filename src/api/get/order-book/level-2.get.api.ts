import { CurrencyPair } from '../../../general/currency.general-type';
import { BaseMethod } from '../../common/base-method.api';
import { GetEndpointEnum } from '../../enums/endpoint.enum';

export type OrderBookLevel2ResDto = {
    sequence: string,
    time: number,
    bids: [string, string][], // [price，size][],
    asks: [string, string][], // [price，size][],
};

export type OrderBookLevel2ParamsDto = {
    symbol: CurrencyPair,
}

export class Level2OrderBookReq extends BaseMethod<OrderBookLevel2ResDto, OrderBookLevel2ParamsDto> {
    constructor(deep: 20 | 100, symbol: CurrencyPair) {
        super('GET', deep === 20 ? GetEndpointEnum.ORDER_BOOK_LEVEL_2_20 : GetEndpointEnum.ORDER_BOOK_LEVEL_2_100, {
            symbol,
        });
    }
}
