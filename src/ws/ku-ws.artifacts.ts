import { ChannelDataType } from '../common/ku.artifacts';
import { WsSubjectEnum } from './ws-types';

type TSubscribe<T extends WsSubjectEnum, U extends {} = {}> = ChannelDataType<T, {
    subject: T,
} & U>;

type TradeTickerMessageType = TSubscribe<WsSubjectEnum.TRADE_TICKER>;
type TradeSnapshotMessageType = TSubscribe<WsSubjectEnum.TRADE_SNAPSHOT>;

export const CONNECTING_WS_EVENT = 'ws-is-connecting';
export const OPEN_WS_EVENT = 'ws-is-open';
export const CLOSE_WS_EVENT = 'ws-is-close';

export type WsStateType = ChannelDataType<'ws', {
    ws: 'open' | 'close',
}>;

export type WsMessagingListType = [
    TradeTickerMessageType,
    TradeSnapshotMessageType,
];
