/**
 * Netlify function: EquityMD account deactivation
 * Modes: self | admin | contact
 */
import { createClient } from '@supabase/supabase-js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_NOTIFY = 'justin@brandastic.com';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function stripPrefix(name) {
  return String(name || '').replace(/^\[DEACTIVATED\]\s*/i, '').trim();
}

function isDeactivateSubject(subject = '', message = '') {
  return /deactivat|delete my account|close my account|remove my account|cancel my account/i
    .test(`${subject} ${message}`);
}

async function sendEmail({ to, subject, content }) {
  const key = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY missing');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'EquityMD <hello@equitymd.com>',
      reply_to: 'hello@equitymd.com',
      to,
      subject,
      text: content,
      html: content.split('\n').map((l) => `<p>${l || ' '}</p>`).join(''),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);
  return data;
}

async function deactivateUser(admin, opts) {
  const cleanName = stripPrefix(opts.fullName) || 'there';
  const now = new Date().toISOString();

  const { error: banError } = await admin.auth.admin.updateUserById(opts.userId, {
    ban_duration: '876000h',
  });
  if (banError) throw banError;

  const fullPatch = {
    is_active: false,
    deactivated_at: now,
    deactivation_reason: opts.reason,
    deactivated_by: opts.deactivatedBy,
    full_name: `[DEACTIVATED] ${cleanName === 'there' ? 'User' : cleanName}`,
    email_notifications: { messages: false, deal_updates: false, investment_status: false },
    updated_at: now,
  };

  let { error: profileError } = await admin.from('profiles').update(fullPatch).eq('id', opts.userId);
  if (profileError) {
    const minimal = {
      full_name: fullPatch.full_name,
      email_notifications: fullPatch.email_notifications,
      updated_at: now,
    };
    const r2 = await admin.from('profiles').update(minimal).eq('id', opts.userId);
    if (r2.error) throw r2.error;
  }

  if (opts.notifyUser) {
    await sendEmail({
      to: opts.email,
      subject: 'Your EquityMD account has been deactivated',
      content: [
        `Hi ${cleanName},`,
        '',
        `This confirms that your EquityMD account (${opts.email}) has been deactivated.`,
        '',
        'You will no longer be able to sign in. If this was a mistake or you need anything else, reply to this email.',
        '',
        '— EquityMD Support',
        'hello@equitymd.com',
      ].join('\n'),
    });
  }

  if (opts.notifyAdmin) {
    await sendEmail({
      to: ADMIN_NOTIFY,
      subject: `EquityMD account deactivated: ${opts.email}`,
      content: [
        'An EquityMD account was deactivated.',
        '',
        `Email: ${opts.email}`,
        `User ID: ${opts.userId}`,
        `By: ${opts.deactivatedBy}`,
        `Reason: ${opts.reason}`,
        opts.adminNote ? `Note: ${opts.adminNote}` : '',
      ].filter(Boolean).join('\n'),
    });
  }

  return { userId: opts.userId, email: opts.email, deactivatedAt: now };
}

async function reactivateUser(admin, opts) {
  const cleanName = stripPrefix(opts.fullName) || 'User';
  const now = new Date().toISOString();
  const { error: banError } = await admin.auth.admin.updateUserById(opts.userId, {
    ban_duration: 'none',
  });
  if (banError) throw banError;
  let { error } = await admin.from('profiles').update({
    is_active: true,
    deactivated_at: null,
    deactivation_reason: null,
    deactivated_by: null,
    full_name: cleanName,
    updated_at: now,
  }).eq('id', opts.userId);
  if (error) {
    const r2 = await admin.from('profiles').update({ full_name: cleanName, updated_at: now }).eq('id', opts.userId);
    if (r2.error) throw r2.error;
  }
  return { userId: opts.userId, email: opts.email, reactivatedAt: now };
}

async function handleRequest(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !serviceKey || !anonKey) {
      return json(500, { error: 'Server misconfigured (Supabase keys)' });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const mode = body.mode || 'self';

    if (mode === 'contact') {
      const email = String(body.email || '').trim().toLowerCase();
      const subject = String(body.subject || '');
      const message = String(body.message || '');
      const name = String(body.name || '').trim();
      if (!email || !isDeactivateSubject(subject, message)) {
        return json(200, { success: false, skipped: true, reason: 'not_a_deactivation_request' });
      }
      const { data: profile, error: lookupError } = await admin
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', email)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!profile) {
        await sendEmail({
          to: ADMIN_NOTIFY,
          subject: `EquityMD deactivate request (no account): ${email}`,
          content: `Contact form deactivate request with no matching profile.\n\nName: ${name || '—'}\nEmail: ${email}\nSubject: ${subject}\n\n${message || '—'}`,
        });
        return json(200, { success: false, skipped: true, reason: 'no_matching_account', notifiedAdmin: true });
      }
      if (String(profile.full_name || '').startsWith('[DEACTIVATED]')) {
        return json(200, { success: true, alreadyDeactivated: true, email: profile.email });
      }
      const result = await deactivateUser(admin, {
        userId: profile.id,
        email: profile.email || email,
        fullName: profile.full_name || name,
        reason: (message || '').slice(0, 500) || 'User requested deactivation via contact form',
        deactivatedBy: 'contact_form',
        notifyUser: true,
        notifyAdmin: true,
        adminNote: `Contact form subject: ${subject}`,
      });
      return json(200, { success: true, mode: 'contact', ...result });
    }

    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return json(401, { error: 'Missing authorization' });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json(401, { error: 'Unauthorized' });

    if (mode === 'self') {
      const { data: profile } = await admin.from('profiles').select('id, email, full_name').eq('id', user.id).maybeSingle();
      if (!profile) return json(404, { error: 'Profile not found' });
      if (String(profile.full_name || '').startsWith('[DEACTIVATED]')) return json(200, { success: true, alreadyDeactivated: true });
      const result = await deactivateUser(admin, {
        userId: user.id,
        email: profile.email || user.email || '',
        fullName: profile.full_name,
        reason: String(body.reason || 'Self-serve deactivation from profile settings'),
        deactivatedBy: 'self',
        notifyUser: true,
        notifyAdmin: false,
      });
      return json(200, { success: true, mode: 'self', ...result });
    }

    if (mode === 'admin') {
      const { data: adminProfile } = await admin.from('profiles').select('id, is_admin, email').eq('id', user.id).maybeSingle();
      if (!adminProfile?.is_admin) return json(403, { error: 'Admin only' });
      const targetUserId = String(body.userId || '');
      const action = body.action || 'deactivate';
      if (!targetUserId) return json(400, { error: 'userId required' });
      const { data: target } = await admin.from('profiles').select('id, email, full_name').eq('id', targetUserId).maybeSingle();
      if (!target) return json(404, { error: 'Target user not found' });
      if (action === 'reactivate') {
        const result = await reactivateUser(admin, { userId: target.id, email: target.email, fullName: target.full_name });
        await sendEmail({
          to: ADMIN_NOTIFY,
          subject: `EquityMD account reactivated: ${target.email}`,
          content: `Admin ${adminProfile.email} reactivated ${target.email} (${target.id}).`,
        });
        return json(200, { success: true, mode: 'admin', action, ...result });
      }
      const result = await deactivateUser(admin, {
        userId: target.id,
        email: target.email,
        fullName: target.full_name,
        reason: String(body.reason || 'Deactivated by admin'),
        deactivatedBy: `admin:${user.id}`,
        notifyUser: body.notifyUser !== false,
        notifyAdmin: true,
        adminNote: `Admin: ${adminProfile.email}`,
      });
      return json(200, { success: true, mode: 'admin', action: 'deactivate', ...result });
    }

    return json(400, { error: `Unknown mode: ${mode}` });
  } catch (err) {
    console.error('deactivate-account error', err);
    return json(500, { error: err?.message || 'Internal error' });
  }
};


function headersToGet(headers) {
  const lower = {};
  for (const [k, v] of Object.entries(headers || {})) lower[k.toLowerCase()] = v;
  return {
    get(name) { return lower[String(name).toLowerCase()] || null; },
  };
}

export async function handler(event) {
  const req = {
    method: event.httpMethod || event.method || 'GET',
    headers: headersToGet(event.headers),
    json: async () => JSON.parse(event.body || '{}'),
  };
  const res = await handleRequest(req);
  // Response from handleRequest
  const text = await res.text();
  const outHeaders = {};
  res.headers.forEach((v, k) => { outHeaders[k] = v; });
  return {
    statusCode: res.status,
    headers: outHeaders,
    body: text,
  };
}
