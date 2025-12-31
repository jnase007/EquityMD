import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { 
  Palette, Type, Layout, Sparkles, Check, Copy, 
  Square, Circle, ArrowRight, Heart, Star, Zap
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
        className="w-full aspect-[4/3] rounded-xl shadow-sm border border-gray-100 mb-3 relative overflow-hidden hover:scale-105 transition-transform"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Design System
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Equity<span className="text-blue-600">MD</span> Brand Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our visual language and design principles for creating consistent, beautiful experiences.
          </p>
        </div>

        {/* Logo Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Square className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Logo</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Primary Logo</h3>
              <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center mb-4">
                <span className="text-4xl font-extrabold">
                  Equity<span className="text-blue-600">MD</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                The primary logo uses our brand wordmark with "MD" highlighted in blue to emphasize our focus on medical and real estate investment connections.
              </p>
            </div>
            
            <div className="bg-slate-900 rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-white mb-4">Inverted Logo</h3>
              <div className="bg-slate-800 rounded-xl p-8 flex items-center justify-center mb-4">
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
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6">Primary Blues</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {colors.primary.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6">Secondary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {colors.secondary.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
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
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Headings</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono">{fonts.headings.family}</p>
              
              <div className="space-y-4">
                <div>
                  <span className="text-3xl font-bold text-gray-900">Heading 1 (3xl)</span>
                  <p className="text-xs text-gray-400 mt-1">30px • Bold/Extra Bold</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">Heading 2 (2xl)</span>
                  <p className="text-xs text-gray-400 mt-1">24px • Bold</p>
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">Heading 3 (xl)</span>
                  <p className="text-xs text-gray-400 mt-1">20px • Semibold</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Heading 4 (lg)</span>
                  <p className="text-xs text-gray-400 mt-1">18px • Semibold</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Body Text</h3>
              <p className="text-sm text-gray-500 mb-6 font-mono">{fonts.body.family}</p>
              
              <div className="space-y-4">
                <div>
                  <span className="text-base text-gray-900">Body Regular (base)</span>
                  <p className="text-xs text-gray-400 mt-1">16px • Regular/Medium</p>
                </div>
                <div>
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
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6">Spacing Scale</h3>
              <div className="space-y-3">
                {spacing.map((s) => (
                  <div key={s.name} className="flex items-center gap-4">
                    <div 
                      className="bg-blue-500 rounded" 
                      style={{ width: s.value, height: s.value, minWidth: s.value }}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500 text-sm">{s.value}</span>
                    </div>
                    <code className="text-xs text-gray-400 font-mono">{s.tailwind}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6">Border Radius</h3>
              <div className="space-y-4">
                {borderRadius.map((r) => (
                  <div key={r.name} className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 bg-blue-100 border-2 border-blue-500"
                      style={{ borderRadius: r.value }}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{r.name}</span>
                      <p className="text-xs text-gray-400">{r.usage}</p>
                    </div>
                    <code className="text-xs text-gray-400 font-mono">{r.tailwind}</code>
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
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Buttons</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                Primary Button
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
                Secondary Button
              </button>
              <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition">
                Outline Button
              </button>
              <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
                <Check className="h-5 w-5" />
                With Icon
              </button>
            </div>

            <h3 className="font-semibold text-gray-900 mb-6">Cards</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Standard Card</h4>
                <p className="text-sm text-gray-600">Light border, subtle shadow, rounded-2xl corners.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Gradient Card</h4>
                <p className="text-sm text-blue-100">For featured content and CTAs.</p>
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
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold text-gray-900 mb-2">Clean & Modern</h3>
              <p className="text-gray-600 text-sm">
                Generous whitespace, soft shadows, and rounded corners create a premium, approachable feel.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Focused & Clear</h3>
              <p className="text-gray-600 text-sm">
                One primary action per screen. Guide users with visual hierarchy and clear CTAs.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-4xl mb-4">🚀</div>
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

