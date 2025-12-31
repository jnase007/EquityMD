import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { 
  Palette, Type, Layout, Sparkles, Check, Copy, 
  Square, Circle, ArrowRight, Heart, Star, Zap, Paintbrush
} from 'lucide-react';
import toast from 'react-hot-toast';

const colors = {
  primary: [
    { name: 'Blue 600', hex: '#2563eb', usage: 'Primary buttons, links, accents' },
    { name: 'Blue 700', hex: '#1d4ed8', usage: 'Button hover states' },
    { name: 'Blue 50', hex: '#eff6ff', usage: 'Light backgrounds, hover states' },
    { name: 'Blue 100', hex: '#dbeafe', usage: 'Borders, subtle backgrounds' },
  ],
  secondary: [
    { name: 'Purple 600', hex: '#9333ea', usage: 'Syndicator branding, premium' },
    { name: 'Emerald 600', hex: '#059669', usage: 'Success, verified, positive' },
    { name: 'Amber 500', hex: '#f59e0b', usage: 'Warnings, premier badges' },
    { name: 'Red 500', hex: '#ef4444', usage: 'Errors, destructive actions' },
  ],
  neutral: [
    { name: 'Slate 900', hex: '#0f172a', usage: 'Primary text, headings' },
    { name: 'Gray 600', hex: '#4b5563', usage: 'Secondary text' },
    { name: 'Gray 400', hex: '#9ca3af', usage: 'Placeholder text, icons' },
    { name: 'Gray 100', hex: '#f3f4f6', usage: 'Backgrounds, borders' },
  ],
};

const fonts = {
  headings: {
    family: 'Inter, system-ui, sans-serif',
    weights: ['600 (Semibold)', '700 (Bold)', '800 (Extra Bold)'],
    sizes: ['text-3xl (30px)', 'text-2xl (24px)', 'text-xl (20px)', 'text-lg (18px)'],
  },
  body: {
    family: 'Inter, system-ui, sans-serif',
    weights: ['400 (Regular)', '500 (Medium)', '600 (Semibold)'],
    sizes: ['text-base (16px)', 'text-sm (14px)', 'text-xs (12px)'],
  },
};

const spacing = [
  { name: 'xs', value: '4px', tailwind: 'p-1, m-1, gap-1' },
  { name: 'sm', value: '8px', tailwind: 'p-2, m-2, gap-2' },
  { name: 'md', value: '16px', tailwind: 'p-4, m-4, gap-4' },
  { name: 'lg', value: '24px', tailwind: 'p-6, m-6, gap-6' },
  { name: 'xl', value: '32px', tailwind: 'p-8, m-8, gap-8' },
  { name: '2xl', value: '48px', tailwind: 'p-12, m-12, gap-12' },
];

const borderRadius = [
  { name: 'Subtle', value: '6px', tailwind: 'rounded-md', usage: 'Inputs, small buttons' },
  { name: 'Standard', value: '8px', tailwind: 'rounded-lg', usage: 'Buttons, small cards' },
  { name: 'Large', value: '12px', tailwind: 'rounded-xl', usage: 'Cards, modals' },
  { name: 'Extra Large', value: '16px', tailwind: 'rounded-2xl', usage: 'Feature cards, banners' },
  { name: 'Full', value: '9999px', tailwind: 'rounded-full', usage: 'Avatars, badges' },
];

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const copyHex = () => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex}`);
  };

  return (
    <div className="group">
      <button
        onClick={copyHex}
        className="w-full aspect-[4/3] rounded-2xl shadow-sm border border-gray-100 mb-3 relative overflow-hidden hover:scale-105 transition-transform"
        style={{ backgroundColor: hex }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <Copy className="h-5 w-5 text-white" />
        </div>
      </button>
      <p className="font-semibold text-gray-900 text-sm">{name}</p>
      <p className="text-xs text-gray-500 font-mono">{hex}</p>
      <p className="text-xs text-gray-400 mt-1">{usage}</p>
    </div>
  );
}

export function BrandingGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnptMC00aDR2MmgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Paintbrush 
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + (i % 2) * 40}%`,
                width: `${40 + i * 10}px`,
                height: `${40 + i * 10}px`,
                transform: `rotate(${-10 + i * 20}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Design System</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Equity<span className="text-pink-200">MD</span> Brand Guide
              </h1>
            </div>
          </div>
          
          <p className="text-white/80 text-lg max-w-2xl">
            Our visual language and design principles for creating consistent, beautiful experiences.
          </p>
          
          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Colors</span>
              <p className="text-white font-bold text-xl">12</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Font Sizes</span>
              <p className="text-white font-bold text-xl">7</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-white/70 text-sm">Border Radius</span>
              <p className="text-white font-bold text-xl">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Logo Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Square className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Logo</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Primary Logo</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 flex items-center justify-center mb-4">
                <span className="text-4xl font-extrabold">
                  Equity<span className="text-blue-600">MD</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                The primary logo uses our brand wordmark with "MD" highlighted in blue to emphasize our focus on medical and real estate investment connections.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-white mb-4">Inverted Logo</h3>
              <div className="bg-slate-800/50 rounded-xl p-8 flex items-center justify-center mb-4">
                <span className="text-4xl font-extrabold text-white">
                  Equity<span className="text-blue-400">MD</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Use the inverted logo on dark backgrounds. The blue accent shifts to a lighter shade for better contrast.
              </p>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Colors</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Primary Blues</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {colors.primary.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Secondary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {colors.secondary.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Neutrals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {colors.neutral.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Type className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Headings</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 rounded-lg px-3 py-2 inline-block">{fonts.headings.family}</p>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-3xl font-bold text-gray-900">Heading 1 (3xl)</span>
                  <p className="text-xs text-gray-400 mt-1">30px • Bold/Extra Bold</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">Heading 2 (2xl)</span>
                  <p className="text-xs text-gray-400 mt-1">24px • Bold</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-xl font-semibold text-gray-900">Heading 3 (xl)</span>
                  <p className="text-xs text-gray-400 mt-1">20px • Semibold</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Heading 4 (lg)</span>
                  <p className="text-xs text-gray-400 mt-1">18px • Semibold</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Body Text</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 rounded-lg px-3 py-2 inline-block">{fonts.body.family}</p>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-base text-gray-900">Body Regular (base)</span>
                  <p className="text-xs text-gray-400 mt-1">16px • Regular/Medium</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Body Small (sm)</span>
                  <p className="text-xs text-gray-400 mt-1">14px • Regular</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Caption (xs)</span>
                  <p className="text-xs text-gray-400 mt-1">12px • Regular</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing & Radius Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Layout className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Spacing & Radius</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Spacing Scale</h3>
              <div className="space-y-3">
                {spacing.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded" 
                      style={{ width: s.value, height: s.value, minWidth: s.value }}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500 text-sm">{s.value}</span>
                    </div>
                    <code className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{s.tailwind}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Border Radius</h3>
              <div className="space-y-4">
                {borderRadius.map((r) => (
                  <div key={r.name} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-500"
                      style={{ borderRadius: r.value }}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{r.name}</span>
                      <p className="text-xs text-gray-400">{r.usage}</p>
                    </div>
                    <code className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{r.tailwind}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-xl">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Components</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-transparent"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-6">Buttons</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/25">
                Primary Button
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
                Secondary Button
              </button>
              <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition">
                Outline Button
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                <Check className="h-5 w-5" />
                With Icon
              </button>
            </div>

            <h3 className="font-semibold text-gray-900 mb-6">Cards</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Standard Card</h4>
                <p className="text-sm text-gray-600">Light border, subtle shadow, rounded-2xl corners.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yem0wLTRoNHYyaC00di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Gradient Card</h4>
                  <p className="text-sm text-blue-100">For featured content and CTAs.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border-l-4 border-emerald-500 p-6 shadow-md">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Accent Card</h4>
                <p className="text-sm text-gray-600">Left border accent for categorization.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Design Principles</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="font-bold text-gray-900 mb-2">Clean & Modern</h3>
              <p className="text-gray-600 text-sm">
                Generous whitespace, soft shadows, and rounded corners create a premium, approachable feel.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Focused & Clear</h3>
              <p className="text-gray-600 text-sm">
                One primary action per screen. Guide users with visual hierarchy and clear CTAs.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="font-bold text-gray-900 mb-2">Delightful Details</h3>
              <p className="text-gray-600 text-sm">
                Subtle animations, emoji accents, and micro-interactions make the experience enjoyable.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default BrandingGuide;
