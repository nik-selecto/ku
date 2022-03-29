import { CurrencyPair } from '../../general/currency.general-type';
import { WsSubjectEnum } from './enums/ws-subject.enum';
import { WsSubscriptionType } from './enums/ws-subscription.type';
import { WsPub } from './general/ws-pub';
import { WsSub } from './general/ws-sub';

const level2with5best = '/spotMarket/level2Depth5:' as const;
const level2with50best = '/spotMarket/level2Depth50:' as const;
type MarketDataLevel2Best5Url = `${typeof level2with5best}${string}`;
type MarketDataLevel2Best50Url = `${typeof level2with5best}${string}`;
const generateLevel2BestUrl5 = (coins: CurrencyPair[]): MarketDataLevel2Best5Url => level2with5best + coins.join(',') as MarketDataLevel2Best5Url;
const generateLevel2BestUrl50 = (coins: CurrencyPair[]): MarketDataLevel2Best5Url => level2with50best + coins.join(',') as MarketDataLevel2Best50Url;

export type PubLevel2BestMarketData = {
    topic: `${MarketDataLevel2Best50Url | MarketDataLevel2Best5Url}${string}`,
    type: WsSubscriptionType,
};

export type SubLevel2Best5 = WsSub<{
    topic: string,
    subject: WsSubjectEnum.LEVEL2,
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

export type SubLevel2Best50 = Omit<SubLevel2Best5, 'topic' | 'subject'> & {
    topic: MarketDataLevel2Best50Url,
    subject: WsSubjectEnum.LEVEL2,
}

export function publishLevel2Best5(
    coins: [CurrencyPair, ...CurrencyPair[]],
    subsciptionType: WsSubscriptionType = 'subscribe',
): PubLevel2BestMarketData {
    return {
        type: subsciptionType,
        topic: generateLevel2BestUrl5(coins),
    };
}

export function publishLevel2Best50(
    coins: [CurrencyPair, ...CurrencyPair[]],
    subsciptionType: WsSubscriptionType = 'subscribe',
): PubLevel2BestMarketData {
    return {
        type: subsciptionType,
        topic: generateLevel2BestUrl50(coins),
    };
}

export type Level2Best5CPS = [WsSubjectEnum.LEVEL2, WsPub<PubLevel2BestMarketData>, SubLevel2Best5];
export type Level2Best50CPS = [WsSubjectEnum.LEVEL2, WsPub<PubLevel2BestMarketData>, SubLevel2Best50];
