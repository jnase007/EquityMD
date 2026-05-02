import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import {
  Phone,
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
  Handshake,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Mail,
} from 'lucide-react';

/* ─── GTM Data ─── */

const SYNDICATOR_STATUSES = ['to_contact', 'emailed', 'in_talks', 'listed', 'passed'] as const;
const SYNDICATOR_LABELS: Record<(typeof SYNDICATOR_STATUSES)[number], string> = {
  to_contact: '🎯 To Contact',
  emailed: '📧 Emailed',
  in_talks: '📞 In Talks',
  listed: '✅ Listed',
  passed: '❌ Passed',
};

const OUTREACH_SECTIONS: { id: string; title: string; priority?: string; items: string[] }[] = [
  {
    id: 'biggerpockets',
    title: 'BiggerPockets',
    priority: 'HIGH PRIORITY',
    items: [
      'Create/optimize BP profile linking to equitymd.com',
      'Post in Syndication & Passive Investing forum (2x/week)',
      '"What is Real Estate Syndication" article → BP blog',
      '"Top Multifamily Markets 2026" article → BP discussion',
      'DM 22 syndicator founders on BP directly',
      'Answer investor questions — build reputation',
    ],
  },
  {
    id: 'email',
    title: 'Email Campaign',
    items: [
      'Draft investor waitlist email blast',
      'Send to 10,000 investor contacts',
      'Track responses → build demand report',
      'Send personalized emails to 22 high-priority syndicators',
    ],
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    items: [
      'Connect with syndicator founders/VPs',
      'Post EquityMD content 3x/week',
      'Share deal highlights and market insights',
      'Join RE syndication groups',
    ],
  },
  {
    id: 'content',
    title: 'Content & SEO',
    items: [
      'Blog posts 1x/day (already automated)',
      'Guest posts on BP, Medium, LinkedIn',
      'YouTube channel — deal breakdowns',
      'Podcast appearances',
    ],
  },
  {
    id: 'conferences',
    title: 'Conferences & Events',
    items: [
      'Best Ever Conference (Joe Fairless)',
      'MFIN (Multifamily Investor Nation)',
      'IMN conferences',
      'Local REIA meetups in Orange County',
    ],
  },
];

const SYNDICATORS: {
  company: string;
  founder: string;
  title: string;
  linkedin: string;
  email: string;
  phone: string;
  tier: string;
}[] = [
  { company: 'Disrupt Equity', founder: 'Feras Moussa', title: 'Managing Partner', linkedin: 'https://linkedin.com/in/feras-moussa-2072a1196', email: 'team@disruptequity.com', phone: '(713) 589-3959', tier: 'Tier 1' },
  { company: 'SITG Capital', founder: 'Joe Fisher', title: 'Managing Partner', linkedin: 'https://linkedin.com/in/joe-fisher-097a55131', email: 'invest@sitgcapital.com', phone: '(620) 960-4261', tier: 'Tier 1' },
  { company: 'MLG Capital', founder: 'Tim Wallen', title: 'CEO', linkedin: 'https://linkedin.com/in/timothy-wallen-b45aa3162', email: 'investors@mlgcapital.com', phone: '—', tier: 'Tier 1' },
  { company: 'RealWealth', founder: 'Rich Fettke', title: 'Co-Founder & CEO', linkedin: 'https://linkedin.com/in/fettke', email: 'syndications@realwealthnetwork.com', phone: '—', tier: 'Tier 1' },
  { company: 'Lone Star Capital', founder: 'Rob Beardsley', title: 'Co-Founder', linkedin: 'https://linkedin.com/in/rob-beardsley', email: 'rob@lscre.com', phone: '(650) 380-2609', tier: 'Tier 1' },
  { company: 'BAM Capital', founder: 'Ivan Barratt', title: 'Founder & CEO', linkedin: 'https://linkedin.com/in/ivanbarratt', email: 'vicki@bamcapital.com', phone: '—', tier: 'Tier 1' },
  { company: 'Rise48 Equity', founder: 'Zach Haptonstall', title: 'CEO', linkedin: 'https://linkedin.com/in/zach-haptonstall', email: 'rise48equity.com (form)', phone: '—', tier: 'Tier 2' },
  { company: 'Viking Capital', founder: 'Vikram Raya', title: 'Founder', linkedin: 'https://linkedin.com/in/vikramraya', email: 'vikingcapllc.com (form)', phone: '—', tier: 'Tier 2' },
  { company: 'Blue Lake Capital', founder: 'Ellie Perlman', title: 'Founder & CEO', linkedin: 'https://linkedin.com/in/ellieperlman', email: 'info@bluelake-capital.com', phone: '(401) 477-9804', tier: 'Tier 2' },
  { company: 'Gatsby Investment', founder: 'Dan Gatsby', title: 'Founder & CEO', linkedin: 'https://linkedin.com/in/dangatsby', email: 'gatsbyinvestment.com (form)', phone: '—', tier: 'Tier 2' },
  { company: 'GSH Real Estate', founder: 'Gideon Pfeffer', title: 'CEO', linkedin: 'https://linkedin.com/in/gideonpfeffer', email: 'gshrealestate.com (form)', phone: '—', tier: 'Tier 2' },
  { company: 'DLP Capital', founder: 'Don Wenner', title: 'Founder & CEO', linkedin: 'https://linkedin.com/in/donwenner', email: 'dlpcapital.com (form)', phone: '—', tier: 'Tier 2' },
  { company: 'Ashcroft Capital', founder: 'Joe Fairless', title: 'Co-Founder', linkedin: 'https://linkedin.com/in/joefairless', email: 'ashcroftcapital.com (form)', phone: '646-916-1000', tier: 'Tier 3' },
  { company: 'Cardone Capital', founder: 'Grant Cardone', title: 'Founder & CEO', linkedin: 'https://linkedin.com/in/grantcardone', email: 'IR team', phone: '(305) 407-0276', tier: 'Tier 3' },
  { company: 'Origin Investments', founder: 'Michael Episcope', title: 'Co-CEO', linkedin: 'https://linkedin.com/in/david-scherer-09204529', email: 'origininvestments.com (form)', phone: '—', tier: 'Tier 3' },
  { company: 'MC Companies', founder: 'Ken McElroy', title: 'Co-Founder', linkedin: 'https://linkedin.com/in/kenmcelroyofficial', email: 'mccompanies.com (form)', phone: '(918) 800-9333', tier: 'Tier 3' },
  { company: 'PassiveInvesting.com', founder: 'Dan Handford', title: 'Managing Partner', linkedin: 'https://linkedin.com/in/dan-handford', email: 'dan@passiveinvesting.com', phone: '—', tier: 'Tier 3' },
  { company: 'Praxis Capital', founder: 'Brian Burke', title: 'President & CEO', linkedin: 'https://linkedin.com/in/praxiscapital', email: 'praxcap.com (form)', phone: '—', tier: 'Tier 3' },
  { company: 'Goodegg Investments', founder: 'Annie Dickerson & Julie Lam', title: 'Co-Founders', linkedin: 'https://linkedin.com/in/anniedickerson', email: 'goodegginvestments.com (form)', phone: '—', tier: 'Tier 4' },
  { company: '37th Parallel Properties', founder: 'Chad Doty', title: 'CEO', linkedin: 'https://linkedin.com/in/chaddoty', email: '37parallel.com (form)', phone: '—', tier: 'Tier 4' },
  { company: 'Vertical Street Ventures', founder: 'Jenny Gou & Steven Louie', title: 'Co-Founders', linkedin: 'https://linkedin.com/in/jennygou', email: 'verticalstreetventures.com', phone: '—', tier: 'Tier 4' },
  { company: 'Trion Properties', founder: 'Max Sharkansky', title: 'Co-Founder', linkedin: 'https://linkedin.com/in/max-sharkansky', email: 'info@trionproperties.com', phone: '—', tier: 'Tier 4' },
];

const EMAIL_TEMPLATES = [
  {
    id: 'cold-email',
    title: 'Cold Email (Direct)',
    body: `Subject: 7,400+ accredited investors looking for your next deal

Hi [FIRST NAME],

I'm Justin with EquityMD.com — we're a marketplace connecting accredited investors with real estate syndication opportunities.

We currently have 7,400+ verified accredited investors actively browsing deals on our platform, and I think [COMPANY NAME] would be a great fit.

Here's the offer: List your first deal completely free. No fees, no commitment. We drive capital to you.

Would you be open to a quick 10-minute call this week?

Justin Nassie
EquityMD.com`,
  },
  {
    id: 'linkedin-dm',
    title: 'LinkedIn DM',
    body: `Hey [FIRST NAME] — I've been following [COMPANY NAME]'s growth, really impressive.

I run EquityMD.com, a deal marketplace with 7,400+ accredited investors looking for syndication opportunities. We're offering syndicators a free first listing — we send investor traffic directly to your deal page.

No catch. We want great operators like you on the platform. Worth a quick chat?

Justin`,
  },
  {
    id: 'formal-ir',
    title: 'Formal / IR Team',
    body: `Subject: Partnership Inquiry — EquityMD Investor Marketplace (7,400+ Accredited Investors)

Dear [COMPANY NAME] Team,

I'm reaching out from EquityMD.com, a real estate investment marketplace serving 7,400+ accredited investors seeking passive real estate investments.

We'd like to offer you a complimentary first deal listing on EquityMD. Our platform provides direct access to verified accredited investors, a dedicated deal page, and investor inquiry routing directly to your team.

We'd welcome the opportunity to discuss a potential partnership.

Best regards,
Justin Nassie
Founder, EquityMD.com`,
  },
  {
    id: 'investor-waitlist',
    title: 'Investor Waitlist Blast',
    body: `Subject: New Investment Opportunities Dropping on EquityMD

We're adding new syndication deals to EquityMD every week — multifamily, value-add, ground-up across top US markets.

If you want early access before deals fill up:
→ Join the waitlist: equitymd.com

Takes 30 seconds. No commitment.

Justin Nassie
EquityMD`,
  },
];

const STORAGE_KEYS = {
  checklist: 'gtm_outreach_checklist',
  syndicatorStatus: 'gtm_syndicator_status',
  outreachOpen: 'gtm_outreach_open',
  templatesOpen: 'gtm_templates_open',
};

function getTierColor(tier: string): string {
  if (tier === 'Tier 1') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (tier === 'Tier 2') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (tier === 'Tier 3') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

function getStatusColor(status: (typeof SYNDICATOR_STATUSES)[number]): string {
  const map: Record<(typeof SYNDICATOR_STATUSES)[number], string> = {
    to_contact: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    emailed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    in_talks: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    listed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    passed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return map[status];
}

/* ─── Component ─── */

export function Strategy() {
  /* GTM interactive state */
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [syndicatorStatuses, setSyndicatorStatuses] = useState<Record<string, (typeof SYNDICATOR_STATUSES)[number]>>({});
  const [outreachOpen, setOutreachOpen] = useState<Record<string, boolean>>({});
  const [templatesOpen, setTemplatesOpen] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Load from localStorage */
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.checklist); if (r) setChecklist(JSON.parse(r)); } catch (_) {}
  }, []);
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.syndicatorStatus); if (r) setSyndicatorStatuses(JSON.parse(r)); } catch (_) {}
  }, []);
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.outreachOpen); if (r) setOutreachOpen(JSON.parse(r)); } catch (_) {}
  }, []);
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.templatesOpen); if (r) setTemplatesOpen(JSON.parse(r)); } catch (_) {}
  }, []);

  /* Persist to localStorage */
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(checklist)); }, [checklist]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.syndicatorStatus, JSON.stringify(syndicatorStatuses)); }, [syndicatorStatuses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.outreachOpen, JSON.stringify(outreachOpen)); }, [outreachOpen]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.templatesOpen, JSON.stringify(templatesOpen)); }, [templatesOpen]);

  const toggleCheck = (key: string) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  const cycleSyndicatorStatus = (company: string) => {
    const current = syndicatorStatuses[company] ?? 'to_contact';
    const idx = SYNDICATOR_STATUSES.indexOf(current);
    const next = SYNDICATOR_STATUSES[(idx + 1) % SYNDICATOR_STATUSES.length];
    setSyndicatorStatuses((prev) => ({ ...prev, [company]: next }));
  };
  const toggleOutreach = (id: string) => setOutreachOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleTemplate = (id: string) => setTemplatesOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  const copyTemplate = async (id: string, body: string) => {
    try { await navigator.clipboard.writeText(body); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEO
        title="EquityMD Strategy — Business Model & Launch Plan"
        description="Internal strategy overview for EquityMD"
      />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* ══════════════════════════════════════════════════════════
            PART 1 — BUSINESS MODEL (from Strategy)
           ══════════════════════════════════════════════════════════ */}

        {/* Hero */}
        <section id="hero" className="text-center mb-16">
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
        </section>

        {/* The Model */}
        <section id="model" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">The Model</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Syndicators pay <span className="text-white font-bold">$1,000/mo</span>. That money goes directly into ad campaigns that bring accredited investors onto the platform. The bigger the network, the more investors everyone gets. EquityMD does all the work. Syndicators just check their notifications.
          </p>
        </section>

        {/* The Flywheel */}
        <section id="flywheel" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Revenue Split */}
        <section id="revenue-split" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Two-Tier Model */}
        <section id="tiers" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Subscription Mechanics */}
        <section id="subscription" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-yellow-400" />
            Subscription Mechanics
          </h2>
          <div className="space-y-4">
            {[
              { num: '1', color: 'blue', title: 'You see investors from when you join', desc: 'Join in month 3? You see month 3+ investors only. Month 1 members see everything.' },
              { num: '2', color: 'red', title: 'Cancel = lose access', desc: 'If you cancel and rejoin, you restart. No access to historical investors. Ever.' },
              { num: '3', color: 'green', title: 'Founding members win forever', desc: 'First 10 members lock in $1,000/mo rate. New members pay more as database grows.' },
              { num: '4', color: 'purple', title: 'Database never resets', desc: 'Every investor ever acquired stays on the platform. The longer you\'re in, the bigger your pool.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
                <div className={`w-8 h-8 rounded-full bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-${item.color}-400 font-bold text-sm`}>{item.num}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Network Growth */}
        <section id="growth" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Verification */}
        <section id="verification" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* SEC Compliance */}
        <section id="sec" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Launch Plan */}
        <section id="launch" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-orange-400" />
            Launch Plan
          </h2>
          <div className="space-y-6">
            {[
              { num: '1', title: 'This Weekend', desc: 'Review this strategy. Pick 5 syndicators to call. Read BUSINESS_MODEL.md.' },
              { num: '2', title: 'Monday', desc: 'Put $1K into investor acquisition ads (Facebook/Instagram). Call 5 syndicators to book intro meetings.' },
              { num: '3', title: 'This Week', desc: 'Get a securities attorney on the calendar. One call, written opinion, before taking any syndicator money.' },
              { num: '4', title: 'End of May', desc: '10-20 real investors on the platform. 3 syndicators say yes to $1K/mo program. Flywheel starts.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400 font-bold">{item.num}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Pitch / Phone Script */}
        <section id="pitch" className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-12">
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
        </section>

        {/* Bottom Line (from Strategy) */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            EquityMD is a private investor network funded by syndicators. Free directory for everyone. Paid investor feed for members. 75% goes to ads, 25% to EquityMD. US only. SEC clean. Powered by Brandastic.
          </p>
          <p className="text-gray-400 italic">
            "The platform that brings investors to syndicators."
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PART 2 — GO-TO-MARKET PLAYBOOK (from GoToMarket)
           ══════════════════════════════════════════════════════════ */}

        <div className="border-t border-gray-800 pt-16 mb-16">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium mb-4">
              🔒 Internal Use Only
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Go-To-Market Playbook
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The roadmap to 1,000 investors and 50 active deals
            </p>
          </div>
        </div>

        {/* Strategy cards */}
        <section id="strategy-cards" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">The Strategy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Build Demand First</h3>
              <ul className="text-gray-400 text-sm space-y-2 flex-1">
                <li>• Email blast 10,000 existing investor contacts</li>
                <li>• &quot;New deals dropping — join the waitlist&quot;</li>
                <li>• Collect: investment amount, asset class preference, timeline</li>
                <li className="text-emerald-400 font-medium">Goal: 200+ investors, $5M+ committed interest</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <Handshake className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lock In Syndicators</h3>
              <ul className="text-gray-400 text-sm space-y-2 flex-1">
                <li>• Approach with RECEIPTS: &quot;We have $X million in investor demand&quot;</li>
                <li>• Founding Syndicator Program: first listing FREE</li>
                <li>• Revenue share on select deals (operating agreement, not finder&apos;s fees)</li>
                <li>• They provide: photos, PPMs, underwriting, legal</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scale the Marketplace</h3>
              <ul className="text-gray-400 text-sm space-y-2 flex-1">
                <li>• Every new deal attracts more investors, every investor attracts more syndicators</li>
                <li>• Network effect = flywheel</li>
                <li className="text-emerald-400 font-medium">Goal: 50 active deals, 1,000 registered investors by Q3 2026</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Outreach channels */}
        <section id="outreach" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Outreach Channels</h2>
          <div className="space-y-2">
            {OUTREACH_SECTIONS.map((section) => {
              const isOpen = outreachOpen[section.id] ?? false;
              return (
                <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleOutreach(section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition"
                  >
                    <span className="font-semibold text-white flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      {section.title}
                      {section.priority && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          {section.priority}
                        </span>
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-0 border-t border-gray-800">
                      <ul className="space-y-2 mt-3">
                        {section.items.map((item, i) => {
                          const key = `${section.id}_${i}`;
                          const checked = checklist[key] ?? false;
                          return (
                            <li key={key} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleCheck(key)}
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                  checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                {checked && <Check className="h-3 w-3 text-white" />}
                              </button>
                              <span className={checked ? 'text-gray-500 line-through' : 'text-gray-300'}>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Target syndicators */}
        <section id="syndicators" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Target Syndicators</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Company</th>
                  <th className="py-3 px-4 font-medium">Founder</th>
                  <th className="py-3 px-4 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium">LinkedIn</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Phone</th>
                  <th className="py-3 px-4 font-medium">Pitch Ready</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {SYNDICATORS.map((row, i) => {
                  const status = syndicatorStatuses[row.company] ?? 'to_contact';
                  const isMailto = row.email.includes('@') && !row.email.includes('(form)');
                  const isLinkedIn = row.linkedin.startsWith('http');
                  return (
                    <tr key={row.company} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-white">{row.company}</td>
                      <td className="py-3 px-4 text-gray-300">{row.founder}</td>
                      <td className="py-3 px-4 text-gray-400">{row.title}</td>
                      <td className="py-3 px-4">
                        {isLinkedIn ? (
                          <a href={row.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                            Profile <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isMailto ? (
                          <a href={`mailto:${row.email}`} className="text-blue-400 hover:underline inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </a>
                        ) : (
                          <span className="text-gray-400">{row.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {row.phone !== '—' ? (
                          <a href={`tel:${row.phone.replace(/\D/g, '')}`} className="text-gray-300 hover:text-white inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {row.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded border text-xs font-medium ${getTierColor(row.tier)}`}>
                          {row.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => cycleSyndicatorStatus(row.company)}
                          className={`inline-block px-3 py-1.5 rounded border text-xs font-medium cursor-pointer hover:opacity-90 transition ${getStatusColor(status)}`}
                        >
                          {SYNDICATOR_LABELS[status]}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Revenue model */}
        <section id="revenue" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Revenue Model</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Layer 1 — Marketplace</h3>
              <p className="text-gray-400 text-sm">
                Syndicators pay flat listing fees ($0 / $499 / $1,499 per month). NOT transaction-based (SEC compliance).
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Layer 2 — Revenue Share</h3>
              <p className="text-gray-400 text-sm">
                Select deals where EquityMD earns a revenue share for capital raised. Compensation through operating agreement. Must disclose on deal page.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Layer 3 — Own Deals</h3>
              <p className="text-gray-400 text-sm">
                EquityMD-originated local OC properties. Full management fees. Deal scanner feeds pipeline.
              </p>
            </div>
          </div>
        </section>

        {/* Email templates */}
        <section id="templates" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Email Templates</h2>
          <div className="space-y-2">
            {EMAIL_TEMPLATES.map((tpl) => {
              const isOpen = templatesOpen[tpl.id] ?? false;
              return (
                <div key={tpl.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleTemplate(tpl.id)}
                      className="flex-1 flex items-center gap-2 text-left font-semibold text-white hover:bg-gray-800/50 -m-2 p-2 rounded-lg transition"
                    >
                      {isOpen ? <ChevronDown className="h-5 w-5 flex-shrink-0" /> : <ChevronRight className="h-5 w-5 flex-shrink-0" />}
                      {tpl.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyTemplate(tpl.id, tpl.body)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2"
                    >
                      {copiedId === tpl.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedId === tpl.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-0 border-t border-gray-800">
                      <pre className="mt-3 p-4 rounded-lg bg-gray-950 text-gray-300 text-xs whitespace-pre-wrap font-sans overflow-x-auto">
                        {tpl.body}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* KPI milestones */}
        <section id="kpis" className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">KPI Milestones</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Registered Investors</p>
              <p className="text-2xl font-bold text-white">7,400 <span className="text-gray-400 font-normal text-lg">/ 10,000</span></p>
              <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: '74%' }} />
              </div>
              <p className="text-emerald-400 text-xs mt-1">74%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Active Deals</p>
              <p className="text-2xl font-bold text-white">7 <span className="text-gray-400 font-normal text-lg">/ 50</span></p>
              <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: '14%' }} />
              </div>
              <p className="text-emerald-400 text-xs mt-1">14%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Syndicator Partners</p>
              <p className="text-2xl font-bold text-white">3 <span className="text-gray-400 font-normal text-lg">/ 25</span></p>
              <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: '12%' }} />
              </div>
              <p className="text-emerald-400 text-xs mt-1">12%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Capital Deployed</p>
              <p className="text-2xl font-bold text-white">$43M+</p>
              <p className="text-gray-500 text-xs mt-1">Display only</p>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center text-sm text-gray-600">
          Strategy doc: equitymd-repo/BUSINESS_MODEL.md — May 2, 2026
        </div>

        {/* Floating anchor nav */}
        <nav className="fixed bottom-4 right-4 flex flex-col gap-1 bg-gray-900/95 border border-gray-800 rounded-lg p-2 shadow-xl z-10">
          <a href="#hero" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Hero</a>
          <a href="#model" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Model</a>
          <a href="#flywheel" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Flywheel</a>
          <a href="#revenue-split" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">75/25</a>
          <a href="#tiers" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Tiers</a>
          <a href="#subscription" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Sub</a>
          <a href="#growth" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Growth</a>
          <a href="#verification" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Verify</a>
          <a href="#sec" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">SEC</a>
          <a href="#launch" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Launch</a>
          <a href="#pitch" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Pitch</a>
          <a href="#strategy-cards" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Strategy</a>
          <a href="#outreach" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Outreach</a>
          <a href="#syndicators" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Syndicators</a>
          <a href="#revenue" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Revenue</a>
          <a href="#templates" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Templates</a>
          <a href="#kpis" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">KPIs</a>
        </nav>
      </main>

      <Footer />
    </div>
  );
}

export default Strategy;
