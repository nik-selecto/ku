import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionTypeEnum } from './enums/ws-subscription.type';
import { WsPub } from './general/ws-pub';
import { WithUSDT } from './with-usdt.type';

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

export type PubMarketTickerType = WsPub<{
    topic: `/market/ticker:${string}`
}>

export function publishMarketTicker(
    coins: [WithUSDT, ...WithUSDT[]],
    subscriptionType: WsSubscriptionTypeEnum = WsSubscriptionTypeEnum.SUBSCRIBE,
): PubMarketTickerType {
    return {
        topic: `/market/ticker:${coins.join(',')}`,
        type: subscriptionType,
    };
}
