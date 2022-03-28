import { CurrencyType } from '../../../general/currency.general-type';
import { BaseMethod } from '../../common/base-method.api';
import { GetEndpointEnum } from '../../enums/endpoint.enum';

export type AccountLedgersResDto = {
    // TODO
}

export type AccountLedgersParamsDto = {
    currency?: CurrencyType,
    direction?: 'in' | 'out',
    bizType?: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'SUB_TRANSFER' | 'TRADE_EXCHANGE' | 'MARGIN_EXCHANGE' | 'KUCOIN_BONUS',
    startAt?: string, // mms
    endAt?: string, // mms
}

export class GetAccountLedgersReq extends BaseMethod<AccountLedgersResDto, AccountLedgersParamsDto> {
    constructor(
        params?: AccountLedgersParamsDto,
    ) {
        super(
            'GET',
            GetEndpointEnum.ACCOUNT_LEDGERS,
            params,
        );
    }

    public setParams(params: AccountLedgersParamsDto): this {
        super.setParams(params);

        return this;
    }
}
