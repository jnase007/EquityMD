/**
 * deactivate-account
 *
 * Modes:
 *  - self: authenticated user deactivates their own account
 *  - admin: authenticated admin deactivates/reactivates a target user
 *  - contact: contact-form auto path when subject requests deactivation
 *
 * Actions on deactivate:
 *  - ban auth user (blocks login)
 *  - mark profiles.is_active=false + deactivated_* fields + [DEACTIVATED] name prefix
 *  - turn off email_notifications
 *  - send confirmation email to the user (Resend via send-email)
 *  - notify justin@brandastic.com for contact/admin paths
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ADMIN_NOTIFY = "justin@brandastic.com";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripDeactivatedPrefix(name: string | null | undefined) {
  return (name || "").replace(/^\[DEACTIVATED\]\s*/i, "").trim();
}

function isDeactivateSubject(subject: string, message = "") {
  const s = `${subject} ${message}`.toLowerCase();
  return /deactivat|delete my account|close my account|remove my account|cancel my account/
    .test(s);
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  content: string;
}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("send-email failed", res.status, data);
    throw new Error(`send-email failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function deactivateUser(
  admin: ReturnType<typeof createClient>,
  opts: {
    userId: string;
    email: string;
    fullName?: string | null;
    reason: string;
    deactivatedBy: string;
    notifyUser: boolean;
    notifyAdmin?: boolean;
    adminNote?: string;
  },
) {
  const cleanName = stripDeactivatedPrefix(opts.fullName) || "there";
  const now = new Date().toISOString();

  // Ban login (~100 years)
  const { error: banError } = await admin.auth.admin.updateUserById(opts.userId, {
    ban_duration: "876000h",
  });
  if (banError) {
    console.error("ban error", banError);
    throw banError;
  }

  const profilePatch: Record<string, unknown> = {
    is_active: false,
    deactivated_at: now,
    deactivation_reason: opts.reason,
    deactivated_by: opts.deactivatedBy,
    full_name: `[DEACTIVATED] ${cleanName === "there" ? "User" : cleanName}`,
    email_notifications: {
      messages: false,
      deal_updates: false,
      investment_status: false,
    },
    updated_at: now,
  };

  const { error: profileError } = await admin
    .from("profiles")
    .update(profilePatch)
    .eq("id", opts.userId);

  // Fallback if migration not applied yet
  if (profileError) {
    console.warn("full profile patch failed, trying minimal", profileError);
    const { error: minimalError } = await admin
      .from("profiles")
      .update({
        full_name: `[DEACTIVATED] ${cleanName === "there" ? "User" : cleanName}`,
        email_notifications: {
          messages: false,
          deal_updates: false,
          investment_status: false,
        },
        updated_at: now,
      })
      .eq("id", opts.userId);
    if (minimalError) throw minimalError;
  }

  if (opts.notifyUser) {
    await sendEmail({
      to: opts.email,
      subject: "Your EquityMD account has been deactivated",
      content:[
        `Hi ${cleanName},`,
        ``,
        `This confirms that your EquityMD account (${opts.email}) has been deactivated.`,
        ``,
        `You will no longer be able to sign in. If this was a mistake or you need anything else, reply to this email.`,
        ``,
        `— EquityMD Support`,
        `hello@equitymd.com`,
      ].join("\n"),
    });
  }

  if (opts.notifyAdmin) {
    await sendEmail({
      to: ADMIN_NOTIFY,
      subject: `EquityMD account deactivated: ${opts.email}`,
      content: [
        `An EquityMD account was deactivated.`,
        ``,
        `Email: ${opts.email}`,
        `User ID: ${opts.userId}`,
        `By: ${opts.deactivatedBy}`,
        `Reason: ${opts.reason}`,
        opts.adminNote ? `Note: ${opts.adminNote}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  return { userId: opts.userId, email: opts.email, deactivatedAt: now };
}

async function reactivateUser(
  admin: ReturnType<typeof createClient>,
  opts: { userId: string; email: string; fullName?: string | null },
) {
  const cleanName = stripDeactivatedPrefix(opts.fullName) || "User";
  const now = new Date().toISOString();

  const { error: banError } = await admin.auth.admin.updateUserById(opts.userId, {
    ban_duration: "none",
  });
  if (banError) throw banError;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      is_active: true,
      deactivated_at: null,
      deactivation_reason: null,
      deactivated_by: null,
      full_name: cleanName,
      updated_at: now,
    })
    .eq("id", opts.userId);

  if (profileError) {
    const { error: minimalError } = await admin
      .from("profiles")
      .update({ full_name: cleanName, updated_at: now })
      .eq("id", opts.userId);
    if (minimalError) throw minimalError;
  }

  return { userId: opts.userId, email: opts.email, reactivatedAt: now };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = (body.mode || "self") as "self" | "admin" | "contact";
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // -------- CONTACT FORM AUTO PATH --------
    if (mode === "contact") {
      const email = String(body.email || "").trim().toLowerCase();
      const subject = String(body.subject || "");
      const message = String(body.message || "");
      const name = String(body.name || "").trim();

      if (!email || !isDeactivateSubject(subject, message)) {
        return json(200, {
          success: false,
          skipped: true,
          reason: "not_a_deactivation_request",
        });
      }

      const { data: profile, error: lookupError } = await admin
        .from("profiles")
        .select("id, email, full_name")
        .ilike("email", email)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (!profile) {
        // Still notify admin so the request isn't lost
        await sendEmail({
          to: ADMIN_NOTIFY,
          subject: `EquityMD deactivate request (no account): ${email}`,
          content: [
            `Contact form asked to deactivate an account, but no profile matched.`,
            ``,
            `Name: ${name || "—"}`,
            `Email: ${email}`,
            `Subject: ${subject}`,
            ``,
            `Message:`,
            message || "—",
          ].join("\n"),
        });
        return json(200, {
          success: false,
          skipped: true,
          reason: "no_matching_account",
          notifiedAdmin: true,
        });
      }

      if (String(profile.full_name || '').startsWith('[DEACTIVATED]')) {
        return json(200, {
          success: true,
          alreadyDeactivated: true,
          email: profile.email,
        });
      }

      const result = await deactivateUser(admin, {
        userId: profile.id,
        email: profile.email || email,
        fullName: profile.full_name || name,
        reason:
          message?.slice(0, 500) ||
          "User requested deactivation via contact form",
        deactivatedBy: "contact_form",
        notifyUser: true,
        notifyAdmin: true,
        adminNote: `Contact form subject: ${subject}`,
      });

      return json(200, { success: true, mode: "contact", ...result });
    }

    // -------- AUTHENTICATED PATHS (self / admin) --------
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Missing authorization" });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return json(401, { error: "Unauthorized" });
    }

    if (mode === "self") {
      const { data: profile } = await admin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return json(404, { error: "Profile not found" });
      if (String(profile.full_name || '').startsWith('[DEACTIVATED]')) {
        return json(200, { success: true, alreadyDeactivated: true });
      }

      const result = await deactivateUser(admin, {
        userId: user.id,
        email: profile.email || user.email || "",
        fullName: profile.full_name,
        reason: String(body.reason || "Self-serve deactivation from profile settings"),
        deactivatedBy: "self",
        notifyUser: true,
        notifyAdmin: false,
      });

      // Sign out this session best-effort
      try {
        await userClient.auth.signOut();
      } catch (_err) {
        /* ignore */
      }

      return json(200, { success: true, mode: "self", ...result });
    }

    if (mode === "admin") {
      const { data: adminProfile } = await admin
        .from("profiles")
        .select("id, is_admin, email")
        .eq("id", user.id)
        .maybeSingle();

      if (!adminProfile?.is_admin) {
        return json(403, { error: "Admin only" });
      }

      const targetUserId = String(body.userId || "");
      const action = (body.action || "deactivate") as "deactivate" | "reactivate";
      if (!targetUserId) return json(400, { error: "userId required" });

      const { data: target } = await admin
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", targetUserId)
        .maybeSingle();

      if (!target) return json(404, { error: "Target user not found" });

      if (action === "reactivate") {
        const result = await reactivateUser(admin, {
          userId: target.id,
          email: target.email,
          fullName: target.full_name,
        });
        await sendEmail({
          to: ADMIN_NOTIFY,
          subject: `EquityMD account reactivated: ${target.email}`,
          content: `Admin ${adminProfile.email} reactivated ${target.email} (${target.id}).`,
        });
        return json(200, { success: true, mode: "admin", action, ...result });
      }

      const result = await deactivateUser(admin, {
        userId: target.id,
        email: target.email,
        fullName: target.full_name,
        reason: String(body.reason || "Deactivated by admin"),
        deactivatedBy: `admin:${user.id}`,
        notifyUser: body.notifyUser !== false,
        notifyAdmin: true,
        adminNote: `Admin: ${adminProfile.email}`,
      });

      return json(200, { success: true, mode: "admin", action: "deactivate", ...result });
    }

    return json(400, { error: `Unknown mode: ${mode}` });
  } catch (err) {
    console.error("deactivate-account error", err);
    return json(500, {
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});
