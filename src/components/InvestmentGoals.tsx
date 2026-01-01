import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, DollarSign, Building2, 
  ChevronRight, Plus, Edit2, Trash2, Check,
  Star, Award, Zap, Calendar, PieChart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface InvestmentGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  property_types?: string[];
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

interface Milestone {
  percentage: number;
  label: string;
  icon: React.ReactNode;
  celebrationText: string;
}

const MILESTONES: Milestone[] = [
  { percentage: 25, label: 'Quarter Way', icon: <Star className="h-4 w-4" />, celebrationText: 'Great start! 🌟' },
  { percentage: 50, label: 'Halfway There', icon: <Zap className="h-4 w-4" />, celebrationText: 'Halfway to your goal! ⚡' },
  { percentage: 75, label: 'Almost There', icon: <Award className="h-4 w-4" />, celebrationText: 'So close! Keep going! 🏆' },
  { percentage: 100, label: 'Goal Achieved', icon: <Target className="h-4 w-4" />, celebrationText: 'Congratulations! 🎉' },
];

export function InvestmentGoals() {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<InvestmentGoal | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    target_amount: 100000,
    target_date: '',
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('investment_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async () => {
    if (!user || !formData.title) return;

    try {
      const goalData = {
        user_id: user.id,
        title: formData.title,
        target_amount: formData.target_amount,
        current_amount: 0,
        target_date: formData.target_date || null,
        status: 'active' as const,
      };

      if (editingGoal) {
        await supabase
          .from('investment_goals')
          .update(goalData)
          .eq('id', editingGoal.id);
      } else {
        await supabase
          .from('investment_goals')
          .insert(goalData);
      }

      setShowAddForm(false);
      setEditingGoal(null);
      setFormData({ title: '', target_amount: 100000, target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal?')) return;
    
    try {
      await supabase
        .from('investment_goals')
        .delete()
        .eq('id', goalId);
      
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const updateProgress = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
      const wasComplete = goal.current_amount >= goal.target_amount;
      const isNowComplete = newAmount >= goal.target_amount;

      await supabase
        .from('investment_goals')
        .update({ 
          current_amount: newAmount,
          status: isNowComplete ? 'completed' : 'active'
        })
        .eq('id', goalId);

      // Celebrate completion!
      if (!wasComplete && isNowComplete) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProgress = (goal: InvestmentGoal) => {
    return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  };

  const getNextMilestone = (progress: number) => {
    return MILESTONES.find(m => m.percentage > progress) || MILESTONES[MILESTONES.length - 1];
  };

  const totalInvested = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Investment Goals</h3>
              <p className="text-white/80 text-sm">Track your investment journey</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 divide-x border-b">
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</div>
          <div className="text-sm text-gray-500">Total Progress</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalTarget)}</div>
          <div className="text-sm text-gray-500">Total Goals</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{completedGoals}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Set Your First Goal</h4>
            <p className="text-gray-500 text-sm mb-4">
              Track your investment journey and celebrate milestones
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Create Goal
            </button>
          </div>
        ) : (
          goals.map(goal => {
            const progress = getProgress(goal);
            const nextMilestone = getNextMilestone(progress);
            const isCompleted = goal.status === 'completed';

            return (
              <div 
                key={goal.id}
                className={`p-4 rounded-xl border ${
                  isCompleted 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setFormData({
                          title: goal.title,
                          target_amount: goal.target_amount,
                          target_date: goal.target_date || '',
                        });
                        setShowAddForm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-3">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Milestone Markers */}
                  <div className="absolute top-0 left-0 right-0 h-3 flex items-center">
                    {MILESTONES.slice(0, -1).map(milestone => (
                      <div
                        key={milestone.percentage}
                        className="absolute"
                        style={{ left: `${milestone.percentage}%` }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          progress >= milestone.percentage 
                            ? 'bg-white' 
                            : 'bg-gray-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {nextMilestone.icon}
                    <span className={isCompleted ? 'text-emerald-700' : 'text-gray-600'}>
                      {isCompleted ? 'Goal achieved! 🎉' : `Next: ${nextMilestone.label} (${nextMilestone.percentage}%)`}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{progress}%</div>
                </div>

                {/* Quick Add Progress */}
                {!isCompleted && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <span className="text-sm text-gray-500">Quick add:</span>
                    {[10000, 25000, 50000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => updateProgress(goal.id, amount)}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        +{formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., First $100K in Real Estate"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={formData.target_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_amount: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
                  setFormData({ title: '', target_amount: 100000, target_date: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveGoal}
                disabled={!formData.title}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Goal Progress Widget
export function GoalProgressWidget({ className = '' }: { className?: string }) {
  const { user } = useAuthStore();
  const [primaryGoal, setPrimaryGoal] = useState<InvestmentGoal | null>(null);

  useEffect(() => {
    if (user) {
      fetchPrimaryGoal();
    }
  }, [user]);

  const fetchPrimaryGoal = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('investment_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (data) setPrimaryGoal(data);
  };

  if (!primaryGoal) return null;

  const progress = Math.min(100, Math.round((primaryGoal.current_amount / primaryGoal.target_amount) * 100));

  return (
    <div className={`bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-800">{primaryGoal.title}</span>
        </div>
        <span className="text-sm font-bold text-teal-600">{progress}%</span>
      </div>
      <div className="h-2 bg-teal-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

