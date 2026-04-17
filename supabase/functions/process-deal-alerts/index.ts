import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get all saved searches with email alerts enabled
    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select('*, profiles!user_id(email, full_name)')
      .eq('email_alerts', true);

    if (searchError) throw searchError;
    if (!searches || searches.length === 0) {
      return new Response(JSON.stringify({ message: 'No active alerts', processed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Get deals created since last check (default: last 24 hours)
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const { data: newDeals, error: dealError } = await supabase
      .from('deals')
      .select('*, syndicators(company_name)')
      .gte('created_at', since.toISOString())
      .eq('status', 'active');

    if (dealError) throw dealError;
    if (!newDeals || newDeals.length === 0) {
      return new Response(JSON.stringify({ message: 'No new deals', processed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let alertsSent = 0;

    for (const search of searches) {
      const profile = (search as any).profiles;
      if (!profile?.email) continue;

      // Check frequency — skip if already alerted recently
      if (search.last_alerted_at) {
        const lastAlert = new Date(search.last_alerted_at);
        const now = new Date();
        const hoursSince = (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60);
        
        if (search.alert_frequency === 'daily' && hoursSince < 23) continue;
        if (search.alert_frequency === 'weekly' && hoursSince < 167) continue;
        // 'instant' always proceeds
      }

      // Match deals against search filters
      const filters = search.filters || {};
      const matchingDeals = newDeals.filter((deal: any) => {
        if (filters.location && deal.location && !deal.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.propertyType && deal.property_type && deal.property_type !== filters.propertyType) return false;
        if (filters.minInvestment && deal.minimum_investment && deal.minimum_investment < filters.minInvestment) return false;
        if (filters.maxInvestment && deal.minimum_investment && deal.minimum_investment > filters.maxInvestment) return false;
        if (filters.minIrr && deal.target_irr && parseFloat(deal.target_irr) < filters.minIrr) return false;
        return true;
      });

      if (matchingDeals.length === 0) continue;

      // Send alert for each matching deal (max 3 per search per cycle)
      for (const deal of matchingDeals.slice(0, 3)) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: profile.email,
              type: 'deal_alert',
              data: {
                investorName: profile.full_name || 'Investor',
                dealTitle: deal.title,
                dealSlug: deal.slug,
                propertyType: deal.property_type || 'Investment',
                location: deal.location || 'Various',
                targetIrr: deal.target_irr,
                minimumInvestment: deal.minimum_investment ? `$${parseInt(deal.minimum_investment).toLocaleString()}` : 'Contact for details',
                investmentTerm: deal.investment_term || 'Contact for details',
                syndicatorName: deal.syndicators?.company_name || 'EquityMD Partner',
                matchReasons: [`Matched your "${search.name}" alert`]
              }
            }
          });
          alertsSent++;
        } catch (emailErr) {
          console.error(`Failed to send alert to ${profile.email}:`, emailErr);
        }
      }

      // Update last_alerted_at
      await supabase
        .from('saved_searches')
        .update({ last_alerted_at: new Date().toISOString() })
        .eq('id', search.id);
    }

    return new Response(
      JSON.stringify({ message: `Processed ${searches.length} searches, sent ${alertsSent} alerts`, processed: alertsSent }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Process deal alerts error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});