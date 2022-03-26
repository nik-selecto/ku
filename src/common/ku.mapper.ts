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
            subscribes: string[],
            unsubscribes: string[],
        },
    ],
];
export const KU_DEFAULT_BEGIN_STATES_ACC: KU_ALL_STATE_TYPE = [
    [
        'ws',
        {
            ws: 'close',
            subscribes: [],
            unsubscribes: [],
        },
    ],
];
export type StateMapper = ArrElement<KU_ALL_STATE_TYPE>;

// --- PUBSUB ---
export type ChannelPubSub<
    Channel extends string = string,
    Pub extends {} = {},
    Sub extends {} = {}> = [Channel, Pub, Sub];
