import { CurrencyUsdt } from '../../general/currency.general-type';
import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionType } from './enums/ws-subscription.type';
import { WsPub } from './general/ws-pub';

export type SubMarketTicker = WsPub<{
    topic: string,
    subject: WsSubjectEnum.TRADE_TICKER,
    data: {
        sequence: string, // Sequence number
        price: string, // Last traded price
        size: string, //  Last traded amount
        bestAsk: string, // Best ask price
        bestAskSize: string, // Best ask size
        bestBid: string, // Best bid price
        bestBidSize: string // Best bid size
    }
}>

export type PubMarketTickerType = {
    topic: `/market/ticker:${string}`
    type: WsSubscriptionType,
}

export function publishMarketTicker(
    coins: [CurrencyUsdt, ...CurrencyUsdt[]],
    subscriptionType: WsSubscriptionType = 'subscribe',
): PubMarketTickerType {
    return {
        topic: `/market/ticker:${coins.join(',')}`,
        type: subscriptionType,
    };
}

export type MarketTickerCPS = [WsSubjectEnum.TRADE_TICKER, WsPub<PubMarketTickerType>, SubMarketTicker];
