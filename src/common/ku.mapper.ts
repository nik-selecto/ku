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
export type WsSendChannel = 'ws-send';
export type StateMapper = ArrElement<KU_ALL_STATE_TYPE>;
