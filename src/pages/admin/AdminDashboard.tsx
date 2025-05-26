import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { DashboardHeader } from '../../components/DashboardHeader';
import { LogoManager } from '../../components/admin/LogoManager';
import { UserManagement } from '../../components/admin/UserManagement';
import { PropertyManagement } from '../../components/admin/PropertyManagement';
import { CreditManagement } from '../../components/admin/CreditManagement';
import { InvestorImport } from '../../components/admin/InvestorImport';
import { SyndicatorImport } from '../../components/admin/SyndicatorImport';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { ClaimRequests } from '../../components/admin/ClaimRequests';
import { useAuthStore } from '../../lib/store';
import { BarChart, Users, Building2, CreditCard, Upload, Settings, CheckCircle, Shield } from 'lucide-react';

export function AdminDashboard() {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'properties' | 'credits' | 'import-investors' | 'import-syndicators' | 'settings' | 'claims'>('analytics');

  // Restrict access to specific admin user only
  if (!user || user.email !== 'justin@brandastic.com') {
    return <Navigate to="/" replace />;
  }

  // Ensure user profile exists and has admin privileges
  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'properties':
        return <PropertyManagement />;
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        profile={{
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          user_type: profile.user_type,
          is_admin: profile.is_admin,
          is_verified: profile.is_verified
        }}
        title="Admin Dashboard"
        subtitle="Platform administration and management"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Welcome to the Admin Dashboard</h2>
              <p className="text-gray-600">Manage users, content, and platform settings from this centralized dashboard.</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b bg-white rounded-t-lg shadow-sm">
          <div className="flex space-x-6 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart className="h-5 w-5 mr-2" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </button>
            
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Properties
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'credits'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Credits
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'claims'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Claims
            </button>

            <button
              onClick={() => setActiveTab('import-investors')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'import-investors'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Investors
            </button>

            <button
              onClick={() => setActiveTab('import-syndicators')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'import-syndicators'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Syndicators
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 flex items-center whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-b-lg shadow-sm min-h-[600px]">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 