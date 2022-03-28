import { DeleteEndpointEnum } from '../enums/endpoint.enum';
import { CancelAllOrdersParamsDto, CancelAllOrdersReq } from './cancel-order/cancel-all-orders.delete.api';
import { CancelOrderReq } from './cancel-order/cancel-order.delete.api';

export class DeleteReq {
    public static [DeleteEndpointEnum.CANCEL_ORDER] = {

        orderId(id: string) {
            return new CancelOrderReq(id);
        },

    };

    public static ['cancel/all/orders'] = {
        setParams(params: CancelAllOrdersParamsDto) {
            return new CancelAllOrdersReq(params);
        },

        exec() {
            return new CancelAllOrdersReq().exec();
        },
    };
}
