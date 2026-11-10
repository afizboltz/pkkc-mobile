// src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";

import supabaseConfig from "../../supabase.config";
import type { Database } from "../types/supabase";
import { mmkvAsyncStorage } from "../utils/storage";

export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.publishableKey,
  {
    auth: {
      storage: mmkvAsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
