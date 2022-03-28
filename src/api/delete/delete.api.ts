import { DeleteEndpointEnum } from '../enums/endpoint.enum';
import { CancelOrderReq } from './cancel-order/cancel-order.delete.api';

export class DeleteReq {
    public static [DeleteEndpointEnum.CANCEL_ORDER] = {

        orderId(id: string) {
            return new CancelOrderReq(id);
        },

    };
}
