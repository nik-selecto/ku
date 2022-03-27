import { WsSubscriptionType } from '../enums/ws-subscription.type';

export type WsPub<T> = {
    id: string,
    type: WsSubscriptionType,
    response: boolean
  } & T;
