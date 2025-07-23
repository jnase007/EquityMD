import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const defaultYears = 5;
const defaultInvestment = 100000;
const defaultReturn = 10;

function getProjectionData(investment: number, annualReturn: number, years: number) {
  const data = [];
  let value = investment;
  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      value = value * (1 + annualReturn / 100);
    }
    data.push({
      year: `Year ${year}`,
      value: Math.round(value),
    });
  }
  return data;
}

function formatCurrency(val: number) {
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function ReturnsCalculator() {
  const [investment, setInvestment] = useState(defaultInvestment);
  const [annualReturn, setAnnualReturn] = useState(defaultReturn);
  const years = defaultYears;
  const data = getProjectionData(investment, annualReturn, years);
  const finalValue = data[data.length - 1].value;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Returns calculator</h2>
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => formatCurrency(Number(v))} />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" dot />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-1">Investment</label>
        <input
          type="number"
          value={investment}
          min={1000}
          step={1000}
          onChange={e => setInvestment(Number(e.target.value))}
          className="w-full border rounded p-3 text-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-1">Compound annualized return</label>
        <div className="flex items-center gap-4">
          <span className="text-blue-700 font-semibold w-12">{annualReturn}%</span>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={annualReturn}
            onChange={e => setAnnualReturn(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
        </div>
      </div>
      {/* Summary Card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex-1">
          <div className="text-gray-500 text-sm mb-1">Average length to go full-cycle</div>
          <div className="text-lg font-semibold">{years} years</div>
        </div>
        <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-8">
          <div className="text-gray-500 text-sm mb-1">Total investment return</div>
          <div className="text-lg font-semibold">{formatCurrency(finalValue)}</div>
        </div>
      </div>
    </div>
  );
} 