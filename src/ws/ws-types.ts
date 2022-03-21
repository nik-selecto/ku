type WsMessageTypeType = 'message' | 'ack' | 'welcome' | 'error';

export interface IWsMessage {
    type: WsMessageTypeType,
}
