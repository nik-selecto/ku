/* eslint-disable no-shadow */
export enum ChannelEnum {
    WS_OPEN = 'kuWs.open()',
    WS_CLOSE = 'kuWs.close()'
}

type wsStateType = 'connecting' | 'open' | 'closing' | 'closed';

export const wsStateResolver = ([
    'connecting',
    'open',
    'closing',
    'closed',
] as const).reduce((acc, state, digit) => {
    acc.digitState[digit] = state;
    acc.stateDigit[state] = digit;

    return acc;
}, {
    stateDigit: {} as Record<wsStateType, number>,
    digitState: {} as Record<number, wsStateType>,
});

export type STATE_TYPE = {
    WS: wsStateType,
}

export const STATE: STATE_TYPE = {
    WS: 'closed',
};
