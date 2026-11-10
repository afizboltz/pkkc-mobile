declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_PUBLIC_ENV: 'stg' | 'ppd' | 'prd';
            // Only set for environments that have a Supabase project provisioned
            // (stg for now; ppd/prd remain on Firebase until they're migrated too).
            EXPO_PUBLIC_SUPABASE_URL?: string;
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
        }
    }
}

export { };

