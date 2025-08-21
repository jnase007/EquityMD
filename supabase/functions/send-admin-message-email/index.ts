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
const ADMIN_EMAILS = ["justin@brandastic.com"];

// Initialize Supabase client with service role key for database updates
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface MessageData {
  id: string;
  deal_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

console.log("Email invitation function loaded!");

Deno.serve(async (req) => {
  try {
    // Parse the request body
    const payload = (await req.json()) as MessageData;

    // Fetch sender profile
    const { data: senderProfile, error: senderError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", payload.sender_id)
      .single();

    if (senderError) {
      throw new Error(`Failed to fetch sender profile: ${senderError.message}`);
    }

    // Fetch receiver profile
    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", payload.receiver_id)
      .single();

    if (receiverError) {
      throw new Error(
        `Failed to fetch receiver profile: ${receiverError.message}`
      );
    }

    // Fetch deal information
    const { data: dealData, error: dealError } = await supabase
      .from("deals")
      .select("title")
      .eq("id", payload.deal_id)
      .single();

    if (dealError) {
      throw new Error(`Failed to fetch deal information: ${dealError.message}`);
    }

    // Prepare template variables
    const sender_name = senderProfile.full_name;
    const sender_email = senderProfile.email;
    const recipient_name = receiverProfile.full_name;
    const deal_title = dealData.title;
    const date = new Date(payload.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const message_content = payload.content;

    // Variable substitution
    const personalizedHtml = HTML_TEMPLATE.replace(
      /{{sender_name}}/g,
      sender_name
    )
      .replace(/{{sender_email}}/g, sender_email)
      .replace(/{{recipient_name}}/g, recipient_name)
      .replace(/{{deal_name}}/g, deal_title)
      .replace(/{{date}}/g, date)
      .replace(/{{message_content}}/g, message_content);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EquityMD <noreply@equitymd.com>",
        to: ADMIN_EMAILS,
        subject: `💬 New Message: ${sender_name} → ${recipient_name}`,
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
        }
      );
    }

    console.log("Admin email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        message: "Admin message notification sent successfully",
        email_id: emailResult.id,
        sender: sender_name,
        recipient: recipient_name,
        deal: deal_title,
      }),
      { headers: { "Content-Type": "application/json" } }
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
      }
    );
  }
});
