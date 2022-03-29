import { CurrencyPair } from '../../general/currency.general-type';
import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionType } from './enums/ws-subscription.type';
import { WsPub } from './general/ws-pub';
import { WsSub } from './general/ws-sub';

const marketDataLevel2 = '/market/level2:' as const;
type MarketDataLevel2Url = `${typeof marketDataLevel2}${string}`;
const generateMarketLevel2Url = (coins: CurrencyPair[]): MarketDataLevel2Url => marketDataLevel2 + coins.join(',') as MarketDataLevel2Url;

export type PubLevel2MarketData = {
    topic: `${typeof marketDataLevel2}${string}`,
    type: WsSubscriptionType,
};

export type SubLevel2MarketData = WsSub<{
    topic: string,
    subject: WsSubjectEnum.TRADE_L2UPDATE,
    data: {
        sequenceStart: number,
        sequenceEnd: number,
        symbol: CurrencyPair,
        changes: {

            asks: [string, string, string][], // price, size, sequence
            bids: [string, string, string][],
        },
    },
}>;

export function publishLevel2MarketData(coins: [CurrencyPair, ...CurrencyPair[]], subsciptionType: WsSubscriptionType = 'subscribe'): PubLevel2MarketData {
    return {
        type: subsciptionType,
        topic: generateMarketLevel2Url(coins),
    };
}

export type Level2MarketBookCPS = [WsSubjectEnum.TRADE_L2UPDATE, WsPub<PubLevel2MarketData>, SubLevel2MarketData];
