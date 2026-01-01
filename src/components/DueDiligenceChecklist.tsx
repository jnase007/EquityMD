import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, AlertTriangle, FileText, 
  Building2, Users, DollarSign, MapPin, Scale,
  ChevronDown, ChevronUp, Flag, Download, Share2,
  Clock, Star, Info, Lock
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: string;
}

interface DealChecklist {
  deal_id: string;
  user_id: string;
  completed_items: string[];
  notes: Record<string, string>;
  red_flags: string[];
  created_at: string;
  updated_at: string;
}

const CHECKLIST_CATEGORIES = [
  {
    id: 'syndicator',
    title: 'Syndicator Verification',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    items: [
      { id: 'syn_track_record', label: 'Review track record', description: 'Check past deal performance and exits', required: true },
      { id: 'syn_references', label: 'Check references', description: 'Speak with previous investors', required: false },
      { id: 'syn_background', label: 'Background check', description: 'Verify no legal issues or bankruptcies', required: true },
      { id: 'syn_license', label: 'Verify licenses', description: 'Confirm proper SEC registrations', required: true },
      { id: 'syn_team', label: 'Evaluate team', description: 'Assess management experience', required: false },
    ],
  },
  {
    id: 'property',
    title: 'Property Analysis',
    icon: Building2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    items: [
      { id: 'prop_inspection', label: 'Property inspection report', description: 'Review condition and needed repairs', required: true },
      { id: 'prop_appraisal', label: 'Independent appraisal', description: 'Verify market value', required: true },
      { id: 'prop_environmental', label: 'Environmental report', description: 'Check for contamination issues', required: true },
      { id: 'prop_title', label: 'Title search', description: 'Confirm clear title and liens', required: true },
      { id: 'prop_insurance', label: 'Insurance review', description: 'Verify adequate coverage', required: false },
    ],
  },
  {
    id: 'market',
    title: 'Market Research',
    icon: MapPin,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    items: [
      { id: 'mkt_demographics', label: 'Demographics analysis', description: 'Population growth and income trends', required: false },
      { id: 'mkt_employment', label: 'Employment data', description: 'Major employers and job growth', required: false },
      { id: 'mkt_competition', label: 'Competition analysis', description: 'Comparable properties and occupancy', required: true },
      { id: 'mkt_rent_comps', label: 'Rent comparables', description: 'Verify projected rents are realistic', required: true },
      { id: 'mkt_supply', label: 'New supply pipeline', description: 'Planned development in area', required: false },
    ],
  },
  {
    id: 'financials',
    title: 'Financial Review',
    icon: DollarSign,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    items: [
      { id: 'fin_proforma', label: 'Review pro forma', description: 'Verify assumptions are reasonable', required: true },
      { id: 'fin_expenses', label: 'Expense analysis', description: 'Compare to industry standards', required: true },
      { id: 'fin_debt', label: 'Debt terms review', description: 'Understand loan structure and covenants', required: true },
      { id: 'fin_waterfall', label: 'Waterfall structure', description: 'Understand profit distribution', required: true },
      { id: 'fin_fees', label: 'Fee analysis', description: 'Review all syndicator fees', required: true },
      { id: 'fin_reserves', label: 'Reserve adequacy', description: 'Verify sufficient contingency', required: false },
    ],
  },
  {
    id: 'legal',
    title: 'Legal Documents',
    icon: Scale,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    items: [
      { id: 'legal_ppm', label: 'Read PPM thoroughly', description: 'Private Placement Memorandum review', required: true },
      { id: 'legal_operating', label: 'Operating agreement', description: 'Understand your rights and obligations', required: true },
      { id: 'legal_subscription', label: 'Subscription agreement', description: 'Review investment terms', required: true },
      { id: 'legal_attorney', label: 'Attorney review', description: 'Have lawyer review documents', required: false },
      { id: 'legal_tax', label: 'Tax implications', description: 'Consult with tax advisor', required: false },
    ],
  },
];

interface DueDiligenceChecklistProps {
  dealId: string;
  dealTitle: string;
  onClose?: () => void;
}

export function DueDiligenceChecklist({ dealId, dealTitle, onClose }: DueDiligenceChecklistProps) {
  const { user } = useAuthStore();
  const [checklist, setChecklist] = useState<DealChecklist | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [redFlags, setRedFlags] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>('syndicator');
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState<string | null>(null);

  const totalItems = CHECKLIST_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedCount = completedItems.size;
  const progress = Math.round((completedCount / totalItems) * 100);

  const requiredItems = CHECKLIST_CATEGORIES.flatMap(cat => 
    cat.items.filter(item => item.required)
  );
  const completedRequired = requiredItems.filter(item => completedItems.has(item.id)).length;
  const allRequiredComplete = completedRequired === requiredItems.length;

  useEffect(() => {
    if (user) {
      loadChecklist();
    }
  }, [user, dealId]);

  const loadChecklist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('due_diligence_checklists')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setChecklist(data);
        setCompletedItems(new Set(data.completed_items || []));
        setNotes(data.notes || {});
        setRedFlags(new Set(data.red_flags || []));
      }
    } catch (error) {
      // Checklist doesn't exist yet
    }
  };

  const saveChecklist = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const checklistData = {
        deal_id: dealId,
        user_id: user.id,
        completed_items: Array.from(completedItems),
        notes,
        red_flags: Array.from(redFlags),
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('due_diligence_checklists')
        .upsert(checklistData);

    } catch (error) {
      console.error('Error saving checklist:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const toggleRedFlag = (itemId: string) => {
    const newFlags = new Set(redFlags);
    if (newFlags.has(itemId)) {
      newFlags.delete(itemId);
    } else {
      newFlags.add(itemId);
    }
    setRedFlags(newFlags);
  };

  const updateNote = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const downloadChecklist = () => {
    let content = `Due Diligence Checklist\n`;
    content += `Deal: ${dealTitle}\n`;
    content += `Progress: ${progress}%\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    CHECKLIST_CATEGORIES.forEach(category => {
      content += `\n${category.title}\n`;
      content += '='.repeat(category.title.length) + '\n';
      
      category.items.forEach(item => {
        const status = completedItems.has(item.id) ? '✓' : '○';
        const flag = redFlags.has(item.id) ? ' ⚠️ RED FLAG' : '';
        content += `${status} ${item.label}${flag}\n`;
        if (notes[item.id]) {
          content += `   Notes: ${notes[item.id]}\n`;
        }
      });
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due-diligence-${dealTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Due Diligence Checklist</h3>
              <p className="text-white/80 text-sm">{dealTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadChecklist}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              title="Download checklist"
            >
              <Download className="h-5 w-5 text-white" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <span className="text-white text-xl">×</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
            <div className="text-sm text-gray-500">
              {completedCount} of {totalItems} items complete
            </div>
          </div>
          {allRequiredComplete && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              All required items complete
            </div>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {redFlags.size > 0 && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {redFlags.size} red flag(s) noted
          </div>
        )}
      </div>

      {/* Checklist Categories */}
      <div className="max-h-[500px] overflow-y-auto">
        {CHECKLIST_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const categoryCompleted = category.items.filter(item => completedItems.has(item.id)).length;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="border-b last:border-b-0">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <Icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{category.title}</div>
                    <div className="text-sm text-gray-500">
                      {categoryCompleted} of {category.items.length} complete
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.bgColor.replace('50', '500')}`}
                      style={{ width: `${(categoryCompleted / category.items.length) * 100}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-gray-50 px-4 pb-4">
                  {category.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 mb-2 rounded-xl bg-white border ${
                        redFlags.has(item.id) 
                          ? 'border-red-200 bg-red-50' 
                          : completedItems.has(item.id) 
                            ? 'border-emerald-200' 
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {completedItems.has(item.id) ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              completedItems.has(item.id) ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {item.label}
                            </span>
                            {item.required && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                          
                          {showNotes === item.id && (
                            <textarea
                              value={notes[item.id] || ''}
                              onChange={(e) => updateNote(item.id, e.target.value)}
                              placeholder="Add notes..."
                              className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              rows={2}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowNotes(showNotes === item.id ? null : item.id)}
                            className={`p-1.5 rounded-lg transition ${
                              notes[item.id] 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title="Add notes"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleRedFlag(item.id)}
                            className={`p-1.5 rounded-lg transition ${
                              redFlags.has(item.id) 
                                ? 'bg-red-100 text-red-600' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title="Flag as concern"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Your checklist is saved automatically
        </div>
        <button
          onClick={saveChecklist}
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </div>
  );
}

// Mini version for deal cards
export function DueDiligenceProgress({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${
            progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${
        progress === 100 ? 'text-emerald-600' : 'text-amber-600'
      }`}>
        {progress}%
      </span>
    </div>
  );
}

