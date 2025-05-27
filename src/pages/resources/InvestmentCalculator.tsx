import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

export function InvestmentCalculator() {
  const [values, setValues] = useState({
    purchasePrice: 1000000,
    downPayment: 25,
    interestRate: 5,
    loanTerm: 30,
    rentalIncome: 8000,
    expenses: 2000,
    appreciationRate: 3,
  });

  const [results, setResults] = useState({
    monthlyPayment: 0,
    cashFlow: 0,
    cashOnCash: 0,
    totalReturn: 0,
  });

  const calculateReturns = () => {
    const downPaymentAmount = (values.purchasePrice * values.downPayment) / 100;
    const loanAmount = values.purchasePrice - downPaymentAmount;
    const monthlyInterest = values.interestRate / 12 / 100;
    const totalPayments = values.loanTerm * 12;

    // Monthly mortgage payment calculation
    const monthlyPayment =
      (loanAmount *
        (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments))) /
      (Math.pow(1 + monthlyInterest, totalPayments) - 1);

    // Monthly cash flow
    const cashFlow = values.rentalIncome - values.expenses - monthlyPayment;

    // Cash on cash return
    const annualCashFlow = cashFlow * 12;
    const cashOnCash = (annualCashFlow / downPaymentAmount) * 100;

    // Total return including appreciation
    const futureValue =
      values.purchasePrice *
      Math.pow(1 + values.appreciationRate / 100, values.loanTerm);
    const totalReturn =
      ((futureValue - values.purchasePrice + annualCashFlow * values.loanTerm) /
        downPaymentAmount) *
      100;

    setResults({
      monthlyPayment: Math.round(monthlyPayment),
      cashFlow: Math.round(cashFlow),
      cashOnCash: Math.round(cashOnCash * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Real Estate Calculator
          </h1>
          <p className="text-xl text-blue-100">
            Educational tool for real estate analysis—contact syndicators for actual returns. EquityMD doesn't provide investment advice.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Property Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.purchasePrice}
                      onChange={(e) =>
                        setValues({ ...values, purchasePrice: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Down Payment %
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.downPayment}
                      onChange={(e) =>
                        setValues({ ...values, downPayment: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate %
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.interestRate}
                      onChange={(e) =>
                        setValues({ ...values, interestRate: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Term (Years)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.loanTerm}
                      onChange={(e) =>
                        setValues({ ...values, loanTerm: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Income & Expenses</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rental Income
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.rentalIncome}
                      onChange={(e) =>
                        setValues({ ...values, rentalIncome: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Expenses
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.expenses}
                      onChange={(e) =>
                        setValues({ ...values, expenses: Number(e.target.value) })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Appreciation Rate %
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={values.appreciationRate}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          appreciationRate: Number(e.target.value),
                        })
                      }
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateReturns}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6"
                >
                  Calculate Returns
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Property Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">For educational purposes only—contact syndicators for actual investment returns. EquityMD doesn't provide investment advice.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Monthly Payment</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${results.monthlyPayment.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Monthly Cash Flow</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${results.cashFlow.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Cash on Cash Return</div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.cashOnCash}%
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Return</div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.totalReturn}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}