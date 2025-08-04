// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import HTML_TEMPLATE from "./template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with service role key for database updates
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface InvitationData {
  id: string;
  email: string;
  first_name: string;
  table: string;
  type: "INSERT" | "UPDATE" | "DELETE";
  record: Record<string, any>;
  old_record?: Record<string, any>;
}

console.log("Email invitation function loaded!");

Deno.serve(async (req) => {
  try {
    // Parse the request body
    const payload = (await req.json()) as InvitationData;

    console.log("Received payload:", JSON.stringify(payload, null, 2));

    if (!payload?.email || !payload?.first_name || !payload?.id) {
      const msg = "Missing 1 or more required fields: [email, first_name, id]";
      console.error(msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, first_name, id } = payload;

    // Variable substitution
    const personalizedHtml = HTML_TEMPLATE.replace(
      /{{first_name}}/g,
      first_name,
    ).replace(/{{email}}/g, email);

    console.log(`Sending email to: ${email}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EquityMD <noreply@equitymd.com>",
        to: [email],
        subject: "🚀 You've Been Selected - Welcome to EquityMD",
        html: personalizedHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error sending email:", emailResult);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: emailResult,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Email sent successfully:", emailResult);

    // Update the database record with email sent timestamp
    const { error: updateError } = await supabase
      .from("email_invitations")
      .update({
        sent_at: new Date().toISOString(),
        resend_email_id: emailResult.id,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating database record:", updateError);
      // Email was sent successfully, but we couldn't update the database
      // This is not a critical error, so we'll return success but log the issue
      return new Response(
        JSON.stringify({
          message:
            "Email sent successfully, but failed to update database record",
          email_id: emailResult.id,
          warning: updateError.message,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Database record updated successfully");

    return new Response(
      JSON.stringify({
        message: "Email invitation sent successfully",
        email_id: emailResult.id,
        sent_to: email,
        first_name: first_name,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
