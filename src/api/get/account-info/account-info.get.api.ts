/* eslint-disable max-classes-per-file */
import { BaseMethod } from '../../common/base-method.api';
import { GetEndpointEnum } from '../../enums/endpoint.enum';
import { AccountInfoParamsDto, AccountInfoResDto } from './account-info.type';

export class GetAccountsReq extends BaseMethod<AccountInfoResDto, AccountInfoParamsDto> {
    constructor(
        params?: object,
    ) {
        super(
            'GET',
            GetEndpointEnum.ACCOUNTS,
            params,
        );
    }

    public setParams(params: AccountInfoParamsDto) {
        super.setParams(params);

        return this;
    }
}
