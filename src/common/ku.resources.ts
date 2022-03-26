export type ChannelDataType<TChannel extends string, TData extends {}> = [TChannel, TData];

// eslint-disable-next-line no-use-before-define
export type OffCbType = (...args: any[]) => void;
export type RmListenerType = { offCb: OffCbType, channel: string };
export type AssertionCbType<TState> = (actual: TState, expected: Partial<TState>) => boolean;
export type DefaultChannelsType = 'rm-listener' | 'redis-down';

export function defaultAssertionCb<TState>(actual: TState, expected: Partial<TState>) {
    return !(Object.entries(expected) as [keyof TState, any][]).some(([k, v]) => actual[k] !== v);
}

export const DEFAULT_CHANNELS: DefaultChannelsType[] = [
    'rm-listener',
    'redis-down',
];
export const KU_ALREADY_INIT = 'ku-is-already-init';
export const KU_ALREADY_DOWN = 'ku-is-already-down';
export const MESSAGE = 'message' as const;
export const PROPOSITION_POSTFIX = '-proposition' as const;
export const STR_EMPTY_OBJ = '{}' as const;
