declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_PUBLIC_ENV: 'stg' | 'ppd' | 'prd';
        }
    }
}

export { };

