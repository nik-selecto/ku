import { CurrencyPair } from '../general/currency.general-type';

export type OrderBookInputData = {
  symbol: CurrencyPair,
  price: string,
  amount: string,
  seq: string,
};
export type BestOffer<T extends ('ask' | 'bid')> = {
  type: T,
  symbol: CurrencyPair,
  price: string,
  amount: string,
}

export interface OrderBookWriterInterface {
  fromScratch: (preData: {
    asks?: OrderBookInputData,
    bids?: OrderBookInputData,
  }) => Promise<void>;

  writeAsk: (symbol: CurrencyPair, price: string, amount: string, seq: string, top: number) => Promise<BestOffer<'ask'>[]>;

  writeBid: (symbol: CurrencyPair, price: string, amount: string, seq: string, top: number) => Promise<BestOffer<'bid'>[]>;
}
