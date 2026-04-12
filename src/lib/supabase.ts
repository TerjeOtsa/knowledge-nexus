import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing env vars!', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    anonKey: supabaseAnonKey ? 'SET' : 'MISSING',
  });
}

/**
 * Browser-side Supabase client (lazy singleton).
 * Uses the anon key for public operations.
 */
let _browserClient: SupabaseClient | null = null;
export function getSupabaseClient() {
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}
// Keep a named export for backward compat
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : (null as unknown as SupabaseClient);

/**
 * Server-side Supabase client with service role key.
 * Use this only in API routes / server actions.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  console.log('[Supabase] createServerClient URL:', url?.substring(0, 40));
  return createClient(url, serviceRoleKey);
}
