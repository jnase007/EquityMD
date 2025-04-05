import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { LogoManager } from '../../components/admin/LogoManager';
import { UserManagement } from '../../components/admin/UserManagement';
import { PropertyManagement } from '../../components/admin/PropertyManagement';
import { CreditManagement } from '../../components/admin/CreditManagement';
import { InvestorImport } from '../../components/admin/InvestorImport';
import { SyndicatorImport } from '../../components/admin/SyndicatorImport';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { ClaimRequests } from '../../components/admin/ClaimRequests';
import { useAuthStore } from '../../lib/store';
import { BarChart, Users, Building2, CreditCard, FileText, Settings, Upload, CheckCircle } from 'lucide-react';

export function AdminDashboard() {
  const { profile } = useAuthStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'properties' | 'credits' | 'import-investors' | 'import-syndicators' | 'settings' | 'claims'>('analytics');

  // Allow access if path starts with /dev-admin or user is admin
  const isDevAdmin = location.pathname.startsWith('/dev-admin');
  if (!isDevAdmin && !profile?.is_admin) {
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {isDevAdmin && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm">
              Development Mode
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
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

            <button
              onClick={() => setActiveTab('credits')}
              className={`pb-4 flex items-center ${
                activeTab === 'credits'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Credits
            </button>

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

            <button
              onClick={() => setActiveTab('import-investors')}
              className={`pb-4 flex items-center ${
                activeTab === 'import-investors'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Investors
            </button>

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