type StatePropResolverType<ValueT> = {
    stringify: (v: ValueT) => string,
    jsonify: (s: string) => ValueT,
    beginValue: ValueT,
}

type RedisStateValueType = 'up' | 'down';
type WsStateValueType = 'open' | 'close';

export type STATE_TYPE = {
    ws: StatePropResolverType<WsStateValueType>,
    redis: StatePropResolverType<RedisStateValueType>
}

export const STATE: STATE_TYPE = {
    redis: {
        stringify: (v) => v,
        jsonify: (s) => s as RedisStateValueType,
        beginValue: 'down',
    },
    ws: {
        stringify: (v) => v,
        jsonify: (s) => s as WsStateValueType,
        beginValue: 'close',
    },
};

export const BEGIN_STATE_ENTRIES = Object.entries(STATE).map(([prop, { beginValue }]) => ({ [prop]: beginValue }));
