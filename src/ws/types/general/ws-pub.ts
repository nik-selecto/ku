import { WsSubscriptionTypeEnum } from '../enums/ws-subscription.type';

export type WsPub<T> = {
    type: WsSubscriptionTypeEnum,
  } & T;
