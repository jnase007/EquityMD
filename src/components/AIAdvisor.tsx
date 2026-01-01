import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Send, X, Sparkles, Building2,
  HelpCircle, DollarSign, TrendingUp, MapPin,
  ChevronDown, ChevronUp, Bot, User, Loader2,
  Search, BookOpen, Calculator, Shield
} from 'lucide-react';
import { useAuthStore } from '../lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  text: string;
  icon: React.ReactNode;
  category: string;
}

// AI-powered responses based on keywords and context
const generateResponse = (question: string, dealContext?: any): string => {
  const q = question.toLowerCase();
  
  // Deal-specific responses
  if (dealContext) {
    if (q.includes('minimum') || q.includes('invest')) {
      return `The minimum investment for ${dealContext.title} is $${dealContext.minimum_investment?.toLocaleString() || '50,000'}. This gives you access to the same terms as all limited partners in this syndication.`;
    }
    if (q.includes('irr') || q.includes('return')) {
      return `${dealContext.title} targets a ${dealContext.target_irr || 18}% IRR with an equity multiple of ${dealContext.equity_multiple || 2.0}x over the hold period. Remember, these are projections and actual returns may vary based on market conditions and execution.`;
    }
    if (q.includes('risk')) {
      return `Key risks to consider for ${dealContext.title}:\n\n• **Market Risk**: Property values can fluctuate\n• **Execution Risk**: Renovation/management challenges\n• **Liquidity Risk**: Investments are typically locked for the hold period\n• **Leverage Risk**: Debt amplifies both gains and losses\n\nAlways review the PPM for a complete risk discussion.`;
    }
    if (q.includes('location') || q.includes('where')) {
      return `${dealContext.title} is located in ${dealContext.location}. This market has been chosen for factors like population growth, job creation, and rent growth potential. I'd recommend researching the specific submarket demographics.`;
    }
  }
  
  // General educational responses
  if (q.includes('accredited') || q.includes('accreditation')) {
    return `An **accredited investor** is someone who meets one of these criteria:\n\n• **Income**: $200K+ individual income (or $300K+ joint) for the last 2 years\n• **Net Worth**: $1M+ net worth excluding primary residence\n• **Professional**: Certain financial professionals (Series 7, 65, or 82 licenses)\n\nMost real estate syndications require accredited investor status due to SEC regulations.`;
  }
  
  if (q.includes('syndication') || q.includes('how does it work')) {
    return `A **real estate syndication** is a group investment where:\n\n1. **Syndicator (GP)**: Finds, manages, and operates the deal\n2. **Investors (LPs)**: Provide capital and receive passive returns\n\n**Typical structure:**\n• Investors receive preferred return (often 6-8%)\n• Remaining profits split (e.g., 70% investors / 30% syndicator)\n• Hold period: Usually 3-7 years`;
  }
  
  if (q.includes('due diligence') || q.includes('what should i look')) {
    return `Key due diligence items for any syndication:\n\n**Syndicator:**\n• Track record & experience\n• References from past investors\n• Skin in the game\n\n**Deal:**\n• Market fundamentals\n• Business plan assumptions\n• Pro forma analysis\n• Debt terms & covenants\n\n**Legal:**\n• PPM review\n• Operating agreement terms\n• Fee structure`;
  }
  
  if (q.includes('preferred return') || q.includes('pref')) {
    return `A **preferred return** (pref) is the minimum return investors receive before the syndicator gets their profit share.\n\n**Example:**\n• 8% preferred return\n• If property generates 12% returns:\n  - First 8% goes to investors\n  - Remaining 4% is split per the waterfall\n\nThis protects investors and aligns interests.`;
  }
  
  if (q.includes('equity multiple') || q.includes('multiple')) {
    return `**Equity Multiple** shows your total return as a multiple of your investment.\n\n**Formula:** Total Distributions ÷ Initial Investment\n\n**Example:**\n• Invest $100,000\n• Receive $200,000 total (cash flow + sale proceeds)\n• Equity Multiple = 2.0x\n\nThis means you doubled your money. A 2.0x multiple over 5 years ≈ 15% IRR.`;
  }
  
  if (q.includes('irr')) {
    return `**IRR (Internal Rate of Return)** is the annualized rate of return accounting for the timing of cash flows.\n\n**Key points:**\n• Better for comparing investments of different durations\n• 15-20% IRR is common target for value-add multifamily\n• Higher IRR can mean higher risk\n• Consider alongside equity multiple for full picture`;
  }
  
  if (q.includes('k-1') || q.includes('tax') || q.includes('k1')) {
    return `**Tax Benefits of Real Estate Syndications:**\n\n• **Depreciation**: Offsets taxable income\n• **K-1 Forms**: You'll receive annually showing income/losses\n• **1031 Exchange**: Some syndications allow tax-deferred rollovers\n• **Cost Segregation**: Accelerates depreciation benefits\n\n*Always consult with a tax professional for your specific situation.*`;
  }
  
  if (q.includes('compare') || q.includes('difference')) {
    return `**Comparing Deals:**\n\nUse our Deal Comparison Tool to evaluate deals side-by-side on:\n• Target IRR & Equity Multiple\n• Minimum Investment\n• Property Type & Location\n• Hold Period\n• Fee Structure\n\nNo single metric tells the whole story—consider risk-adjusted returns!`;
  }
  
  // Default helpful response
  return `Great question! Here are some resources that might help:\n\n• **Due Diligence Guide**: Step-by-step checklist\n• **Investment Calculator**: Model potential returns\n• **Glossary**: Investment term definitions\n• **Deal Comparison**: Compare opportunities side-by-side\n\nFor specific deal questions, I recommend reaching out to the syndicator directly. Is there something else I can help explain?`;
};

interface AIAdvisorProps {
  dealContext?: any;
  floating?: boolean;
}

export function AIAdvisor({ dealContext, floating = true }: AIAdvisorProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions: SuggestedQuestion[] = dealContext ? [
    { text: `What's the minimum investment for ${dealContext.title}?`, icon: <DollarSign className="h-4 w-4" />, category: 'Investment' },
    { text: `What are the projected returns?`, icon: <TrendingUp className="h-4 w-4" />, category: 'Returns' },
    { text: `What are the key risks?`, icon: <Shield className="h-4 w-4" />, category: 'Risk' },
    { text: `Tell me about the location`, icon: <MapPin className="h-4 w-4" />, category: 'Market' },
  ] : [
    { text: 'What is a real estate syndication?', icon: <Building2 className="h-4 w-4" />, category: 'Basics' },
    { text: 'What does accredited investor mean?', icon: <Shield className="h-4 w-4" />, category: 'Regulations' },
    { text: 'How do I evaluate a syndication deal?', icon: <Search className="h-4 w-4" />, category: 'Due Diligence' },
    { text: 'What is IRR vs equity multiple?', icon: <Calculator className="h-4 w-4" />, category: 'Metrics' },
    { text: 'What are the tax benefits?', icon: <BookOpen className="h-4 w-4" />, category: 'Tax' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generateResponse(messageText, dealContext);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">AI Deal Advisor</h3>
            <p className="text-sm text-white/80">Ask anything about investing</p>
          </div>
        </div>
        {floating && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Hi! I'm your AI Advisor</h4>
            <p className="text-sm text-gray-500 mb-6">
              {dealContext 
                ? `Ask me anything about ${dealContext.title}` 
                : 'Ask me about real estate investing'}
            </p>
            
            {/* Suggested Questions */}
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-left hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    {q.icon}
                  </div>
                  <span className="text-sm text-gray-700">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-md' 
                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={`${i > 0 ? 'mt-2' : ''} ${message.role === 'user' ? 'text-white' : ''}`}>
                            {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI responses are educational and not financial advice
        </p>
      </div>
    </div>
  );

  if (floating) {
    return (
      <>
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all ${
            isOpen ? 'hidden' : ''
          }`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <ChatContent />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[500px]">
      <ChatContent />
    </div>
  );
}

// Mini Question Widget
export function QuickQuestionWidget({ dealContext }: { dealContext?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const questions = [
    'What\'s the minimum investment?',
    'What are the projected returns?',
    'What are the key risks?',
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span className="font-medium text-indigo-800">Have a Question?</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-indigo-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-indigo-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {questions.map((q, i) => (
            <button
              key={i}
              className="w-full p-2 text-sm text-left text-indigo-700 bg-white rounded-lg hover:bg-indigo-100 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

