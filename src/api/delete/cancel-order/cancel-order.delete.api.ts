import { BaseMethod } from '../../common/base-method.api';
import { DeleteEndpointEnum } from '../../enums/endpoint.enum';

export type CancelOrderResDtoType = { cancelledOrderIds: string[] };

export class CancelOrderReq extends BaseMethod<CancelOrderResDtoType> {
    constructor(orderId: string) {
        super('DELETE', `${DeleteEndpointEnum.CANCEL_ORDER}/${orderId}`);
    }
}
