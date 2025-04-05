/*
  # Update Site Logos

  Updates the logo URLs in the site_settings table to use the new EQUITYMD logos.
*/

UPDATE site_settings
SET 
  logo_black = 'https://raw.githubusercontent.com/stackblitz/equitymd/main/public/logo-black.png',
  logo_white = 'https://raw.githubusercontent.com/stackblitz/equitymd/main/public/logo-white.png',
  updated_at = now();