const STORAGE_KEY = 'equitymd_lead_attribution';

export type LeadAttribution = {
  lead_source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  lead_source_note?: string | null;
  admin_starred?: boolean;
  captured_at?: string;
};

function normalizeSource(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (['fb', 'facebook', 'ig', 'instagram', 'meta', 'an', 'paid_social'].includes(v)) return 'meta';
  if (['google', 'adwords', 'gclid', 'youtube'].includes(v) || v.includes('google')) return 'google';
  if (['organic', 'seo'].includes(v)) return 'organic';
  if (['referral', 'partner'].includes(v)) return 'referral';
  return v.slice(0, 40);
}

/** Capture UTMs / fbclid from the current URL into storage. */
export function captureLeadAttributionFromUrl(search = typeof window !== 'undefined' ? window.location.search : ''): LeadAttribution | null {
  try {
    const params = new URLSearchParams(search);
    const utm_source = params.get('utm_source') || params.get('source');
    const utm_medium = params.get('utm_medium') || params.get('medium');
    const utm_campaign = params.get('utm_campaign') || params.get('campaign');
    const fbclid = params.get('fbclid');
    const gclid = params.get('gclid');

    let lead_source =
      normalizeSource(utm_source) ||
      (fbclid ? 'meta' : null) ||
      (gclid ? 'google' : null) ||
      normalizeSource(utm_medium);

    if (!lead_source && fbclid) lead_source = 'meta';

    if (!lead_source && !utm_source && !utm_medium && !utm_campaign && !fbclid && !gclid) {
      return getStoredLeadAttribution();
    }

    const payload: LeadAttribution = {
      lead_source,
      utm_source: utm_source || (fbclid ? 'facebook' : gclid ? 'google' : null),
      utm_medium: utm_medium || (fbclid ? 'paid_social' : gclid ? 'cpc' : null),
      utm_campaign: utm_campaign || null,
      lead_source_note: fbclid ? `fbclid:${fbclid.slice(0, 24)}` : gclid ? `gclid:${gclid.slice(0, 24)}` : null,
      admin_starred: lead_source === 'meta',
      captured_at: new Date().toISOString(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
    return payload;
  } catch {
    return null;
  }
}

export function getStoredLeadAttribution(): LeadAttribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LeadAttribution;
  } catch {
    return null;
  }
}

/** Merge into profiles row when lead_source columns exist. */
export function leadAttributionProfileFields(): Record<string, string | boolean> {
  const a = getStoredLeadAttribution();
  if (!a) return {};
  const out: Record<string, string | boolean> = {};
  if (a.lead_source) out.lead_source = a.lead_source;
  if (a.utm_source) out.utm_source = a.utm_source;
  if (a.utm_medium) out.utm_medium = a.utm_medium;
  if (a.utm_campaign) out.utm_campaign = a.utm_campaign;
  if (a.lead_source_note) out.lead_source_note = a.lead_source_note;
  if (a.lead_source === 'meta' || a.admin_starred) out.admin_starred = true;
  return out;
}

/** Merge into investor_profiles.investment_preferences (works without schema migration). */
export function leadAttributionPreferenceFields(
  existing?: Record<string, any> | null
): Record<string, any> {
  const a = getStoredLeadAttribution();
  const base = { ...(existing || {}) };
  if (!a) return base;
  if (a.lead_source) base.lead_source = a.lead_source;
  if (a.utm_source) base.utm_source = a.utm_source;
  if (a.utm_medium) base.utm_medium = a.utm_medium;
  if (a.utm_campaign) base.utm_campaign = a.utm_campaign;
  if (a.lead_source_note) base.lead_source_note = a.lead_source_note;
  if (a.lead_source === 'meta' || a.admin_starred) base.admin_starred = true;
  if (a.captured_at) base.lead_captured_at = a.captured_at;
  return base;
}

export function readLeadFromPreferences(prefs?: Record<string, any> | null): LeadAttribution {
  if (!prefs) return {};
  return {
    lead_source: prefs.lead_source || null,
    utm_source: prefs.utm_source || null,
    utm_medium: prefs.utm_medium || null,
    utm_campaign: prefs.utm_campaign || null,
    lead_source_note: prefs.lead_source_note || null,
    admin_starred: !!prefs.admin_starred,
  };
}

export function leadSourceLabel(source?: string | null): string {
  if (!source) return '';
  const map: Record<string, string> = {
    meta: 'Meta',
    google: 'Google',
    organic: 'Organic',
    referral: 'Referral',
    admin: 'Admin',
    other: 'Other',
  };
  return map[source] || source;
}
