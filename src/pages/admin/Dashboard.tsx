import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { LogoManager } from '../../components/admin/LogoManager';
import { UserManagement } from '../../components/admin/UserManagement';
import { PropertyManagement } from '../../components/admin/PropertyManagement';
import { CreditManagement } from '../../components/admin/CreditManagement';
import { InvestorImport } from '../../components/admin/InvestorImport';
import { SyndicatorImport } from '../../components/admin/SyndicatorImport';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { CommandCenter } from '../../components/admin/CommandCenter';
import { BlogManagement } from '../../components/admin/BlogManagement';
import { ClaimRequests } from '../../components/admin/ClaimRequests';
import { SyndicatorVerificationAdmin } from '../../components/SyndicatorVerificationAdmin';
import { SystemManagement } from '../../components/admin/SystemManagement';
import { DeactivatedAccountsManagement } from '../../components/admin/DeactivatedAccountsManagement';
import { MessagesAdmin } from '../../components/admin/MessagesAdmin';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { BarChart, Users, Building2, CreditCard, FileText, Settings, Upload, CheckCircle, Shield, Database, UserX, Zap, PenTool, MessageCircle } from 'lucide-react';

export function AdminDashboard() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'command' | 'analytics' | 'users' | 'deactivated' | 'properties' | 'blog' | 'credits' | 'import-investors' | 'import-syndicators' | 'settings' | 'claims' | 'verification' | 'system' | 'messages'>('command');

  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Self-healing: if profile is missing on mount, actively fetch it
  const fetchProfileDirect = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // No session at all — try refreshing
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (!refreshed.session?.user) return false;
        const userId = refreshed.session.user.id;
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) {
          useAuthStore.getState().setUser(refreshed.session.user);
          useAuthStore.getState().setProfile(data);
          return true;
        }
        return false;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (data) {
        useAuthStore.getState().setUser(session.user);
        useAuthStore.getState().setProfile(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!profile) {
      // Immediately try to fetch profile ourselves (don't just wait for App.tsx)
      fetchProfileDirect().then((success) => {
        if (!success) {
          // If that didn't work, give App.tsx a few more seconds
          const timer = setTimeout(() => setLoadTimeout(true), 5000);
          return () => clearTimeout(timer);
        }
      });
    }
  }, [profile, fetchProfileDirect]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    setLoadTimeout(false);
    try {
      const success = await fetchProfileDirect();
      if (!success) setLoadTimeout(true);
    } catch {
      setLoadTimeout(true);
    } finally {
      setRetrying(false);
    }
  }, [fetchProfileDirect]);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors — we're clearing everything anyway
    }
    useAuthStore.getState().clearAuth();
    localStorage.clear();
    window.location.href = '/';
  }, []);

  if (!profile) return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      {loadTimeout ? (
        <>
          <p style={{ marginBottom: '16px', color: '#dc2626' }}>Session expired or profile unavailable.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', opacity: retrying ? 0.6 : 1 }}
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={handleSignOut}
              style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Sign Out &amp; Return Home
            </button>
          </div>
        </>
      ) : (
        <>
          <i>Loading...</i>
          <br /><br />
          <a href="/">Return to home</a>
        </>
      )}
    </div>
  )

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const quickClearCache = async () => {
    if (confirm('Clear browser cache? This will refresh the page.')) {
      try {
        // Preserve Supabase auth session while clearing everything else
        const authToken = localStorage.getItem('sb-frtxsynlvwhpnzzgfgbt-auth-token');
        localStorage.clear();
        sessionStorage.clear();
        if (authToken) {
          localStorage.setItem('sb-frtxsynlvwhpnzzgfgbt-auth-token', authToken);
        }
        alert('Cache cleared successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Error clearing cache. Check console for details.');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'deactivated':
        return <DeactivatedAccountsManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'blog':
        return <BlogManagement />;
      case 'credits':
        return <CreditManagement />;
      case 'import-investors':
        return <InvestorImport />;
      case 'import-syndicators':
        return <SyndicatorImport />;
      case 'settings':
        return <LogoManager />;
      case 'claims':
        return <ClaimRequests />;
      case 'verification':
        return <SyndicatorVerificationAdmin />;
      case 'system':
        return <SystemManagement />;
      case 'messages':
        return <MessagesAdmin />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={quickClearCache}
              className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Quick Clear Cache
            </button>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            <button
              onClick={() => setActiveTab('command')}
              className={`pb-4 flex items-center ${
                activeTab === 'command'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="h-5 w-5 mr-2" />
              Command Center
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 flex items-center ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart className="h-5 w-5 mr-2" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 flex items-center ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 flex items-center ${
                activeTab === 'messages'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Messages
            </button>

            {/* <button
              onClick={() => setActiveTab('deactivated')}
              className={`pb-4 flex items-center ${
                activeTab === 'deactivated'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserX className="h-5 w-5 mr-2" />
              Deactivated Users
            </button> */}
            
            <button
              onClick={() => setActiveTab('properties')}
              className={`pb-4 flex items-center ${
                activeTab === 'properties'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Properties
            </button>

            {/* <button
              onClick={() => setActiveTab('credits')}
              className={`pb-4 flex items-center ${
                activeTab === 'credits'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Credits
            </button> */}

            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-4 flex items-center ${
                activeTab === 'claims'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Claim Requests
            </button>

            {/* <button
              onClick={() => setActiveTab('import-investors')}
              className={`pb-4 flex items-center ${
                activeTab === 'import-investors'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Investors
            </button> */}

            <button
              onClick={() => setActiveTab('import-syndicators')}
              className={`pb-4 flex items-center ${
                activeTab === 'import-syndicators'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Syndicators
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`pb-4 flex items-center ${
                activeTab === 'verification'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Syndicator Verification
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className={`pb-4 flex items-center ${
                activeTab === 'blog'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PenTool className="h-5 w-5 mr-2" />
              Blog
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`pb-4 flex items-center ${
                activeTab === 'system'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="h-5 w-5 mr-2" />
              System Management
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 flex items-center ml-auto ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {renderContent()}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;