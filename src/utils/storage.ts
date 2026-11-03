import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

// On web, react-native-mmkv's shim throws if accessed outside a browser context (e.g.
// during `expo export --platform web`'s static/SSR rendering pass). Supabase's client
// reads storage eagerly at construction time, so that throw would crash app bootstrap
// on that platform/path. Failing safe here (no-op) only affects that non-primary target;
// native iOS/Android MMKV access is unaffected.
export const mmkvAsyncStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            return mmkv.getString(key) ?? null;
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            mmkv.set(key, value);
        } catch {
            // no-op
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            mmkv.remove(key);
        } catch {
            // no-op
        }
    },
    removeAll: async (): Promise<void> => {
        try {
            mmkv.clearAll();
        } catch {
            // no-op
        }
    },
};