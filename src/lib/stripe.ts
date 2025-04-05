import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with the public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createSubscription(priceId: string) {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not initialized');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create or get Stripe customer
    const { data: customer, error: customerError } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create_customer',
        data: {
          email: user.email,
          name: user.user_metadata?.full_name,
          userId: user.id
        }
      }
    });

    if (customerError) throw customerError;

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create_subscription',
        data: {
          customerId: customer.id,
          priceId
        }
      }
    });

    if (subscriptionError) throw subscriptionError;

    // Redirect to checkout
    const result = await stripe.redirectToCheckout({
      sessionId: subscription.id
    });

    if (result.error) throw result.error;

  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function openBillingPortal() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: session, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create_portal_session',
        data: {
          customerId: user.id,
          returnUrl: window.location.origin + '/dashboard'
        }
      }
    });

    if (error) throw error;

    // Redirect to billing portal
    window.location.href = session.url;

  } catch (error) {
    console.error('Error opening billing portal:', error);
    throw error;
  }
}

export async function purchaseCredits(quantity: number) {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not initialized');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get credit price from user's subscription tier
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        tier:subscription_tiers(
          extra_credit_price
        )
      `)
      .eq('syndicator_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError) throw subError;

    const creditPrice = subscription?.tier?.extra_credit_price || 2.50; // Default price if no subscription
    const totalAmount = Math.round(creditPrice * quantity * 100); // Convert to cents

    // Create checkout session
    const { data: session, error: sessionError } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create_checkout_session',
        data: {
          userId: user.id,
          quantity,
          unitAmount: Math.round(creditPrice * 100),
          returnUrl: window.location.origin + '/dashboard'
        }
      }
    });

    if (sessionError) throw sessionError;

    // Redirect to checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (result.error) throw result.error;

  } catch (error) {
    console.error('Error purchasing credits:', error);
    throw error;
  }
}