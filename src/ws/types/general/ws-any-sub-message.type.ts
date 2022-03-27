import { WsSubjectEnum } from '../enums/ws-subject.enum';
import { WsMessageTypeType } from './ws-sub-message-type.type';

export type WsSubAnyMessageType = {
    type: WsMessageTypeType,
    subject: WsSubjectEnum,
}
