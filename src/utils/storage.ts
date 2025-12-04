import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export const mmkvAsyncStorage = {
    getItem: async (key: string): Promise<string | null> => {
        const value = mmkv.getString(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        mmkv.set(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        mmkv.remove(key);
    },
    removeAll: async (): Promise<void> => {
        mmkv.clearAll();
    },
};