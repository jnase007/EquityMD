// Simple script to print environment variables
import 'dotenv/config';

console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env ? import.meta.env.VITE_SUPABASE_URL : process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : process.env.VITE_GOOGLE_MAPS_API_KEY);
console.log('VITE_OPENAI_API_KEY:', import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : process.env.VITE_OPENAI_API_KEY);
console.log('VITE_RESEND_API_KEY:', import.meta.env ? import.meta.env.VITE_RESEND_API_KEY : process.env.VITE_RESEND_API_KEY);
console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY : process.env.VITE_STRIPE_PUBLISHABLE_KEY);