import { BaseMethod } from '../../common/base-method.api';
import { PostEndpointEnum } from '../../enums/endpoint.enum';
import { TBulletPrivateRes } from './bullet.type';

export class PostBulletPrivateReq extends BaseMethod<TBulletPrivateRes> {
    constructor() {
        super('POST', PostEndpointEnum.BULLET_PRIVATE);
    }
}
