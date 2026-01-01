import React, { useState, useMemo } from 'react';
import { 
  Calculator, DollarSign, TrendingUp, Calendar, 
  Download, RefreshCw, Info, ChevronDown, ChevronUp,
  BarChart3, PieChart, Target
} from 'lucide-react';

interface InvestmentCalculatorProps {
  defaultInvestment?: number;
  targetIRR?: number;
  investmentTerm?: number;
  equityMultiple?: number;
  preferredReturn?: number;
}

interface YearlyProjection {
  year: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  equity: number;
}

export function InvestmentCalculator({
  defaultInvestment = 50000,
  targetIRR = 18,
  investmentTerm = 5,
  equityMultiple = 2.0,
  preferredReturn = 8,
}: InvestmentCalculatorProps) {
  const [investment, setInvestment] = useState(defaultInvestment);
  const [scenario, setScenario] = useState<'conservative' | 'expected' | 'optimistic'>('expected');
  const [showDetails, setShowDetails] = useState(false);

  const scenarioMultipliers = {
    conservative: 0.7,
    expected: 1.0,
    optimistic: 1.3,
  };

  const calculations = useMemo(() => {
    const multiplier = scenarioMultipliers[scenario];
    const adjustedIRR = targetIRR * multiplier;
    const adjustedMultiple = 1 + (equityMultiple - 1) * multiplier;
    const annualCashFlow = (investment * (preferredReturn / 100)) * multiplier;
    
    // Calculate yearly projections
    const projections: YearlyProjection[] = [];
    let cumulativeCashFlow = 0;
    
    for (let year = 1; year <= investmentTerm; year++) {
      const cashFlow = annualCashFlow;
      cumulativeCashFlow += cashFlow;
      
      // Equity grows based on appreciation
      const equityGrowthRate = (adjustedMultiple - 1) / investmentTerm;
      const equity = investment * (1 + equityGrowthRate * year);
      
      projections.push({
        year,
        cashFlow,
        cumulativeCashFlow,
        equity,
      });
    }

    // Final return at exit
    const totalCashFlow = annualCashFlow * investmentTerm;
    const exitValue = investment * adjustedMultiple;
    const totalReturn = totalCashFlow + exitValue;
    const profit = totalReturn - investment;
    const roi = ((totalReturn - investment) / investment) * 100;

    return {
      adjustedIRR,
      adjustedMultiple,
      annualCashFlow,
      totalCashFlow,
      exitValue,
      totalReturn,
      profit,
      roi,
      projections,
    };
  }, [investment, scenario, targetIRR, equityMultiple, preferredReturn, investmentTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const investmentPresets = [25000, 50000, 100000, 250000, 500000];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Investment Calculator</h3>
            <p className="text-white/80 text-sm">Model your potential returns</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Investment Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-3 text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            {investmentPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setInvestment(preset)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  investment === preset
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scenario
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['conservative', 'expected', 'optimistic'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`py-3 px-4 rounded-xl font-medium text-sm transition ${
                  scenario === s
                    ? s === 'conservative' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500' :
                      s === 'expected' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' :
                      'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Total Return</div>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(calculations.totalReturn)}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Profit</div>
              <div className="text-2xl font-bold text-emerald-600">
                +{formatCurrency(calculations.profit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Est. IRR</div>
              <div className="text-lg font-bold text-gray-900">
                {calculations.adjustedIRR.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Equity Multiple</div>
              <div className="text-lg font-bold text-gray-900">
                {calculations.adjustedMultiple.toFixed(2)}x
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Annual Cash</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(calculations.annualCashFlow)}
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Timeline */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition mb-4"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Year-by-Year Projections
          </span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showDetails && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Year</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Cash Flow</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Cumulative</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Equity Value</th>
                </tr>
              </thead>
              <tbody>
                {calculations.projections.map((proj) => (
                  <tr key={proj.year} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">Year {proj.year}</td>
                    <td className="py-2 px-3 text-right text-emerald-600">
                      {formatCurrency(proj.cashFlow)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      {formatCurrency(proj.cumulativeCashFlow)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatCurrency(proj.equity)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold">
                  <td className="py-2 px-3">Exit</td>
                  <td className="py-2 px-3 text-right text-emerald-600">
                    {formatCurrency(calculations.exitValue)}
                  </td>
                  <td className="py-2 px-3 text-right" colSpan={2}>
                    Total: {formatCurrency(calculations.totalReturn)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            These projections are estimates only. Actual returns may vary. Past performance 
            is not indicative of future results. Please review all offering documents carefully.
          </p>
        </div>
      </div>
    </div>
  );
}
