import React, { useState, useMemo } from 'react';
import { 
  Calculator, DollarSign, TrendingUp, Calendar, 
  PieChart, ArrowRight, Info, ChevronDown, ChevronUp
} from 'lucide-react';

interface CalculatorProps {
  minimumInvestment?: number;
  targetIrr?: number;
  investmentTerm?: number;
  preferredReturn?: number;
  equityMultiple?: number;
}

export function InvestmentCalculator({
  minimumInvestment = 50000,
  targetIrr = 18,
  investmentTerm = 5,
  preferredReturn = 8,
  equityMultiple = 2.0,
}: CalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(minimumInvestment);
  const [showDetails, setShowDetails] = useState(false);

  const projections = useMemo(() => {
    const principal = investmentAmount;
    const annualReturn = (targetIrr || 18) / 100;
    const term = investmentTerm || 5;
    const prefReturn = (preferredReturn || 8) / 100;
    const multiple = equityMultiple || 2.0;

    // Calculate yearly distributions (preferred return)
    const yearlyDistribution = principal * prefReturn;
    const totalDistributions = yearlyDistribution * term;

    // Calculate final value using equity multiple
    const finalValue = principal * multiple;

    // Calculate total returns
    const totalReturns = finalValue - principal + totalDistributions;

    // Calculate IRR (simplified)
    const actualIrr = ((finalValue / principal) ** (1 / term) - 1) * 100;

    // Year by year breakdown
    const yearlyBreakdown = [];
    let cumulativeDistributions = 0;
    for (let year = 1; year <= term; year++) {
      cumulativeDistributions += yearlyDistribution;
      yearlyBreakdown.push({
        year,
        distribution: yearlyDistribution,
        cumulativeDistributions,
        estimatedValue: principal * (1 + (annualReturn * year * 0.3)), // Simplified appreciation
      });
    }

    return {
      principal,
      yearlyDistribution,
      totalDistributions,
      finalValue,
      totalReturns,
      actualIrr: isNaN(actualIrr) ? targetIrr : actualIrr,
      yearlyBreakdown,
    };
  }, [investmentAmount, targetIrr, investmentTerm, preferredReturn, equityMultiple]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatWithCommas = (value: number) => {
    return value.toLocaleString('en-US');
  };

  const handleAmountChange = (value: string) => {
    const num = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (!isNaN(num)) {
      setInvestmentAmount(Math.max(num, minimumInvestment));
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Investment Calculator</h3>
            <p className="text-blue-100 text-sm">Estimate your potential returns</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Investment Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="text"
              value={formatWithCommas(investmentAmount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-gray-900 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Minimum investment: {formatCurrency(minimumInvestment)}
          </p>
          
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[minimumInvestment, minimumInvestment * 2, minimumInvestment * 5, minimumInvestment * 10].map((amount) => (
              <button
                key={amount}
                onClick={() => setInvestmentAmount(amount)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  investmentAmount === amount
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Annual Distribution
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(projections.yearlyDistribution)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {preferredReturn}% preferred return
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Total Distributions
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(projections.totalDistributions)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Over {investmentTerm} years
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Est. Final Value
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(projections.finalValue)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {equityMultiple}x equity multiple
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 text-sm mb-1">
              <PieChart className="h-4 w-4" />
              Total Returns
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(projections.totalReturns)}
            </p>
            <p className="text-xs text-emerald-500 mt-1">
              +{((projections.totalReturns / projections.principal) * 100).toFixed(0)}% return
            </p>
          </div>
        </div>

        {/* Year by Year Breakdown */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-700">Year-by-Year Breakdown</span>
          {showDetails ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showDetails && (
          <div className="mt-4 bg-white rounded-xl border border-blue-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Year</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Distribution</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {projections.yearlyBreakdown.map((row, idx) => (
                  <tr key={row.year} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-900 font-medium">Year {row.year}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      +{formatCurrency(row.distribution)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(row.cumulativeDistributions)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-semibold">
                  <td className="px-4 py-3 text-emerald-800">Exit (Year {investmentTerm})</td>
                  <td className="px-4 py-3 text-right text-emerald-600" colSpan={2}>
                    +{formatCurrency(projections.finalValue - projections.principal)} capital gain
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Disclaimer:</strong> These projections are estimates based on target returns and are not guaranteed. 
              Actual returns may vary. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simpler version for embedding in deal pages
export function ReturnsCalculator() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <InvestmentCalculator />
    </div>
  );
}

