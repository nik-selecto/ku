import { TBaseOrderBody } from '../orders.type';

export type TLimitOrderBodyDto = TBaseOrderBody & {
  size: string,

  price: string,

  type: 'limit',
};
