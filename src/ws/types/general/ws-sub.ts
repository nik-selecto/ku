import { WsMessageTypeEnum } from '../enums/ws-message-type.enum';

export type WsSub<T> = {
  id: string,
  type: WsMessageTypeEnum.MESSAGE,
} & T;
