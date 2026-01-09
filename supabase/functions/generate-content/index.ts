import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

interface GenerateRequest {
  prompt: string;
  context?: string;
  contentType: "property_description" | "company_description" | "bio" | "deal_summary" | "custom";
  tone?: "professional" | "friendly" | "compelling";
  maxLength?: number;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  property_description: `You are an expert real estate copywriter specializing in multifamily and commercial properties. 
Write compelling, professional property descriptions that highlight key features, location benefits, and investment potential.
Use specific details when provided. Avoid generic phrases. Make it engaging for accredited investors.`,

  company_description: `You are a professional business writer specializing in real estate and investment firms.
Write compelling company descriptions that establish credibility, highlight experience, and build trust.
Focus on track record, expertise, and value proposition for investors.`,

  bio: `You are a professional bio writer for real estate professionals.
Write concise, compelling professional bios that highlight experience, expertise, and accomplishments.
Keep it warm but professional. Focus on credentials and value to investors/partners.`,

  deal_summary: `You are a real estate investment analyst.
Write clear, compelling deal summaries that highlight investment thesis, key metrics, and opportunity.
Be specific about returns, strategy, and timeline. Make it informative for accredited investors.`,

  custom: `You are a helpful writing assistant for a real estate investment platform.
Write clear, professional content based on the user's request.`,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body: GenerateRequest = await req.json();
    const { prompt, context, contentType, tone = "professional", maxLength = 300 } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    if (!XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the system prompt
    const systemPrompt = SYSTEM_PROMPTS[contentType] || SYSTEM_PROMPTS.custom;

    // Build the user message
    let userMessage = prompt;
    if (context) {
      userMessage = `Context: ${context}\n\nRequest: ${prompt}`;
    }
    userMessage += `\n\nTone: ${tone}. Keep response under ${maxLength} words.`;

    // Call xAI API
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: Math.min(maxLength * 2, 1000),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

