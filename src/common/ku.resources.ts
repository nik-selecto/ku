// eslint-disable-next-line no-use-before-define
export type OffCbType = (...args: any[]) => void;
export type PreCbAndGuardType<TState> = (actual: TState, expected?: Partial<TState>) => boolean;
export type DefaultChannelsType = 'rm-listener' | 'redis-down';

export function defaultPreCbGuard<TState>(actual: TState, expected?: Partial<TState>) {
    if (!expected) return true;

    return !(Object.entries(expected) as [keyof TState, any][]).some(([k, v]) => actual[k] !== v);
}

export const CHANNEL_RM_LISTENER = 'rm-listener';
export const CHANNEL_REDIS_DOWN = 'redis-down';
export const DEFAULT_CHANNELS: DefaultChannelsType[] = [
    CHANNEL_RM_LISTENER,
    CHANNEL_REDIS_DOWN,
];
export const KU_ALREADY_INIT = 'ku-is-already-init';
export const KU_ALREADY_DOWN = 'ku-is-already-down';
export const MESSAGE = 'message' as const;
export const PROPOSITION_POSTFIX = '-proposition' as const;
export const STR_EMPTY_OBJ = '{}' as const;
