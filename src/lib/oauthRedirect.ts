/**
 * OAuth must redirect to a URL listed in Supabase Dashboard → Authentication → URL Configuration
 * (Redirect URLs). Deep paths like /dashboard often fail if only the Site URL root is allowed.
 * We store the intended path here and redirect client-side after tokens are in session.
 */
export const OAUTH_NEXT_PATH_KEY = 'equitymd_oauth_next';

export function setOAuthNextPath(path: string) {
  if (path && path.startsWith('/')) {
    sessionStorage.setItem(OAUTH_NEXT_PATH_KEY, path);
  }
}

export function consumeOAuthNextPath(): string | null {
  const p = sessionStorage.getItem(OAUTH_NEXT_PATH_KEY);
  if (p && p.startsWith('/')) {
    sessionStorage.removeItem(OAUTH_NEXT_PATH_KEY);
    return p;
  }
  return null;
}

/** Call after email/password sign-in so a stale OAuth intent does not redirect later. */
export function clearOAuthNextPath() {
  sessionStorage.removeItem(OAUTH_NEXT_PATH_KEY);
}
