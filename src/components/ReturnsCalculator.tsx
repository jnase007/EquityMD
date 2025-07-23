import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const defaultYears = 5;
const defaultInvestment = 100000;
const defaultReturn = 20;

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

export function ReturnsCalculator() {
  const [investment, setInvestment] = useState(defaultInvestment);
  const [annualReturn, setAnnualReturn] = useState(defaultReturn);
  const years = defaultYears;
  const data = getProjectionData(investment, annualReturn, years);

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
            <Tooltip formatter={v => `$${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" dot />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Investment</label>
        <input
          type="number"
          value={investment}
          min={1000}
          step={1000}
          onChange={e => setInvestment(Number(e.target.value))}
          className="w-full border rounded p-2 text-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Compound annualized return</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={annualReturn}
            onChange={e => setAnnualReturn(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 text-right text-lg font-semibold">{annualReturn}%</span>
        </div>
      </div>
    </div>
  );
} 