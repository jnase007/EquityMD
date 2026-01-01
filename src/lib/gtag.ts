// Google Analytics 4 integration
// Add your GA4 Measurement ID to .env as VITE_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-490630894';

// Initialize GA4
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.log('GA4: No measurement ID configured');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('GA4: Initialized with ID:', GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Pre-built event trackers
export const analytics = {
  // User events
  signUp: (method: string) => trackEvent('sign_up', 'engagement', method),
  login: (method: string) => trackEvent('login', 'engagement', method),
  
  // Deal events
  viewDeal: (dealId: string, dealTitle: string) => 
    trackEvent('view_item', 'deals', dealTitle, undefined),
  saveDeal: (dealId: string) => 
    trackEvent('add_to_wishlist', 'deals', dealId),
  requestInfo: (dealId: string) => 
    trackEvent('generate_lead', 'deals', dealId),
  
  // Search events
  search: (query: string, resultsCount: number) => 
    trackEvent('search', 'engagement', query, resultsCount),
  filterApplied: (filterType: string, filterValue: string) => 
    trackEvent('filter', 'engagement', `${filterType}:${filterValue}`),
  
  // Profile events
  profileComplete: (percentage: number) => 
    trackEvent('profile_complete', 'engagement', undefined, percentage),
  
  // Syndicator events
  viewSyndicator: (syndicatorId: string, syndicatorName: string) => 
    trackEvent('view_syndicator', 'syndicators', syndicatorName),
  contactSyndicator: (syndicatorId: string) => 
    trackEvent('contact', 'syndicators', syndicatorId),
  
  // Newsletter
  newsletterSignup: (source: string) => 
    trackEvent('newsletter_signup', 'engagement', source),
  
  // Share events
  share: (platform: string, contentType: string) => 
    trackEvent('share', 'social', `${platform}:${contentType}`),
};

