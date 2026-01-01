import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, ThumbsUp, Send, User, Clock, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  deal_id: string;
  user_id: string;
  question_text: string;
  created_at: string;
  is_answered: boolean;
  upvotes: number;
  user?: {
    full_name: string;
    avatar_url: string;
  };
  answers?: Answer[];
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  created_at: string;
  is_syndicator_answer: boolean;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

interface DealQAProps {
  dealId: string;
  syndicatorId?: string;
}

export function DealQA({ dealId, syndicatorId }: DealQAProps) {
  const { user, profile } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});

  const isSyndicator = syndicatorId && profile?.user_type === 'syndicator';

  useEffect(() => {
    fetchQuestions();
  }, [dealId]);

  async function fetchQuestions() {
    try {
      const { data: questionsData } = await supabase
        .from('deal_questions')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('deal_id', dealId)
        .order('upvotes', { ascending: false });

      if (!questionsData) {
        setQuestions([]);
        return;
      }

      // Fetch answers for each question
      const questionIds = questionsData.map(q => q.id);
      const { data: answersData } = await supabase
        .from('deal_answers')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .in('question_id', questionIds)
        .order('created_at', { ascending: true });

      // Combine questions with answers
      const questionsWithAnswers = questionsData.map(q => ({
        ...q,
        answers: answersData?.filter(a => a.question_id === q.id) || [],
      }));

      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submitQuestion() {
    if (!user || !newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('deal_questions')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          question_text: newQuestion.trim(),
          upvotes: 0,
          is_answered: false,
        });

      if (error) throw error;

      toast.success('Question submitted! 🎉');
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswer(questionId: string) {
    if (!user || !newAnswer[questionId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('deal_answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          answer_text: newAnswer[questionId].trim(),
          is_syndicator_answer: isSyndicator,
        });

      if (error) throw error;

      // Mark question as answered if syndicator
      if (isSyndicator) {
        await supabase
          .from('deal_questions')
          .update({ is_answered: true })
          .eq('id', questionId);
      }

      toast.success('Answer posted! ✅');
      setNewAnswer(prev => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to post answer');
    }
  }

  async function upvoteQuestion(questionId: string) {
    if (!user) {
      toast.error('Sign in to upvote');
      return;
    }

    try {
      // Simple increment - in production, track user upvotes to prevent duplicates
      await supabase
        .from('deal_questions')
        .update({ upvotes: questions.find(q => q.id === questionId)!.upvotes + 1 })
        .eq('id', questionId);

      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Questions & Answers</h3>
            <p className="text-white/80 text-sm">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} about this deal
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Ask Question */}
        {user ? (
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question about this investment..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={submitQuestion}
                    disabled={!newQuestion.trim() || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Posting...' : 'Ask Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-500">Sign in to ask questions</p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No questions yet</p>
              <p className="text-sm text-gray-400">Be the first to ask!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Question */}
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Upvote */}
                    <button
                      onClick={() => upvoteQuestion(question.id)}
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-600 transition"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span className="text-sm font-medium">{question.upvotes}</span>
                    </button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-gray-900 font-medium">{question.question_text}</p>
                        {question.is_answered && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex-shrink-0">
                            <CheckCircle className="h-3 w-3" />
                            Answered
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {question.user?.full_name || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Toggle Answers */}
                      <button
                        onClick={() => setExpandedQuestion(
                          expandedQuestion === question.id ? null : question.id
                        )}
                        className="flex items-center gap-1 mt-3 text-purple-600 text-sm font-medium hover:text-purple-700"
                      >
                        {expandedQuestion === question.id ? (
                          <>Hide answers <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>{question.answers?.length || 0} answers <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                {expandedQuestion === question.id && (
                  <div className="border-t bg-gray-50 p-4">
                    {question.answers && question.answers.length > 0 ? (
                      <div className="space-y-4 mb-4">
                        {question.answers.map((answer) => (
                          <div 
                            key={answer.id} 
                            className={`p-3 rounded-lg ${
                              answer.is_syndicator_answer 
                                ? 'bg-purple-50 border border-purple-200' 
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {answer.user?.avatar_url ? (
                                <img
                                  src={answer.user.avatar_url}
                                  alt={answer.user.full_name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-3 w-3 text-gray-500" />
                                </div>
                              )}
                              <span className="font-medium text-sm">
                                {answer.user?.full_name || 'Anonymous'}
                              </span>
                              {answer.is_syndicator_answer && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  Syndicator
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">{answer.answer_text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">No answers yet</p>
                    )}

                    {/* Add Answer */}
                    {user && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAnswer[question.id] || ''}
                          onChange={(e) => setNewAnswer(prev => ({
                            ...prev,
                            [question.id]: e.target.value
                          }))}
                          placeholder="Write an answer..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => submitAnswer(question.id)}
                          disabled={!newAnswer[question.id]?.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

