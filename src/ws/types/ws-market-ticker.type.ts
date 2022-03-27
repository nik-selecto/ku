import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionTypeEnum } from './enums/ws-subscription.type';
import { WithUSDT } from './general/with-usdt.type';
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
    type: WsSubscriptionTypeEnum,
}

export function publishMarketTicker(
    coins: [WithUSDT, ...WithUSDT[]],
    subscriptionType: WsSubscriptionTypeEnum = WsSubscriptionTypeEnum.SUBSCRIBE,
): PubMarketTickerType {
    return {
        topic: `/market/ticker:${coins.join(',')}`,
        type: subscriptionType,
    };
}

export type MarketTickerCPS = [WsSubjectEnum.TRADE_TICKER, WsPub<PubMarketTickerType>, SubMarketTicker];
