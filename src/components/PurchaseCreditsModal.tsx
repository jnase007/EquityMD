import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { purchaseCredits } from '../lib/stripe';

interface PurchaseCreditsModalProps {
  onClose: () => void;
  creditPrice: number;
  currentBalance: number;
}

export function PurchaseCreditsModal({ onClose, creditPrice, currentBalance }: PurchaseCreditsModalProps) {
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      await purchaseCredits(quantity);
      // The user will be redirected to Stripe checkout
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('There was an error processing your purchase. Please try again.');
      setLoading(false);
    }
  };

  const totalPrice = quantity * creditPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Purchase Additional Credits
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Current Balance</span>
              </div>
              <span className="font-bold">{currentBalance} credits</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Credits to Purchase
            </label>
            <input
              type="number"
              min="5"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(5, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Minimum purchase: 5 credits
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div className="text-gray-700">Price per credit</div>
              <div className="font-medium">${creditPrice.toFixed(2)}</div>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <div className="font-medium">Total</div>
              <div className="text-xl font-bold">${totalPrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading || quantity < 5}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Processing...' : (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  Purchase
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}