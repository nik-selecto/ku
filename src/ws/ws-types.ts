type WsMessageTypeType = 'message' | 'ack' | 'welcome' | 'error';
type WsSubscribeUnsubscribeType = 'subscribe' | 'unsubscribe';
// eslint-disable-next-line no-shadow
export enum WsSubjectEnum {
    TRADE_TICKER = 'trade.ticker',
    TRADE_SNAPSHOT = 'trade.snapshot',
    // TRADE_L2UPDATE = 'trade.l2update',
    // LEVEL2 = 'level2',
    // TRADE_CANDLES_UPDATE = 'trade.candles.update',
    // TRADE_L3MATCH = 'trade.l3match',
    // TICK = 'tick',
    // FUNDING_UPDATE = 'funding.update',
    // ORDER_CHANGE = 'orderChange',
    // ACCOUNT_BALANCE = 'account.balance',
    // DEBT_RATIO = 'debt.ratio',
    // POSITION_STATUS = 'position.status',
    // ORDER_OPEN = 'order.open',
    // ORDER_UPDATE = 'order.update',
    // ORDER_DONE = 'order.done',
    // STOP_ORDER = 'stopOrder',
}

export interface IWsMessage {
    type: WsMessageTypeType,
    subject?: WsSubjectEnum,
    topic?: string, // TODO
}

type MarketTickerTopicType = `/market/ticker:${string}-USDT`;

export type TradeTickerSubType = {
    type: 'message',
    topic: MarketTickerTopicType,
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
}

export type TradeTickerPubType = {
    type: WsSubscribeUnsubscribeType,
    topic: MarketTickerTopicType,
}
