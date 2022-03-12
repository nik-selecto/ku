/* eslint-disable no-shadow */
export type StateTumbler = 'not' | 'yes';

export enum ChannelEnum {
    WS_NEW = 'new KuWs()',
    WS_OPEN = 'kuWs.open()',
}

export const GLOBAL_STATE: Record<ChannelEnum, StateTumbler> = {
    [ChannelEnum.WS_NEW]: 'not',
    [ChannelEnum.WS_OPEN]: 'not',
};

export type REDIS_DB = {

}
