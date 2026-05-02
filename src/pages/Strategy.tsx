import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import {
  Target,
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Lock,
  Bell,
  FileText,
  UserCheck,
  ArrowRight,
  ArrowDown,
  Zap,
} from 'lucide-react';

export function Strategy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEO
        title="EquityMD Strategy — Business Model & Launch Plan"
        description="Internal strategy overview for EquityMD"
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            Internal Strategy — May 2, 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            EquityMD Business Model
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A private investor network funded by syndicators. We bring the investors. They bring the capital.
          </p>
        </div>

        {/* The One-Liner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">The Model</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Syndicators pay <span className="text-white font-bold">$1,000/mo</span>. That money goes directly into ad campaigns that bring accredited investors onto the platform. The bigger the network, the more investors everyone gets. EquityMD does all the work. Syndicators just check their notifications.
          </p>
        </div>

        {/* The Flywheel */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            The Flywheel
          </h2>
          <div className="space-y-4">
            {[
              { icon: DollarSign, color: 'text-green-400', text: 'Syndicators pay $1,000/mo' },
              { icon: Target, color: 'text-blue-400', text: 'EquityMD runs investor acquisition ads (~$100/lead)' },
              { icon: Users, color: 'text-purple-400', text: 'Investors land on EquityMD, create profiles' },
              { icon: Bell, color: 'text-yellow-400', text: 'Syndicators get notified of new investors' },
              { icon: UserCheck, color: 'text-teal-400', text: 'Investors browse syndicator profiles organically' },
              { icon: TrendingUp, color: 'text-emerald-400', text: 'More syndicators want in → more budget → more investors → repeat' },
            ].map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <step.icon className={`w-5 h-5 ${step.color} flex-shrink-0`} />
                  <span className="text-gray-200">{step.text}</span>
                </div>
                {i < 5 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Split */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            Revenue Split — 75 / 25
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">75%</div>
              <div className="text-gray-300 font-medium">Investor Acquisition Ads</div>
              <div className="text-sm text-gray-500 mt-1">Every dollar working to grow the platform</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">25%</div>
              <div className="text-gray-300 font-medium">EquityMD Profit</div>
              <div className="text-sm text-gray-500 mt-1">Platform operations & growth</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Syndicators</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Monthly Revenue</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Ad Budget (75%)</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Profit (25%)</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Investors/mo</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  { synd: 3, rev: '$3,000', ads: '$2,250', profit: '$750', inv: '~22' },
                  { synd: 10, rev: '$10,000', ads: '$7,500', profit: '$2,500', inv: '~75' },
                  { synd: 25, rev: '$25,000', ads: '$18,750', profit: '$6,250', inv: '~187' },
                  { synd: 50, rev: '$50,000', ads: '$37,500', profit: '$12,500', inv: '~375' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-3 font-medium text-white">{row.synd}</td>
                    <td className="py-3">{row.rev}</td>
                    <td className="py-3 text-blue-400">{row.ads}</td>
                    <td className="py-3 text-emerald-400">{row.profit}</td>
                    <td className="py-3 text-purple-400">{row.inv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two-Tier Model */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            Two-Tier Model
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3 text-gray-200">Free Tier</h3>
              <p className="text-sm text-gray-400 mb-4">Every syndicator either pays you or works for you.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" /> Directory profile</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" /> Visible to investors browsing</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" /> SEO juice from the platform</li>
                <li className="flex items-start gap-2 text-gray-500"><Lock className="w-4 h-4 mt-0.5 flex-shrink-0" /> No investor feed</li>
                <li className="flex items-start gap-2 text-gray-500"><Lock className="w-4 h-4 mt-0.5 flex-shrink-0" /> No notifications</li>
              </ul>
              <div className="mt-4 text-xs text-gray-500 italic">Purpose: Free content, SEO, social proof → converts to paid</div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3 text-blue-400">Investor Program — $1,000/mo</h3>
              <p className="text-sm text-gray-400 mb-4">The one thing syndicators actually want: investors.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Everything in Free</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Investor feed from join date forward</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Notifications on new investors</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Free unlimited deal listings</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Featured/premium profile</li>
              </ul>
              <div className="mt-4 text-xs text-gray-400 italic">75% goes to ads. 25% to EquityMD. Intro call required.</div>
            </div>
          </div>
        </div>

        {/* Subscription Mechanics */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-yellow-400" />
            Subscription Mechanics
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">You see investors from when you join</h4>
                <p className="text-sm text-gray-400">Join in month 3? You see month 3+ investors only. Month 1 members see everything.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Cancel = lose access</h4>
                <p className="text-sm text-gray-400">If you cancel and rejoin, you restart. No access to historical investors. Ever.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Founding members win forever</h4>
                <p className="text-sm text-gray-400">First 10 members lock in $1,000/mo rate. New members pay more as database grows.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Database never resets</h4>
                <p className="text-sm text-gray-400">Every investor ever acquired stays on the platform. The longer you're in, the bigger your pool.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Growth */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Network Growth
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Month</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Syndicators</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Investors/mo</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Total in Database</th>
                  <th className="text-left py-3 text-gray-400 font-medium">EquityMD Profit</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  { mo: '1-2', synd: 'Justin only', inv: '10', total: '20', profit: '$0 (bootstrap)' },
                  { mo: '3', synd: '5', inv: '37', total: '57', profit: '$1,250/mo' },
                  { mo: '6', synd: '12', inv: '105', total: '400+', profit: '$3,500/mo' },
                  { mo: '12', synd: '25', inv: '262', total: '1,800+', profit: '$8,750/mo' },
                  { mo: '18', synd: '50', inv: '656', total: '5,000+', profit: '$21,875/mo' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-3 font-medium text-white">{row.mo}</td>
                    <td className="py-3">{row.synd}</td>
                    <td className="py-3 text-blue-400">{row.inv}</td>
                    <td className="py-3 text-purple-400">{row.total}</td>
                    <td className="py-3 text-emerald-400">{row.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            Verification (US Only)
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-200 mb-3">To List a Deal (Self-Serve):</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> US Government ID — upload</li>
                <li className="flex items-start gap-2"><FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> LLC / Entity docs — upload</li>
                <li className="flex items-start gap-2"><UserCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> Admin reviews and approves (5 min)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-200 mb-3">To Join Investor Program ($1K/mo):</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> Must be verified (above)</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> Intro call with Justin</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> Manual approval</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-200 mb-3">Deal Listings:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Every deal goes to "Pending Approval" queue</li>
                <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> Admin approves before it's visible to investors</li>
                <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> No deal goes live without approval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEC Compliance */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" />
            SEC Compliance
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-emerald-400 mb-3">What EquityMD IS ✅</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Marketing platform / advertising co-op</li>
                <li>• Flat monthly fees (not transaction-based)</li>
                <li>• Ads drive investors to the platform</li>
                <li>• Investors browse and choose</li>
                <li>• Same model as Zillow</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-400 mb-3">What EquityMD is NOT ❌</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Not a broker-dealer</li>
                <li>• Not a finder or matchmaker</li>
                <li>• Not facilitating securities transactions</li>
                <li>• Not processing investor funds</li>
                <li>• Not taking transaction-based compensation</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Required before taking money:</strong> Securities attorney opinion ($2-3K) confirming this model does not require broker-dealer registration. Non-negotiable.</span>
            </p>
          </div>
        </div>

        {/* Bootstrap Plan */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-orange-400" />
            Launch Plan
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">This Weekend</h4>
                <p className="text-sm text-gray-400">Review this strategy. Pick 5 syndicators to call. Read BUSINESS_MODEL.md.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Monday</h4>
                <p className="text-sm text-gray-400">Put $1K into investor acquisition ads (Facebook/Instagram). Call 5 syndicators to book intro meetings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">This Week</h4>
                <p className="text-sm text-gray-400">Get a securities attorney on the calendar. One call, written opinion, before taking any syndicator money.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-200">End of May</h4>
                <p className="text-sm text-gray-400">10-20 real investors on the platform. 3 syndicators say yes to $1K/mo program. Flywheel starts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Script */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Phone className="w-6 h-6 text-teal-400" />
            The Pitch
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6 text-gray-300 leading-relaxed italic">
            <p className="mb-4">
              "Hey [Name], it's Justin from EquityMD. I'm launching something new and I wanted to give you first shot at it.
            </p>
            <p className="mb-4">
              I'm building an investor acquisition program. My agency runs targeted ads to bring accredited investors onto EquityMD — people actively looking to invest in real estate syndications. Your profile is on the platform, and every new investor that joins can see it and reach out to you.
            </p>
            <p className="mb-4">
              I'm taking 10 founding members at $1,000 a month. That money goes directly into investor acquisition ads. I do all the work — the ads, the platform, everything. You just check your notifications when new investors come in.
            </p>
            <p>
              The founding member rate is locked in forever. As the investor database grows, new members will pay more. Right now we're small, but the math is simple — more syndicators contributing means more investors for everyone. You in?"
            </p>
          </div>
        </div>

        {/* The Bottom Line */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            EquityMD is a private investor network funded by syndicators. Free directory for everyone. Paid investor feed for members. 75% goes to ads, 25% to EquityMD. US only. SEC clean. Powered by Brandastic.
          </p>
          <p className="text-gray-400 italic">
            "The platform that brings investors to syndicators."
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          Strategy doc: equitymd-repo/BUSINESS_MODEL.md — May 2, 2026
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Strategy;
