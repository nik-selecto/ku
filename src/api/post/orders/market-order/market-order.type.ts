import { TBaseOrderBody } from '../orders.type';

// requires one of 'size' or 'funds' properties
export type TMarketOrderBody = TBaseOrderBody & {
  type: 'market',

  size?: string,

  funds?: string,
};
