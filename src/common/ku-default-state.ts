// eslint-disable-next-line no-shadow
export enum StateNameEnum {
    WS = 'ws',
}

export const KU_DEFAULT_BEGIN_STATES_ACC: [StateNameEnum, Record<string, any>][] = [
    [StateNameEnum.WS, {
        ws: 'close' as const,
        subscriptions: [],
    }],
];
