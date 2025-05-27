import React, { useState } from 'react';
import { User, Building2, Shield, BarChart, Users, TrendingUp, Plus, Edit, Archive, FileText, CreditCard, Share2, DollarSign, ArrowUp, CheckCircle, Upload, Settings, Search, Filter, MoreVertical, Eye, Trash2, Download, UserPlus, Building, MessageSquare, Heart, AlertTriangle } from 'lucide-react';

export function DashboardReview() {
  const [activeTab, setActiveTab] = useState<'investor' | 'syndicator' | 'admin'>('investor');
  const [adminActiveTab, setAdminActiveTab] = useState<'analytics' | 'users' | 'properties' | 'credits' | 'claims' | 'import-investors' | 'import-syndicators' | 'settings'>('analytics');

  const renderInvestorDashboard = () => (
    <div className="space-y-8">
      {/* SEC Compliance Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium mb-1">Demonstration Dashboard - Mock Data</p>
            <p className="text-yellow-700">
              This dashboard displays sample data for demonstration purposes only. All figures, returns, and investments shown are hypothetical. 
              Past performance does not guarantee future results. Real estate investments involve significant risks including potential loss of principal.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Investor Dashboard</h1>
        <div className="flex gap-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Refer Friends
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Investments</p>
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-800">$250,000</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg Return</p>
              <p className="text-2xl font-bold text-green-600">22.5%</p>
              <p className="text-xs text-gray-400">Hypothetical</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Documents</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Features Update Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold">New: Favorites Feature! ❤️</h3>
              <p className="text-white/90 mt-1">Save deals you're interested in for easy access later</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-white/80">Saved Favorites</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            View My Favorites
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition">
            Browse New Deals
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Investments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Investments</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">The Metropolitan Apartments</h3>
                  <p className="text-gray-600">Austin, TX</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-green-600">Invested: $50,000</span>
                    <span className="text-blue-600">IRR: 18.5%</span>
                    <span className="text-purple-600">Cash-on-Cash: 12.3%</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">View Documents</button>
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Performance Report</button>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Riverside Office Complex</h3>
                  <p className="text-gray-600">Dallas, TX</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-green-600">Invested: $75,000</span>
                    <span className="text-blue-600">IRR: 21.2%</span>
                    <span className="text-purple-600">Cash-on-Cash: 15.1%</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">View Documents</button>
                <button className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Sign Documents</button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Activity */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">🎉 New Feature: Favorites</p>
                  <p className="text-xs text-gray-500">Save deals with the ❤️ button to review later</p>
                  <p className="text-xs text-gray-400">30 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New deal available</p>
                  <p className="text-xs text-gray-500">Downtown Retail Plaza</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Distribution received</p>
                  <p className="text-xs text-gray-500">$2,450 from Metropolitan</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Document requires signature</p>
                  <p className="text-xs text-gray-500">Riverside Office Complex</p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border rounded-lg hover:bg-pink-50 hover:border-pink-200 flex items-center">
                <Heart className="h-5 w-5 text-pink-600 mr-3" />
                <span className="text-sm font-medium">My Favorites (12)</span>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Browse New Deals</span>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">View Tax Documents</span>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Contact Syndicators</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-500">Portfolio performance chart would display here</div>
            <div className="text-xs text-gray-400 mt-1">Showing returns over time, distributions, and growth</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSyndicatorDashboard = () => (
    <div className="space-y-8">
      {/* SEC Compliance Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium mb-1">Demonstration Dashboard - Mock Data</p>
            <p className="text-yellow-700">
              This dashboard displays sample data for demonstration purposes only. All metrics, deal information, and investor data shown are hypothetical. 
              Actual results may vary significantly. Real estate investments involve substantial risks.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Syndicator Dashboard</h1>
        <div className="flex gap-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Refer Friends
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Buy Credits (25 remaining)
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Deals</p>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Investors</p>
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Raised</p>
              <p className="text-2xl font-bold text-gray-800">$12.5M</p>
              <p className="text-xs text-gray-400">Hypothetical</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Deal Favorites</p>
              <p className="text-2xl font-bold text-gray-800">342</p>
              <p className="text-xs text-gray-400">Sample data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deals Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Your Deals</h2>
            <div className="flex gap-2">
              <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">Active (5)</button>
              <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded">Draft (2)</button>
              <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded">Closed (1)</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">The Metropolitan Apartments</div>
                      <div className="text-sm text-gray-500">Austin, TX • $2.5M Target</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24 investors</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-pink-600">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>18</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$1.8M (72%)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Users className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Riverside Office Complex</div>
                      <div className="text-sm text-gray-500">Dallas, TX • $3.2M Target</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Funding
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18 investors</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-pink-600">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>12</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$950K (30%)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Users className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Recent Messages</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-medium">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">Interested in Metropolitan deal...</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs font-medium">SM</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah Miller</p>
                  <p className="text-xs text-gray-500">Question about cash flow projections...</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Investors</span>
                <span className="text-sm font-semibold text-green-600">+12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capital Raised</span>
                <span className="text-sm font-semibold text-green-600">$485K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deal Views</span>
                <span className="text-sm font-semibold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profile Views</span>
                <span className="text-sm font-semibold text-blue-600">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Favorites</span>
                <span className="text-sm font-semibold text-pink-600">+89</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <Plus className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Create New Deal</span>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">Investor Relations</span>
              </button>
              <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Upload Documents</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminTabContent = () => {
    switch (adminActiveTab) {
      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    <span className="ml-1">12.5%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">37</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    <span className="ml-1">8.3%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">22</div>
                  <div className="text-sm text-gray-500">Active Deals</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    <span className="ml-1">15.2%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">$933.0M</div>
                  <div className="text-sm text-gray-500">Total Investment</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">16.6%</div>
                  <div className="text-sm text-gray-500">Average Target IRR</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    <span className="ml-1">23.1%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-sm text-gray-500">SMS Opt-ins</div>
                </div>
              </div>
            </div>

            {/* SMS Analytics Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
                SMS Campaign Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">2,847</div>
                  <div className="text-sm text-gray-500">Total Opt-ins</div>
                  <div className="text-xs text-green-600 mt-1">↗ +127 this week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">76.3%</div>
                  <div className="text-sm text-gray-500">Opt-in Rate</div>
                  <div className="text-xs text-green-600 mt-1">↗ +2.1% vs last month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">94.2%</div>
                  <div className="text-sm text-gray-500">Delivery Rate</div>
                  <div className="text-xs text-gray-500 mt-1">163 invalid numbers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">$142.35</div>
                  <div className="text-sm text-gray-500">Monthly SMS Cost</div>
                  <div className="text-xs text-gray-500 mt-1">2,847 messages sent</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Recent SMS Campaigns</h4>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Austin Luxury Apartments - Deal Alert</div>
                      <div className="text-sm text-gray-500">Sent 2 hours ago • 2,847 recipients</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">94.2% delivered</div>
                      <div className="text-xs text-gray-500">$142.35 cost</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Dallas Mixed-Use Development</div>
                      <div className="text-sm text-gray-500">Sent yesterday • 2,720 recipients</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">95.1% delivered</div>
                      <div className="text-xs text-gray-500">$136.00 cost</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-500">Chart visualization would go here</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Investment Volume</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-gray-500">Chart visualization would go here</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">User Management</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">JD</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                          <div className="text-sm text-gray-500">john@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Investor</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">Jan 15, 2024</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">MS</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Mike Smith</div>
                          <div className="text-sm text-gray-500">mike@realestate.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Syndicator</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">Dec 8, 2023</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Property Management</h2>
              <div className="flex gap-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">22</p>
                    <p className="text-sm text-gray-500">Total Properties</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-gray-500">Active Deals</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">$45.2M</p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Syndicator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Raise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">The Metropolitan Apartments</div>
                        <div className="text-sm text-gray-500">Austin, TX</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Mike Smith</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">$2,500,000</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Credit Management</h2>
              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Issue Credits
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">1,250</p>
                    <p className="text-sm text-gray-500">Total Credits Issued</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">$12,500</p>
                    <p className="text-sm text-gray-500">Revenue Generated</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-sm text-gray-500">Active Credit Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">850</p>
                    <p className="text-sm text-gray-500">Credits Used</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Recent Credit Transactions</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Mike Smith</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Purchase</td>
                    <td className="px-6 py-4 text-sm text-green-600">+50</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Jan 20, 2024</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Sarah Johnson</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Deal Posting</td>
                    <td className="px-6 py-4 text-sm text-red-600">-10</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Jan 19, 2024</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'claims':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Claim Requests</h2>
              <div className="flex gap-3">
                <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-gray-500">Pending Claims</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-gray-500">Approved Claims</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-500">Rejected Claims</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property/Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Robert Wilson</div>
                        <div className="text-sm text-gray-500">robert@example.com</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Downtown Office Complex</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">Jan 18, 2024</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'import-investors':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Import Investors</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Investor Data</h3>
                <p className="text-gray-500 mb-6">Upload a CSV file to bulk import investor profiles</p>
                
                <div className="max-w-md mx-auto">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drop your CSV file here or</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">browse files</button>
                  </div>
                  
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-600 mb-2">Required columns:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• email (required)</li>
                      <li>• full_name</li>
                      <li>• phone</li>
                      <li>• accredited_status (true/false)</li>
                      <li>• investment_range</li>
                    </ul>
                  </div>
                  
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Imports</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">investors_batch_1.csv</p>
                    <p className="text-sm text-gray-500">45 investors imported • Jan 15, 2024</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">accredited_investors.csv</p>
                    <p className="text-sm text-gray-500">23 investors imported • Jan 10, 2024</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'import-syndicators':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Import Syndicators</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Syndicator Data</h3>
                <p className="text-gray-500 mb-6">Upload a CSV file to bulk import syndicator profiles</p>
                
                <div className="max-w-md mx-auto">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drop your CSV file here or</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">browse files</button>
                  </div>
                  
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-600 mb-2">Required columns:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• email (required)</li>
                      <li>• full_name</li>
                      <li>• company_name</li>
                      <li>• phone</li>
                      <li>• years_experience</li>
                      <li>• specialties (comma-separated)</li>
                    </ul>
                  </div>
                  
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Imports</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">syndicators_q1_2024.csv</p>
                    <p className="text-sm text-gray-500">12 syndicators imported • Jan 12, 2024</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">verified_syndicators.csv</p>
                    <p className="text-sm text-gray-500">8 syndicators imported • Jan 8, 2024</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Platform Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      value="EquityMD"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      value="support@equitymd.com"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Require Authentication</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Credit System</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Price (USD)</label>
                    <input
                      type="number"
                      value="10"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deal Posting Cost (Credits)</label>
                    <input
                      type="number"
                      value="10"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Cost (Credits)</label>
                    <input
                      type="number"
                      value="1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Welcome Emails</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Deal Notifications</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Weekly Digest</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value="60"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition">
                    Force Logout All Users
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Save Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Platform Overview</div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          <button
            onClick={() => setAdminActiveTab('analytics')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'analytics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart className="h-5 w-5 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setAdminActiveTab('users')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Users
          </button>
          <button
            onClick={() => setAdminActiveTab('properties')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'properties'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Properties
          </button>
          <button
            onClick={() => setAdminActiveTab('credits')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'credits'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Credits
          </button>
          <button
            onClick={() => setAdminActiveTab('claims')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'claims'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Claim Requests
          </button>
          <button
            onClick={() => setAdminActiveTab('import-investors')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'import-investors'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-5 w-5 mr-2" />
            Import Investors
          </button>
          <button
            onClick={() => setAdminActiveTab('import-syndicators')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'import-syndicators'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-5 w-5 mr-2" />
            Import Syndicators
          </button>
          <button
            onClick={() => setAdminActiveTab('settings')}
            className={`pb-4 flex items-center transition-colors ${
              adminActiveTab === 'settings'
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
      {renderAdminTabContent()}
    </div>
  );

  const renderDashboard = () => {
    switch (activeTab) {
      case 'investor':
        return renderInvestorDashboard();
      case 'syndicator':
        return renderSyndicatorDashboard();
      case 'admin':
        return renderAdminDashboard();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">EquityMD Dashboard Review</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Review all dashboard types for feedback and testing</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm">
            ✅ Review Mode - No Authentication Required
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
    </div>
  );
} 