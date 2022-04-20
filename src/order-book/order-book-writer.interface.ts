import { CurrencyPair } from '../general/currency.general-type';

export type OrderBookInputData = {
  symbol: CurrencyPair,
  price: string,
  amount: string,
  seq: string,
  top: number,
};
export type BestOffer<T extends ('ask' | 'bid')> = {
  type: T,
  symbol: CurrencyPair,
  price: string,
  amount: string,
}

export interface OrderBookWriterInterface {
  fromScratch: (preData: {
    asks?: Omit<OrderBookInputData, 'top'>,
    bids?: Omit<OrderBookInputData, 'top'>,
  }) => Promise<void>;

  writeAsk: (data: OrderBookInputData) => Promise<BestOffer<'ask'>[]>;

  writeBid: (data: OrderBookInputData) => Promise<BestOffer<'bid'>[]>;
}
