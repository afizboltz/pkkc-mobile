const supabaseConfigStg = {
    url: "https://gxyedsgrlacvmzvsivyi.supabase.co",
    publishableKey: "sb_publishable_4GLO_EjcJ2gEnK1cB544cA_osX0DJLI",
};

// Environment-based configuration selection, mirroring firebase.config.js.
// ppd/prd don't have a Supabase project yet (they still run on Firebase),
// so this intentionally falls back to stg until those are provisioned.
const getSupabaseConfig = () => {
    const env = process.env.EXPO_PUBLIC_ENV || 'stg';

    switch (env) {
        default:
            return supabaseConfigStg;
    }
};

export default getSupabaseConfig();
