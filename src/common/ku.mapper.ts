import { TradeTickerPubType, TradeTickerSubType, WsSubjectEnum } from '../ws/ws-types';

// --- STATE ---
export type ArrElement<TArr extends unknown[]> = TArr extends (infer ElementType)[]
    ? ElementType
    : never;
export type KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close' | 'open',
            send: string,
        },
    ],
];
export const KU_DEFAULT_BEGIN_STATES_ACC: [
    ArrElement<KU_ALL_STATE_TYPE>[0],
    Partial<ArrElement<KU_ALL_STATE_TYPE>[1]>
][] = [
    [
        'ws',
        {
            ws: 'close',
        },
    ],
];
export type WsSubjectPubSub = [
    [WsSubjectEnum.TRADE_TICKER,
        TradeTickerPubType,
        TradeTickerSubType],
    [WsSubjectEnum.TRADE_SNAPSHOT,
        {},
        {}]
];
export type WsSendChannel = 'ws-send';
