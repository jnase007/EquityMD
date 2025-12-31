import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Sparkles,
  ArrowRight,
  Gift,
  Target
} from 'lucide-react';
import { NextStep } from './types';

interface NextStepsCardProps {
  steps: NextStep[];
  title?: string;
  subtitle?: string;
}

export function NextStepsCard({ 
  steps, 
  title = "Your Next Steps",
  subtitle = "Complete these to unlock achievements"
}: NextStepsCardProps) {
  const navigate = useNavigate();
  
  const incompleteSteps = steps.filter(s => !s.completed);
  const completedSteps = steps.filter(s => s.completed);
  const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);
  
  // Get the top 3 priority incomplete steps
  const prioritySteps = incompleteSteps
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-indigo-200 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold">{completionPercentage}%</span>
            <p className="text-indigo-200 text-sm">complete</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Steps list */}
      <div className="p-4">
        {prioritySteps.length > 0 ? (
          <div className="space-y-2">
            {prioritySteps.map((step, index) => (
              <NextStepItem 
                key={step.id} 
                step={step}
                isFirst={index === 0}
                onClick={() => navigate(step.action)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">All Caught Up!</h4>
            <p className="text-gray-500 text-sm">You've completed all the recommended steps</p>
          </div>
        )}
        
        {/* Completed steps summary */}
        {completedSteps.length > 0 && incompleteSteps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {completedSteps.length} step{completedSteps.length !== 1 ? 's' : ''} completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface NextStepItemProps {
  step: NextStep;
  isFirst?: boolean;
  onClick: () => void;
}

function NextStepItem({ step, isFirst = false, onClick }: NextStepItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left transition-all duration-200 group ${
        isFirst 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-300 hover:shadow-md' 
          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isFirst 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200' 
            : 'bg-white shadow'
        }`}>
          {step.completed ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            step.icon
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${isFirst ? 'text-indigo-900' : 'text-gray-900'}`}>
              {step.title}
            </h4>
            {isFirst && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                Recommended
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{step.description}</p>
        </div>
        
        {/* Points reward */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isFirst ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <Zap className="h-4 w-4" />
            <span className="font-bold text-sm">+{step.points}</span>
          </div>
          <ChevronRight className={`h-5 w-5 ${
            isFirst ? 'text-indigo-400' : 'text-gray-400'
          } group-hover:translate-x-1 transition-transform`} />
        </div>
      </div>
    </button>
  );
}

// Inline next step prompt for embedding in pages
interface InlineNextStepProps {
  step: NextStep;
  variant?: 'default' | 'compact' | 'banner';
}

export function InlineNextStep({ step, variant = 'default' }: InlineNextStepProps) {
  const navigate = useNavigate();
  
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{step.icon}</div>
            <div>
              <p className="font-semibold">{step.title}</p>
              <p className="text-indigo-200 text-sm">{step.description}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(step.action)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Start
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <button
        onClick={() => navigate(step.action)}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
      >
        <span>{step.icon}</span>
        <span>{step.title}</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(step.action)}
      className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl text-left hover:shadow-md transition-shadow border border-indigo-100 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">
          {step.icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{step.title}</p>
          <p className="text-sm text-gray-500">{step.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600 font-bold">+{step.points} pts</span>
          <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

// Welcome back card with gamification
interface WelcomeBackProps {
  userName: string;
  streak: number;
  todayPoints?: number;
  nextStep?: NextStep;
}

export function WelcomeBackCard({ userName, streak, todayPoints = 0, nextStep }: WelcomeBackProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">Welcome back</p>
            <h2 className="text-2xl font-bold">{userName}!</h2>
          </div>
          
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full">
              <span className="text-orange-400">🔥</span>
              <span className="font-bold text-orange-300">{streak} day streak</span>
            </div>
          )}
        </div>
        
        {todayPoints > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300 font-medium">+{todayPoints} points earned today</span>
          </div>
        )}
        
        {nextStep && (
          <button
            onClick={() => navigate(nextStep.action)}
            className="w-full mt-2 p-4 bg-white/10 backdrop-blur rounded-xl text-left hover:bg-white/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-xl">
                {nextStep.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-0.5">Your next step</p>
                <p className="font-semibold">{nextStep.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Gift className="h-4 w-4" />
                  <span className="font-bold">+{nextStep.points}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

