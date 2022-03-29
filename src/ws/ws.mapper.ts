import { AccountBalanceCPS } from './types/ws-account-balance.type';
import { Level2MarketBookCPS } from './types/ws-market-data-level-2.type';
import { MarketTickerCPS } from './types/ws-market-ticker.type';

export type WsSendCPS = ['ws-send', {}, {}];

export type WS_MAPPER = [
    WsSendCPS,
    MarketTickerCPS,
    AccountBalanceCPS,
    Level2MarketBookCPS,
];
