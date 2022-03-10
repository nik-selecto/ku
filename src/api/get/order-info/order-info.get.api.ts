import { BaseMethod } from '../../common/base-method.api';
import { GetEndpointEnum } from '../../enums/endpoint.enum';
import { OrderInfoParamsDto, OrderInfoResDto } from './order-info.type';

export class GetOrderInfoReq extends BaseMethod<OrderInfoResDto, OrderInfoParamsDto> {
    constructor(orderId: string) {
        super('GET', `${GetEndpointEnum.ORDER}/${orderId}`);
    }
}
