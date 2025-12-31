import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, Building2, 
  CheckCircle, Award, BarChart3, Percent, Clock,
  MapPin, ChevronDown, ChevronUp
} from 'lucide-react';

interface PastDeal {
  id: string;
  name: string;
  propertyType: string;
  location: string;
  acquisitionYear: number;
  exitYear?: number;
  investmentAmount: number;
  actualIrr?: number;
  equityMultiple?: number;
  holdPeriod?: number;
  status: 'active' | 'exited' | 'realized';
  description?: string;
}

interface TrackRecordProps {
  pastDeals: PastDeal[];
  isEditable?: boolean;
  onEdit?: () => void;
}

export function TrackRecord({ pastDeals, isEditable = false, onEdit }: TrackRecordProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  // Calculate aggregate stats
  const stats = React.useMemo(() => {
    const realized = pastDeals.filter(d => d.status === 'exited' || d.status === 'realized');
    
    return {
      totalDeals: pastDeals.length,
      totalCapital: pastDeals.reduce((sum, d) => sum + d.investmentAmount, 0),
      realizedDeals: realized.length,
      avgIrr: realized.length > 0 
        ? realized.reduce((sum, d) => sum + (d.actualIrr || 0), 0) / realized.length 
        : 0,
      avgMultiple: realized.length > 0
        ? realized.reduce((sum, d) => sum + (d.equityMultiple || 0), 0) / realized.length
        : 0,
      avgHoldPeriod: realized.length > 0
        ? realized.reduce((sum, d) => sum + (d.holdPeriod || 0), 0) / realized.length
        : 0,
    };
  }, [pastDeals]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  if (pastDeals.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Track Record Yet</h3>
        <p className="text-gray-500 mb-4">
          Add past deals to showcase your investment performance
        </p>
        {isEditable && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Past Deals
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Track Record</h3>
              <p className="text-purple-100 text-sm">Historical performance</p>
            </div>
          </div>
          {isEditable && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Building2 className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
            <p className="text-sm text-gray-500">Total Deals</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCapital)}</p>
            <p className="text-sm text-gray-500">Capital Deployed</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{stats.avgIrr.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Avg IRR</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Percent className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.avgMultiple.toFixed(2)}x</p>
            <p className="text-sm text-gray-500">Avg Multiple</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.avgHoldPeriod.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Hold (yrs)</p>
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Past Investments
          </h4>
          
          {pastDeals.map((deal) => (
            <div
              key={deal.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors"
            >
              <button
                onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{deal.name}</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{deal.propertyType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deal.location}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {deal.actualIrr && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{deal.actualIrr}%</p>
                      <p className="text-xs text-gray-500">IRR</p>
                    </div>
                  )}
                  {deal.equityMultiple && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{deal.equityMultiple}x</p>
                      <p className="text-xs text-gray-500">Multiple</p>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    deal.status === 'exited' || deal.status === 'realized'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {deal.status === 'exited' || deal.status === 'realized' ? 'Realized' : 'Active'}
                  </span>
                  {expandedDeal === deal.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {/* Expanded Details */}
              {expandedDeal === deal.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Investment Size</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(deal.investmentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Acquisition</p>
                      <p className="font-semibold text-gray-900">{deal.acquisitionYear}</p>
                    </div>
                    {deal.exitYear && (
                      <div>
                        <p className="text-sm text-gray-500">Exit</p>
                        <p className="font-semibold text-gray-900">{deal.exitYear}</p>
                      </div>
                    )}
                    {deal.holdPeriod && (
                      <div>
                        <p className="text-sm text-gray-500">Hold Period</p>
                        <p className="font-semibold text-gray-900">{deal.holdPeriod} years</p>
                      </div>
                    )}
                  </div>
                  {deal.description && (
                    <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {deal.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700">
            <strong>Disclaimer:</strong> Past performance is not indicative of future results. 
            Returns shown are net of fees and represent actual realized returns where applicable. 
            Individual investor results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

