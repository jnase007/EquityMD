import React, { useState } from 'react';
import { User, Building2, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Dashboard } from './Dashboard';
import AdminDashboard from './admin/Dashboard';

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState<'investor' | 'syndicator' | 'admin'>('investor');

  const renderDashboard = () => {
    switch (activeTab) {
      case 'investor':
        // Mock investor context for dashboard
        return (
          <div className="dashboard-wrapper">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-800">👤 Investor Dashboard View</h3>
              <p className="text-blue-600">This is how the dashboard appears to investors</p>
            </div>
            <Dashboard />
          </div>
        );
      case 'syndicator':
        // Mock syndicator context for dashboard
        return (
          <div className="dashboard-wrapper">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-green-800">🏢 Syndicator Dashboard View</h3>
              <p className="text-green-600">This is how the dashboard appears to syndicators with deal management</p>
            </div>
            <Dashboard />
          </div>
        );
      case 'admin':
        return (
          <div className="dashboard-wrapper">
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-purple-800">⚡ Admin Dashboard View</h3>
              <p className="text-purple-600">Full admin dashboard with user management, analytics, and system controls</p>
            </div>
            <AdminDashboard />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">View all dashboard types for feedback and testing</p>
          </div>
        </div>

        {/* Dashboard Type Selector */}
        <div className="mb-8 border-b">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('investor')}
              className={`pb-4 flex items-center transition-colors ${
                activeTab === 'investor'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Investor Dashboard
            </button>

            <button
              onClick={() => setActiveTab('syndicator')}
              className={`pb-4 flex items-center transition-colors ${
                activeTab === 'syndicator'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Syndicator Dashboard
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`pb-4 flex items-center transition-colors ${
                activeTab === 'admin'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {renderDashboard()}
        </div>
      </div>

      <Footer />
    </div>
  );
} 