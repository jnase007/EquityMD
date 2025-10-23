import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the appropriate client based on environment variables
export const supabase: SupabaseClient =
  !supabaseUrl || !supabaseKey
    ? (() => {
        console.warn(
          "⚠️ Missing Supabase environment variables. Using mock client for development."
        );
        // Return a minimal mock that matches the expected interface
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            signUp: async () => ({ data: { user: null }, error: null }),
            signIn: async () => ({ data: { user: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
          },
          from: () => ({
            select: () => ({
              eq: () => ({ single: async () => ({ data: null, error: null }) }),
            }),
            insert: async () => ({ data: null, error: null }),
            update: async () => ({ data: null, error: null }),
            delete: async () => ({ data: null, error: null }),
          }),
          functions: {
            invoke: async () => ({ data: null, error: null }),
          },
        } as any;
      })()
    : createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      });
