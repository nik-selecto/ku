// --- STATE ---
export type ArrElement<TArr extends unknown[]> = TArr extends (infer ElementType)[]
    ? ElementType
    : never;
export type DuetType<FirstItem, SecondItem> = [FirstItem, SecondItem];
export type KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close' | 'open',
            subscriptions: string[],
        },
    ],
];
export const KU_DEFAULT_BEGIN_STATES_ACC: KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close',
            subscriptions: [],
        },
    ],
];
export type StateMapper = ArrElement<KU_ALL_STATE_TYPE>;

// --- PUBSUB ---
export type PubSub<
    T extends string,
    Pub extends {} = {},
    Sub extends {} = {}> = DuetType<
        DuetType<T, Pub>,
        DuetType<`sub ${T}`, Sub>
    >;
