// Google Analytics 4 conversion tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize gtag if not already available
export function initializeGtag() {
  if (typeof window !== 'undefined' && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

// Track conversion events
export function trackConversion(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('GA4 not available, conversion tracking skipped:', eventName, parameters);
    return;
  }

  try {
    window.gtag('event', eventName, {
      event_category: 'conversion',
      ...parameters
    });
    console.log('GA4 Conversion tracked:', eventName, parameters);
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
}

// Specific conversion tracking functions
export function trackUserSignup(userType: 'investor' | 'syndicator', userId?: string, userEmail?: string) {
  trackConversion('sign_up', {
    method: 'email',
    user_type: userType,
    user_id: userId,
    user_email: userEmail,
    conversion_id: 'signup_conversion',
    value: userType === 'syndicator' ? 149 : 50, // Estimated value
    currency: 'USD'
  });

  // Also track specific signup type
  trackConversion(`${userType}_signup`, {
    user_type: userType,
    user_id: userId,
    user_email: userEmail,
    value: userType === 'syndicator' ? 149 : 50,
    currency: 'USD'
  });
}

export function trackUserLogin(userType: 'investor' | 'syndicator' | 'admin', userId?: string) {
  trackConversion('login', {
    method: 'email',
    user_type: userType,
    user_id: userId
  });
}

export function trackInvestmentInterest(dealId: string, investmentAmount?: number, userId?: string) {
  trackConversion('investment_interest', {
    deal_id: dealId,
    value: investmentAmount || 0,
    currency: 'USD',
    user_id: userId,
    event_category: 'engagement'
  });
}

export function trackSyndicatorContact(syndicatorId: string, dealId?: string, userId?: string) {
  trackConversion('syndicator_contact', {
    syndicator_id: syndicatorId,
    deal_id: dealId,
    user_id: userId,
    event_category: 'engagement'
  });
}

export function trackDealView(dealId: string, userId?: string) {
  trackConversion('deal_view', {
    deal_id: dealId,
    user_id: userId,
    event_category: 'engagement'
  });
}

export function trackDealFavorite(dealId: string, userId?: string) {
  trackConversion('deal_favorite', {
    deal_id: dealId,
    user_id: userId,
    event_category: 'engagement'
  });
}

export function trackSubscriptionStart(planName: string, planPrice: number, userId?: string) {
  trackConversion('subscription_start', {
    plan_name: planName,
    value: planPrice,
    currency: 'USD',
    user_id: userId,
    event_category: 'purchase'
  });
}

export function trackEmailOpen(emailType: string, userId?: string) {
  trackConversion('email_open', {
    email_type: emailType,
    user_id: userId,
    event_category: 'email_engagement'
  });
}

export function trackEmailClick(emailType: string, linkUrl: string, userId?: string) {
  trackConversion('email_click', {
    email_type: emailType,
    link_url: linkUrl,
    user_id: userId,
    event_category: 'email_engagement'
  });
}

// Page view tracking
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('config', 'G-4DYEHD25TP', {
      page_path: pagePath,
      page_title: pageTitle
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Enhanced user properties
export function setUserProperties(userId: string, properties: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('config', 'G-4DYEHD25TP', {
      user_id: userId,
      custom_map: properties
    });
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
} 