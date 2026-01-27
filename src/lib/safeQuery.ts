import { supabase } from './supabase';

/**
 * Safe query wrapper that automatically retries on auth failures.
 * Handles JWT expiry and 401 errors by refreshing the session and retrying once.
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  let result = await queryFn();

  // Check for auth-related errors
  const isAuthError = 
    result.error?.message?.includes('JWT') || 
    result.error?.message?.includes('token') ||
    result.error?.code === '401' ||
    result.error?.code === 'PGRST301' || // JWT expired
    result.error?.message?.includes('Invalid Refresh Token');

  if (isAuthError || (!result.data && result.error)) {
    console.log('safeQuery: Auth failure detected — refreshing session and retrying');
    
    try {
      await supabase.auth.refreshSession();
      result = await queryFn(); // Retry once after refresh
    } catch (refreshError) {
      console.error('safeQuery: Refresh failed:', refreshError);
    }
  }

  if (result.error) {
    console.error('safeQuery: Query failed:', result.error);
    throw result.error;
  }

  return result.data;
}

/**
 * Safe query wrapper that returns the result without throwing.
 * Useful for optional data fetching where errors should be handled gracefully.
 */
export async function safeQuerySilent<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  let result = await queryFn();

  const isAuthError = 
    result.error?.message?.includes('JWT') || 
    result.error?.message?.includes('token') ||
    result.error?.code === '401' ||
    result.error?.code === 'PGRST301';

  if (isAuthError) {
    console.log('safeQuerySilent: Auth failure — refreshing session and retrying');
    
    try {
      await supabase.auth.refreshSession();
      result = await queryFn();
    } catch (refreshError) {
      console.error('safeQuerySilent: Refresh failed:', refreshError);
    }
  }

  return result;
}
