import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import {
  Target,
  Handshake,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
} from 'lucide-react';

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

We're adding new vetted syndication deals to EquityMD every week — multifamily, value-add, ground-up across top US markets.

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

export default function GoToMarket() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [syndicatorStatuses, setSyndicatorStatuses] = useState<Record<string, (typeof SYNDICATOR_STATUSES)[number]>>({});
  const [outreachOpen, setOutreachOpen] = useState<Record<string, boolean>>({});
  const [templatesOpen, setTemplatesOpen] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.checklist);
      if (raw) setChecklist(JSON.parse(raw));
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.syndicatorStatus);
      if (raw) setSyndicatorStatuses(JSON.parse(raw));
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.outreachOpen);
      if (raw) setOutreachOpen(JSON.parse(raw));
    } catch (_) {}
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.templatesOpen);
      if (raw) setTemplatesOpen(JSON.parse(raw));
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(checklist));
  }, [checklist]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.syndicatorStatus, JSON.stringify(syndicatorStatuses));
  }, [syndicatorStatuses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.outreachOpen, JSON.stringify(outreachOpen));
  }, [outreachOpen]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.templatesOpen, JSON.stringify(templatesOpen));
  }, [templatesOpen]);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleSyndicatorStatus = (company: string) => {
    const current = syndicatorStatuses[company] ?? 'to_contact';
    const idx = SYNDICATOR_STATUSES.indexOf(current);
    const next = SYNDICATOR_STATUSES[(idx + 1) % SYNDICATOR_STATUSES.length];
    setSyndicatorStatuses((prev) => ({ ...prev, [company]: next }));
  };

  const toggleOutreach = (id: string) => {
    setOutreachOpen((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  const toggleTemplate = (id: string) => {
    setTemplatesOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyTemplate = async (id: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEO title="EquityMD Go-To-Market Playbook" noindex />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        {/* Hero */}
        <section id="hero" className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium mb-4">
            🔒 Internal Use Only
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            EquityMD Go-To-Market Playbook
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The roadmap to 1,000 investors and 50 active deals
          </p>
        </section>

        {/* Section 1: Strategy cards */}
        <section id="strategy" className="mb-16">
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

        {/* Section 2: Outreach channels */}
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

        {/* Section 3: Target syndicators */}
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

        {/* Section 4: Revenue model */}
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

        {/* Section 5: Email templates */}
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

        {/* Section 6: KPI milestones */}
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

        {/* Anchor nav */}
        <nav className="fixed bottom-4 right-4 flex flex-col gap-1 bg-gray-900/95 border border-gray-800 rounded-lg p-2 shadow-xl z-10">
          <a href="#hero" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Hero</a>
          <a href="#strategy" className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded">Strategy</a>
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
