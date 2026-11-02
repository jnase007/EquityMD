import { supabase } from './supabase';

type DeactivateBody = Record<string, unknown>;

/**
 * Call Netlify deactivate-account function (preferred), with Supabase edge fallback.
 */
export async function invokeDeactivateAccount(body: DeactivateBody) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Prefer same-origin Netlify function
  try {
    const res = await fetch('/.netlify/functions/deactivate-account', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { data, error: null as null };
    // Fall through to supabase edge if function missing (404)
    if (res.status !== 404) {
      return { data, error: new Error(data?.error || `HTTP ${res.status}`) };
    }
  } catch (err) {
    console.warn('Netlify deactivate-account failed, trying Supabase edge', err);
  }

  const { data, error } = await supabase.functions.invoke('deactivate-account', { body });
  return { data, error };
}
