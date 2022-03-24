import { KU_ALL_STATE_TYPE } from '../common/ku-default-state';

export const CONNECTING_WS_EVENT = 'ws-is-connecting';
export const OPEN_WS_EVENT = 'ws-is-open';
export const CLOSE_WS_EVENT = 'ws-is-close';

export type WsStateType = KU_ALL_STATE_TYPE[0];

export type WsMessagingListType = [
    KU_ALL_STATE_TYPE[1],
    KU_ALL_STATE_TYPE[2],
];
