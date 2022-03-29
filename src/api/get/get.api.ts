/* eslint-disable max-classes-per-file */
import { CurrencyPair } from '../../general/currency.general-type';
import { GetEndpointEnum } from '../enums/endpoint.enum';
import { GetAccountsReq } from './account-info/account-info.get.api';
import { AccountLedgersParamsDto, GetAccountLedgersReq } from './account-ledgers/account-ledgers.get.api';
import { Level2OrderBookReq } from './order-book/level-2.get.api';
import { GetOrderInfoReq } from './order-info/order-info.get.api';

export class GetReq {
    public static [GetEndpointEnum.ACCOUNTS] = new GetAccountsReq();

    public static [GetEndpointEnum.ORDER] = {
        orderId(orderId: string) {
            return new GetOrderInfoReq(orderId);
        },
    };

    public static [GetEndpointEnum.ACCOUNT_LEDGERS] = {
        setParams(params: AccountLedgersParamsDto) {
            return new GetAccountLedgersReq(params);
        },
        exec() {
            return new GetAccountLedgersReq().exec();
        },
    };

    public static [GetEndpointEnum.ORDER_BOOK_LEVEL_2_20] = {
        symbol(s: CurrencyPair) {
            return new Level2OrderBookReq(GetEndpointEnum.ORDER_BOOK_LEVEL_2_20, s);
        },
    };

    public static [GetEndpointEnum.ORDER_BOOK_LEVEL_2_100] = {
        symbol(s: CurrencyPair) {
            return new Level2OrderBookReq(GetEndpointEnum.ORDER_BOOK_LEVEL_2_100, s);
        },
    };

    public static [GetEndpointEnum.ORDER_BOOK_V3_LEVEL_2] = {
        symbol(s: CurrencyPair) {
            return new Level2OrderBookReq(GetEndpointEnum.ORDER_BOOK_V3_LEVEL_2, s);
        },
    };
}
