import { AccountBalanceCPS } from './types/ws-account-balance.type';
import { MarketTickerCPS } from './types/ws-market-ticker.type';

export type WsSendCPS = ['ws-send', {}, {}];

export type WS_MAPPER = [
    WsSendCPS,
    MarketTickerCPS,
    AccountBalanceCPS,
];
