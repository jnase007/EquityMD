import React, { useState, useEffect } from 'react';
import { ImageUpload } from '../ImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface SiteSettings {
  id: string;
  logo_black: string | null;
  logo_white: string | null;
  require_auth: boolean;
  updated_at: string;
}

export function LogoManager() {
  const { profile } = useAuthStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({
        type: 'error',
        text: 'Error loading settings'
      });
    } finally {
      setLoading(false);
    }
  }

  const updateLogo = async (type: 'black' | 'white', url: string) => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          [`logo_${type}`]: url,
          updated_at: new Date().toISOString(),
          updated_by: profile?.id
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? {
        ...prev,
        [`logo_${type}`]: url,
        updated_at: new Date().toISOString()
      } : null);

      setMessage({
        type: 'success',
        text: 'Logo updated successfully'
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating logo:', error);
      setMessage({
        type: 'error',
        text: 'Error updating logo'
      });
    }
  };

  const toggleGatedAccess = async () => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          require_auth: !settings.require_auth,
          updated_at: new Date().toISOString(),
          updated_by: profile?.id
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? {
        ...prev,
        require_auth: !prev.require_auth,
        updated_at: new Date().toISOString()
      } : null);

      setMessage({
        type: 'success',
        text: `Gated access ${!settings.require_auth ? 'enabled' : 'disabled'} successfully`
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating gated access:', error);
      setMessage({
        type: 'error',
        text: 'Error updating gated access'
      });
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-yellow-700">
            You need administrator access to manage logos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-6">Logo Management</h2>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Black Logo */}
          <div>
            <h3 className="font-medium mb-4">Black Logo</h3>
            <div className="bg-white border rounded-lg p-4">
              <ImageUpload
                currentImageUrl={settings?.logo_black || 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-black.png'}
                onImageUploaded={(url) => updateLogo('black', url)}
                bucket="logos"
                folder="site"
              />
              <div className="mt-2 text-sm text-gray-500">
                Used in light mode and white backgrounds
              </div>
            </div>
          </div>

          {/* White Logo */}
          <div>
            <h3 className="font-medium mb-4">White Logo</h3>
            <div className="bg-gray-900 border rounded-lg p-4">
              <ImageUpload
                currentImageUrl={settings?.logo_white || 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//logo-white.png'}
                onImageUploaded={(url) => updateLogo('white', url)}
                bucket="logos"
                folder="site"
              />
              <div className="mt-2 text-sm text-gray-400">
                Used in dark mode and colored backgrounds
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gated Access Control */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Gated Access</h2>
            <p className="text-gray-600 mt-1">
              Require users to sign in before accessing the platform
            </p>
          </div>
          <button
            onClick={toggleGatedAccess}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              settings?.require_auth
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Lock className="h-5 w-5 mr-2" />
            {settings?.require_auth ? 'Disable Gated Access' : 'Enable Gated Access'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            When enabled, users must sign in to access any part of the platform except the home page.
            This helps ensure only verified investors can view investment opportunities.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-blue-700 mb-2">
          Logos should be:
        </div>
        <div className="space-y-1 text-sm text-blue-700">
          <div>• PNG or SVG format with transparent background</div>
          <div>• At least 200px in height for optimal display</div>
          <div>• Less than 2MB in file size</div>
        </div>
      </div>
    </div>
  );
}