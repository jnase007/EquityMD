// Supabase Edge Function: send-profile-reminders
// This function sends email reminders to users with incomplete profiles
// Run on a schedule (e.g., daily) via Supabase cron or external scheduler

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string;
  avatar_url: string | null;
  phone_number: string | null;
  email_notifications: {
    messages?: boolean;
    deal_updates?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

interface InvestorProfile {
  accredited_status: boolean;
  minimum_investment: number | null;
  preferred_property_types: string[] | null;
  preferred_locations: string[] | null;
  investment_preferences: {
    experience_level?: string;
    years_investing?: number;
    bio?: string;
    state?: string;
  } | null;
}

function calculateInvestorCompletion(profile: Profile, investorProfile: InvestorProfile | null): {
  percentage: number;
  missingItems: string[];
} {
  const missingItems: string[] = [];
  let completedFields = 1; // Account creation
  const totalFields = 10;

  // Basic profile fields
  if (profile.full_name) completedFields++;
  else missingItems.push("Full name");

  if (profile.avatar_url) completedFields++;
  else missingItems.push("Profile picture");

  if (profile.phone_number) completedFields++;
  else missingItems.push("Phone number");

  // Investor-specific fields
  if (investorProfile) {
    if (investorProfile.minimum_investment) completedFields++;
    else missingItems.push("Investment range");

    if (investorProfile.preferred_property_types?.length) completedFields++;
    else missingItems.push("Property type preferences");

    if (investorProfile.preferred_locations?.length) completedFields++;
    else missingItems.push("Preferred locations");

    if (investorProfile.investment_preferences?.experience_level) completedFields++;
    else missingItems.push("Experience level");

    if (investorProfile.investment_preferences?.bio) completedFields++;
    else missingItems.push("Bio");

    if (investorProfile.investment_preferences?.state) completedFields++;
    else missingItems.push("State of residence");
  } else {
    missingItems.push("Investment preferences");
  }

  const percentage = Math.round((completedFields / totalFields) * 100);
  return { percentage, missingItems };
}

async function sendReminderEmail(
  email: string,
  userName: string,
  percentage: number,
  missingItems: string[]
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return false;
  }

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your EquityMD Profile</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px 32px; border-radius: 8px 8px 0 0; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: white;">
          Equity<span style="color: #fbbf24;">MD</span>
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">📝</div>
        </div>
        
        <h1 style="color: #111827; font-size: 24px; margin: 0 0 16px; text-align: center;">Complete Your Profile</h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
          Hi ${userName || "there"}, your profile is ${percentage}% complete. Complete it to unlock all features and see more deals.
        </p>
        
        <!-- Progress Bar -->
        <div style="background: #e5e7eb; border-radius: 8px; height: 8px; margin-bottom: 24px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); height: 100%; width: ${percentage}%; border-radius: 8px;"></div>
        </div>
        
        <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px;">What's missing:</h3>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          ${missingItems
            .slice(0, 5)
            .map(
              (item) => `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="color: #ef4444;">✗</span>
              <span style="color: #4b5563;">${item}</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #166534; margin: 0; font-size: 14px;">
            <strong>💡 Did you know?</strong> Complete profiles are 3x more likely to get approved for exclusive deals.
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="https://equitymd.com/profile" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Complete Profile Now
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 24px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <a href="https://equitymd.com/settings" style="color: #2563eb; text-decoration: none;">Manage email preferences</a>
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">© ${new Date().getFullYear()} EquityMD. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EquityMD <hello@equitymd.com>",
        to: [email],
        subject: `📝 Complete Your Profile - ${percentage}% Done`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend API error:", error);
      return false;
    }

    console.log(`Reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    // Get users who:
    // 1. Signed up more than 3 days ago
    // 2. Haven't updated their profile in the last 7 days
    // 3. Are investors
    // 4. Have incomplete profiles
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get investor profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "investor")
      .lt("created_at", threeDaysAgo.toISOString())
      .lt("updated_at", sevenDaysAgo.toISOString())
      .not("email", "is", null)
      .limit(50);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No profiles need reminders", sent: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Get investor profiles for these users
    const { data: investorProfiles } = await supabase
      .from("investor_profiles")
      .select("*")
      .in(
        "id",
        profiles.map((p) => p.id)
      );

    const investorProfileMap = new Map(
      (investorProfiles || []).map((ip) => [ip.id, ip])
    );

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      // Check if user has email notifications disabled
      const notifications = profile.email_notifications;
      if (notifications && notifications.deal_updates === false) {
        continue; // Skip users who opted out
      }

      const investorProfile = investorProfileMap.get(profile.id) || null;
      const { percentage, missingItems } = calculateInvestorCompletion(
        profile,
        investorProfile
      );

      // Only send if profile is less than 70% complete
      if (percentage < 70) {
        const success = await sendReminderEmail(
          profile.email,
          profile.full_name,
          percentage,
          missingItems
        );

        if (success) {
          sentCount++;
        } else {
          errors.push(profile.email);
        }

        // Rate limiting - wait 100ms between emails
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return new Response(
      JSON.stringify({
        message: "Profile reminders sent",
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
