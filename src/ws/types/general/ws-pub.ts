import { WsSubscriptionTypeEnum } from '../enums/ws-subscription.type';

export type WsPub<T> = {
    id: string,
    type: WsSubscriptionTypeEnum,
    response: boolean
  } & T;
