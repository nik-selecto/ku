/* eslint-disable max-classes-per-file */
import { GetEndpointEnum } from '../enums/endpoint.enum';
import { GetAccountsReq } from './account-info/account-info.get.api';
import { AccountLedgersParamsDto, GetAccountLedgersReq } from './account-ledgers/account-ledgers.get.api';
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
}
