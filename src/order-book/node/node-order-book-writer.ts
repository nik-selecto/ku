import { KuRequest } from '../../api/index.api';
import { CurrencyPair } from '../../general/currency.general-type';
import { pause } from '../../utils/pause';
import { BestOffer, OrderBookWriterInterface } from '../order-book-writer.interface';

type UniqueKey = `${CurrencyPair}-${number | string}`;
type OrderNote = {
  symbol: CurrencyPair,
  price: string,
  amount: string,
  sequence: string,
  _price: number,
  _amount: number,
  _sequence: number,
}
type MapaType = Map<UniqueKey, OrderNote>;

export class NodeOrderBookWriter implements OrderBookWriterInterface {
    private asksMap!: MapaType;

    private bidsMap!: MapaType;

    private lastAsksTop = [] as BestOffer<'ask'>[];

    private lastBidsTop = [] as BestOffer<'bid'>[];

    constructor() {
        this.asksMap = new Map();
        this.bidsMap = new Map();
    }

    public async completeBookWithHttp(symbol: CurrencyPair) {
        const res = await KuRequest.GET['/api/v1/market/orderbook/level2_100'].symbol(symbol).exec();

        res?.asks.forEach(([price, amount]) => this.writeAsk(symbol, price, amount, res.sequence, 1));

        await pause(500);

        res?.bids.forEach(([price, amount]) => this.writeBid(symbol, price, amount, res.sequence, 1));
    }

    public writeAsk(symbol: CurrencyPair, price: string, amount: string, sequence: string, top: number): BestOffer<'ask'>[] {
        const key = `${symbol}-${price}` as const;
        const _sequence = +sequence;
        const note = this.asksMap.get(key);

        if (note && amount === '0') {
            if (_sequence > note._sequence) {
                this.asksMap.delete(key);
            }
        } else if (amount !== '0' && (!note || _sequence > note._sequence)) {
            this.asksMap.set(key, {
                symbol,
                price,
                sequence,
                amount,
                _sequence,
                _price: parseFloat(price),
                _amount: parseFloat(amount),
            });

            this.generateAsksTop(top);
        }

        console.log('ASK:', this.lastAsksTop[0]?.price);

        return this.lastAsksTop;
    }

    public writeBid(symbol: CurrencyPair, price: string, amount: string, sequence: string, top: number): BestOffer<'bid'>[] {
        const key = `${symbol}-${price}` as const;
        const _sequence = +sequence;
        const note = this.bidsMap.get(key);

        if (note && amount === '0') {
            if (_sequence > note._sequence) {
                this.asksMap.delete(key);
            }
        } else if (amount !== '0' && (!note || _sequence > note._sequence)) {
            this.bidsMap.set(key, {
                symbol,
                price,
                sequence,
                amount,
                _sequence,
                _price: parseFloat(price),
                _amount: parseFloat(amount),
            });

            this.generateBidsTop(top);
        }

        console.log(' '.repeat(20), 'BID:', this.lastBidsTop[0]?.price);

        return this.lastBidsTop;
    }

    private generateAsksTop(top: number = 1) {
        this.lastAsksTop = Array.from(this.asksMap.entries())
            .sort(([, aValue], [, bValue]) => -bValue._price + aValue._price)
            .slice(0, top)
            .map(([, {
                amount, price, symbol,
            }]) => ({
                amount, price, symbol, type: 'ask',
            }));
    }

    private generateBidsTop(top: number) {
        this.lastBidsTop = Array.from(this.asksMap.entries())
            .sort(([, aValue], [, bValue]) => aValue._price - bValue._price)
            .slice(0, top)
            .map(([, {
                amount, price, symbol,
            }]) => ({
                amount, price, symbol, type: 'bid',
            }));
    }
}
