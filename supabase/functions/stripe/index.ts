import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'npm:stripe@14.19.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_51R7wce06nf7CzJjQO2DKeT68zTJKEZ6bAHJobatm5H0ESfZBlH12IN8W4XoCtsoW8dPgXOEp5tahc3Xbe4PKMsMl00AEWV7Epa';
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'create_subscription': {
        const { customerId, priceId } = data;
        
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        return new Response(
          JSON.stringify({ subscription }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      case 'create_customer': {
        const { email, name, userId } = data;
        
        // Check if customer already exists
        const customers = await stripe.customers.list({
          email,
          limit: 1,
        });

        let customer;
        if (customers.data.length > 0) {
          customer = customers.data[0];
          
          // Update metadata if needed
          if (!customer.metadata.supabaseUserId) {
            customer = await stripe.customers.update(customer.id, {
              metadata: {
                supabaseUserId: userId
              }
            });
          }
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email,
            name,
            metadata: {
              supabaseUserId: userId
            }
          });
        }

        return new Response(
          JSON.stringify({ id: customer.id }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      case 'create_portal_session': {
        const { customerId, returnUrl } = data;
        
        // Find customer by Supabase user ID if needed
        let stripeCustomerId = customerId;
        if (!customerId.startsWith('cus_')) {
          const customers = await stripe.customers.list({
            limit: 1,
            metadata: {
              supabaseUserId: customerId
            }
          });
          
          if (customers.data.length > 0) {
            stripeCustomerId = customers.data[0].id;
          } else {
            throw new Error('Customer not found');
          }
        }
        
        const session = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: returnUrl,
        });

        return new Response(
          JSON.stringify({ url: session.url }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      case 'create_checkout_session': {
        const { userId, quantity, unitAmount, returnUrl } = data;
        
        // Find customer by Supabase user ID
        const customers = await stripe.customers.list({
          limit: 1,
          metadata: {
            supabaseUserId: userId
          }
        });
        
        let customerId;
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          // Get user details from Supabase
          const { data: userData } = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}&select=email,full_name`,
            {
              headers: {
                'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`
              }
            }
          ).then(res => res.json());
          
          if (!userData || userData.length === 0) {
            throw new Error('User not found');
          }
          
          // Create new customer
          const customer = await stripe.customers.create({
            email: userData[0].email,
            name: userData[0].full_name,
            metadata: {
              supabaseUserId: userId
            }
          });
          
          customerId = customer.id;
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'EquityMD Credits',
                  description: 'Additional credits for your EquityMD account'
                },
                unit_amount: unitAmount,
              },
              quantity: quantity,
            },
          ],
          mode: 'payment',
          success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?canceled=true`,
          metadata: {
            userId,
            creditAmount: quantity,
            type: 'credit_purchase'
          }
        });

        return new Response(
          JSON.stringify({ id: session.id }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      case 'handle_webhook': {
        const sig = req.headers.get('stripe-signature')!;
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
        
        const event = stripe.webhooks.constructEvent(
          await req.text(),
          sig,
          webhookSecret
        );

        // Handle webhook events
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object;
            
            // Handle credit purchase
            if (session.metadata?.type === 'credit_purchase') {
              const userId = session.metadata.userId;
              const creditAmount = parseInt(session.metadata.creditAmount);
              
              // Update credits in Supabase
              await fetch(
                `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/add_credits`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`
                  },
                  body: JSON.stringify({
                    p_user_id: userId,
                    p_amount: creditAmount,
                    p_description: `Purchased ${creditAmount} credits`
                  })
                }
              );
            }
            break;
          }
          
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            // Get Supabase user ID from customer metadata
            const customer = await stripe.customers.retrieve(customerId as string);
            const userId = customer.metadata?.supabaseUserId;
            
            if (userId) {
              // Update subscription in Supabase
              await fetch(
                `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`
                  },
                  body: JSON.stringify({
                    syndicator_id: userId,
                    tier_id: subscription.metadata?.tier_id,
                    status: subscription.status,
                    billing_interval: subscription.items.data[0].plan.interval,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end
                  })
                }
              );
            }
            break;
          }

          case 'invoice.paid': {
            const invoice = event.data.object;
            // Handle successful payment
            break;
          }

          case 'invoice.payment_failed': {
            const invoice = event.data.object;
            // Handle failed payment
            break;
          }
        }

        return new Response(
          JSON.stringify({ received: true }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Stripe function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});