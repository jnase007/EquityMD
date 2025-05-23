import React, { useState } from 'react';
import { Tooltip, InfoIcon } from '../components/Tooltip';

export function TooltipDemo() {
  const [accreditedStatus, setAccreditedStatus] = useState(false);

  const accreditedInvestorTooltip = "An accredited investor has an annual income over $200,000 ($300,000 joint) for 2 years, or a net worth over $1M (excluding home), or specific professional licenses. This SEC definition allows you to invest in private deals on Equitymd.com.";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tooltip Demo</h1>
          
          <div className="space-y-8">
            {/* Accredited Investor Checkbox with Tooltip */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Accredited Investor Checkbox</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accreditedStatus}
                    onChange={(e) => setAccreditedStatus(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I am an accredited investor
                  </span>
                  <Tooltip content={accreditedInvestorTooltip} position="right" maxWidth="320px">
                    <div className="ml-2 cursor-help">
                      <InfoIcon className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                    </div>
                  </Tooltip>
                </label>
                <p className="text-sm text-gray-600">
                  Status: {accreditedStatus ? 'Accredited' : 'Not Accredited'}
                </p>
              </div>
            </div>

            {/* Different Tooltip Positions */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tooltip Positions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <Tooltip content="This tooltip appears on top" position="top">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Top
                    </button>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="This tooltip appears on the right" position="right">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Right
                    </button>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="This tooltip appears on the bottom" position="bottom">
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                      Bottom
                    </button>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="This tooltip appears on the left" position="left">
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      Left
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Long Content Tooltip */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Long Content Tooltip</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Investment Terms</span>
                <Tooltip 
                  content="This is a longer tooltip that demonstrates how the component handles extended content. It includes multiple sentences and should wrap properly within the specified maximum width. The tooltip will automatically adjust its position if it would go off-screen."
                  position="top"
                  maxWidth="400px"
                >
                  <InfoIcon className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-help" />
                </Tooltip>
              </div>
            </div>

            {/* Mobile-Friendly Tooltip */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mobile-Friendly</h2>
              <p className="text-gray-600 mb-4">
                On mobile devices, tap the info icon to show/hide the tooltip:
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">Minimum Investment</span>
                <Tooltip 
                  content="The minimum investment amount required to participate in this deal. This helps ensure all investors meet the financial requirements."
                  position="top"
                  maxWidth="280px"
                >
                  <InfoIcon className="w-4 h-4 text-blue-500 cursor-help" />
                </Tooltip>
              </div>
            </div>

            {/* Implementation Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Implementation Notes</h2>
              <ul className="space-y-2 text-blue-700">
                <li>• Tooltips show after a 300ms delay on hover</li>
                <li>• Position automatically adjusts to avoid screen edges</li>
                <li>• Mobile-friendly with tap to show/hide functionality</li>
                <li>• Lightweight CSS-only implementation</li>
                <li>• Accessible with proper ARIA attributes</li>
                <li>• Customizable max-width and positioning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 