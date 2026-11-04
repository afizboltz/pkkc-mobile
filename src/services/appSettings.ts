import { supabase } from "../config/supabase";
import { mmkvAsyncStorage } from "../utils/storage";

const CACHE_PREFIX = "appSetting:";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CacheEntry<T> = { value: T; cachedAt: number };

// Reads a flag from `app_settings`, cached in MMKV so the login screen never
// blocks on network and never shows nothing while offline. Defaults to
// `fallback` until the first successful fetch lands.
export const getAppSetting = async <T>(key: string, fallback: T): Promise<T> => {
    const cacheKey = `${CACHE_PREFIX}${key}`;

    try {
        const { data, error } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", key)
            .maybeSingle();

        if (!error && data) {
            const value = data.value as T;
            await mmkvAsyncStorage.setItem(cacheKey, JSON.stringify({ value, cachedAt: Date.now() }));
            return value;
        }
    } catch {
        // fall through to cache/fallback below
    }

    try {
        const cached = await mmkvAsyncStorage.getItem(cacheKey);
        if (cached) {
            const entry: CacheEntry<T> = JSON.parse(cached);
            if (Date.now() - entry.cachedAt < CACHE_TTL_MS) {
                return entry.value;
            }
        }
    } catch {
        // ignore, fall back below
    }

    return fallback;
};
