import { ArrayElement } from '../utils/arr-el.type';
import { WsSubjectEnum } from '../ws/ws-types';
import { ChannelDataType } from './ku.resources';

type TSubscribe<T extends WsSubjectEnum, U extends {} = {}> = ChannelDataType<T, {
    subject: T,
} & U>;

type TradeTickerMessageType = TSubscribe<WsSubjectEnum.TRADE_TICKER>;
type TradeSnapshotMessageType = TSubscribe<WsSubjectEnum.TRADE_SNAPSHOT>;

export type KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close' | 'open',
            subscriptions: string[],
        },
    ],
    TradeTickerMessageType,
    TradeSnapshotMessageType,
];

export const KU_DEFAULT_BEGIN_STATES_ACC: KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close',
            subscriptions: [],
        },
    ],
    [
        WsSubjectEnum.TRADE_TICKER,
        {
            subject: WsSubjectEnum.TRADE_TICKER,
        },
    ],
    [
        WsSubjectEnum.TRADE_SNAPSHOT,
        {
            subject: WsSubjectEnum.TRADE_SNAPSHOT,
        },
    ],
];

export type TChannelMapper = ArrayElement<typeof KU_DEFAULT_BEGIN_STATES_ACC>;
