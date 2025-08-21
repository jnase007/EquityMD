import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, Plus, History, ExternalLink } from 'lucide-react';
import { purchaseCredits, openBillingPortal } from '../../lib/stripe';

interface CreditInfo {
  balance: number;
  tier: {
    name: string;
    credits_per_month: number;
    extra_credit_price: number;
  };
  transactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
  }[];
}

export function CreditStatus() {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchCreditInfo();
  }, []);

  async function fetchCreditInfo() {
    try {
      // Get user's subscription and credit info
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          *,
          tier:subscription_tiers(
            name,
            credits_per_month,
            extra_credit_price
          )
        `)
        .eq('status', 'active')
        .single();

      // Get credit balance
      const { data: credits } = await supabase
        .from('credits')
        .select('balance')
        .single();

      // Get recent transactions
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setCreditInfo({
        balance: credits?.balance || 0,
        tier: subscription?.tier || {
          name: 'No Active Subscription',
          credits_per_month: 0,
          extra_credit_price: 2.50
        },
        transactions: transactions || []
      });
    } catch (error) {
      console.error('Error fetching credit info:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePurchaseCredits = async () => {
    try {
      setIsPurchasing(true);
      await purchaseCredits(purchaseAmount);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openBillingPortal();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading credit information...</div>;
  }

  if (!creditInfo) {
    return <div>No credit information available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Credit Balance</h2>
          <div className="text-sm text-gray-500">{creditInfo.tier.name} Plan</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-700"
          >
            <History className="h-5 w-5" />
          </button>
          <button
            onClick={handleManageSubscription}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{creditInfo.balance}</div>
            <div className="text-sm text-gray-500">credits</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-500">Monthly Reset</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{creditInfo.tier.credits_per_month}</div>
            <div className="text-sm text-gray-500">credits</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm text-gray-500">Extra Credits</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">${creditInfo.tier.extra_credit_price}</div>
            <div className="text-sm text-gray-500">per credit</div>
          </div>
        </div>
      </div>

      {/* Purchase Credits */}
      <div className="mb-8 p-6 border rounded-lg">
        <h3 className="font-bold mb-4">Purchase Additional Credits</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Credits
            </label>
            <input
              type="number"
              min="5"
              max="1000"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">Total Price</div>
            <div className="text-xl font-bold">
              ${(purchaseAmount * creditInfo.tier.extra_credit_price).toFixed(2)}
            </div>
          </div>
          <button
            onClick={handlePurchaseCredits}
            disabled={isPurchasing || purchaseAmount < 5}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPurchasing ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      </div>

      {showHistory && (
        <div>
          <h3 className="font-bold mb-4">Transaction History</h3>
          <div className="space-y-4">
            {creditInfo.transactions.map(transaction => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'usage' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'usage' ? '-' : '+'}{Math.abs(transaction.amount)}
                </div>
              </div>
            ))}

            {creditInfo.transactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Note:</strong> Credits reset monthly with your subscription. Unused credits do not roll over.
        </div>
      </div>
    </div>
  );
}