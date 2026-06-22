// Vercel Edge Middleware — ported from netlify/edge-functions/og-tags.ts
// Serves full server-rendered HTML + meta tags to bots (SEO), passes humans through to the SPA.
import { next } from '@vercel/edge';

export const config = {
  // Run on all paths except static assets, the build output, and files with extensions.
  matcher: ['/((?!_next|assets|favicon|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)'],
};


const SUPABASE_URL = process.env["VITE_SUPABASE_URL"] || "https://fzacguhxadpvjrmycwes.supabase.co";
const SUPABASE_ANON_KEY = process.env["VITE_SUPABASE_ANON_KEY"] || process.env["SUPABASE_ANON_KEY"] || "";
const SITE_URL = "https://equitymd.com";
const DEFAULT_IMAGE = "https://auth.equitymd.com/storage/v1/object/public/images/shutterstock_2568276509.jpg";

const USER_AGENTS = [
  "linkedinbot", "facebookexternalhit", "twitterbot", "slackbot",
  "whatsapp", "telegrambot", "discordbot", "pinterest",
  "googlebot", "bingbot",
];

function isBot(userAgent: string): boolean {
  return USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot));
}

const STATE_ABBREVS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
  'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
  'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district-of-columbia': 'DC',
};

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  // Split into blocks by double newlines
  const blocks = md.split(/\n\n+/);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith("### ")) {
      htmlBlocks.push(`<h3>${inlineFormat(trimmed.slice(4).trim())}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      htmlBlocks.push(`<h2>${inlineFormat(trimmed.slice(3).trim())}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlBlocks.push(`<h2>${inlineFormat(trimmed.slice(2).trim())}</h2>`);
      continue;
    }

    // List block
    const lines = trimmed.split("\n");
    if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
      const items = lines.map((l) => `<li>${inlineFormat(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("\n");
      htmlBlocks.push(`<ul>${items}</ul>`);
      continue;
    }

    // Paragraph (preserve single newlines as <br>)
    const content = lines.map((l) => inlineFormat(l)).join("<br>\n");
    htmlBlocks.push(`<p>${content}</p>`);
  }

  return htmlBlocks.join("\n");
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

async function fetchSupabase(query: string) {
  const url = `${SUPABASE_URL}/rest/v1${query}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  return res.ok ? res.json() : null;
}

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  bodyContent: string;
  jsonLd?: object | object[];
}

function generateFullHtml(meta: PageMeta): string {
  const jsonLdScript = meta.jsonLd
    ? Array.isArray(meta.jsonLd)
      ? meta.jsonLd.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ")
      : `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : "";
  const image = meta.image || DEFAULT_IMAGE;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${escapeHtml(meta.canonical)}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(meta.canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EquityMD">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${jsonLdScript ? `  ${jsonLdScript}` : ""}
</head>
<body>
  <main>
    ${meta.bodyContent}
  </main>
  <noscript>
    <p>Please enable JavaScript to view the full experience at <a href="${escapeHtml(meta.canonical)}">${escapeHtml(meta.canonical)}</a></p>
  </noscript>
</body>
</html>`;
}

const STATIC_PAGES: Record<string, PageMeta> = {
  "/": {
    title: "EquityMD — Real Estate Syndication Platform for Accredited Investors",
    description: "EquityMD connects accredited investors with institutional-quality real estate investment opportunities. Browse verified syndicators, discover curated deals, and build passive income through commercial real estate.",
    canonical: SITE_URL,
    bodyContent: `
<h1>EquityMD — The Marketplace for Real Estate Syndication Deals</h1>
<p>EquityMD connects accredited investors with verified real estate syndicators and institutional-quality investment opportunities. Browse curated deals, compare sponsors, and build passive income through commercial real estate.</p>
<h2>Why Investors Choose EquityMD</h2>
<ul>
<li><strong>400+ Verified Syndicators</strong> — browse the largest directory of real estate syndication sponsors with track records, reviews, and deal history</li>
<li><strong>Curated Syndication Deals</strong> — multifamily apartments, industrial, medical office, self-storage, and more</li>
<li><strong>Due Diligence Tools</strong> — investment calculator, market reports by state, and educational resources</li>
<li><strong>Free for Investors</strong> — browse deals and connect with syndicators at no cost</li>
</ul>
<h2>How Real Estate Syndication Works</h2>
<p>Real estate syndication pools capital from multiple accredited investors to acquire commercial properties. A professional syndicator (sponsor) manages the property while investors receive quarterly distributions and a share of profits at sale. Typical returns target 15-20% IRR over 3-7 year hold periods.</p>
<h2>Explore EquityMD</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Syndicator Directory</a></li>
<li><a href="${SITE_URL}/rankings">Top Syndicators 2026</a></li>
<li><a href="${SITE_URL}/how-it-works">How Syndication Works</a></li>
<li><a href="${SITE_URL}/blog">Investing Blog</a></li>
<li><a href="${SITE_URL}/resources/market-reports">Market Reports by State</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a></li>
</ul>`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "EquityMD",
        "url": SITE_URL,
        "description": "EquityMD connects accredited investors with institutional-quality real estate investment opportunities through verified syndicators.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/find?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "EquityMD",
        "url": SITE_URL,
        "logo": `${SITE_URL}/favicon.svg`,
      },
    ],
  },
  "/find": {
    title: "Browse Real Estate Syndication Deals | Find Passive Income Investments | EquityMD",
    description: "Browse active real estate syndication deals from verified sponsors. Filter by property type, location, target IRR & minimum investment. Multifamily, industrial & more.",
    canonical: `${SITE_URL}/find`,
    bodyContent: `
<h1>Browse Real Estate Syndication Deals</h1>
<p>Discover active real estate syndication opportunities from verified syndicators on EquityMD. Filter by property type, location, target IRR, and minimum investment amount.</p>
<h2>Property Types Available</h2>
<ul>
<li>Multifamily Apartments — Value-add and stabilized</li>
<li>Industrial & Logistics — Warehouses and distribution centers</li>
<li>Medical Office — Healthcare real estate investments</li>
<li>Self-Storage — Recession-resistant asset class</li>
<li>Retail & Mixed-Use — Commercial and residential blends</li>
</ul>
<p>Minimum investments typically range from $25,000 to $100,000. Most deals target 15-20% IRR with 3-7 year hold periods and quarterly cash distributions.</p>
<p><a href="${SITE_URL}/find">Browse all deals</a> | <a href="${SITE_URL}/directory">View syndicators</a> | <a href="${SITE_URL}/how-it-works">How it works</a></p>`,
  },
  "/directory": {
    title: "Real Estate Syndicator Directory | Verified CRE Sponsors | EquityMD",
    description: "Browse 400+ verified real estate syndicators. Compare track records, reviews, minimum investments, and specialties. Free for investors.",
    canonical: `${SITE_URL}/directory`,
    bodyContent: ``,
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Real Estate Syndicator Directory", "url": `${SITE_URL}/directory` },
  },
  "/how-it-works": {
    title: "How Real Estate Syndication Works | EquityMD",
    description: "Learn how real estate syndication works. From discovery to investment — understand the process and start building passive income.",
    canonical: `${SITE_URL}/how-it-works`,
    bodyContent: `
<h1>How Real Estate Syndication Works</h1>
<p>Real estate syndication pools capital from multiple investors to purchase properties. Syndicators find and manage deals; investors receive passive returns.</p>
<p><a href="${SITE_URL}/how-it-works">Learn more</a></p>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Invest in Real Estate Syndications",
      "description": "A step-by-step guide to investing in real estate syndications through EquityMD.",
      "step": [
        { "@type": "HowToStep", "name": "Browse Deals", "text": "Explore verified syndication opportunities on EquityMD. Filter by property type, location, target returns, and minimum investment." },
        { "@type": "HowToStep", "name": "Due Diligence", "text": "Review syndicator track records, ratings, deal history, and investor reviews. Compare syndicators side-by-side." },
        { "@type": "HowToStep", "name": "Invest", "text": "Connect with syndicators directly, review offering documents, and fund your investment to start earning passive income." },
      ],
    },
  },
  "/about": {
    title: "About EquityMD | Connecting Investors with Syndicators",
    description: "EquityMD is the premier marketplace connecting accredited investors with verified real estate syndicators. Learn about our mission and team.",
    canonical: `${SITE_URL}/about`,
    bodyContent: `
<h1>About EquityMD</h1>
<p>EquityMD connects accredited investors with verified real estate syndicators. We provide a transparent marketplace for commercial real estate investments.</p>
<p><a href="${SITE_URL}/about">About us</a></p>`,
  },
  "/contact": {
    title: "Contact EquityMD | Get in Touch",
    description: "Contact EquityMD for investor or syndicator support. We typically respond within 24-48 hours.",
    canonical: `${SITE_URL}/contact`,
    bodyContent: `
<h1>Contact EquityMD</h1>
<p>Get in touch with our team. We respond to all inquiries within 24-48 business hours.</p>
<p><a href="${SITE_URL}/contact">Contact us</a></p>`,
  },
  "/pricing": {
    title: "Syndicator Pricing & Plans | EquityMD",
    description: "Pricing plans for syndicators to list deals on EquityMD. Reach thousands of accredited investors.",
    canonical: `${SITE_URL}/pricing`,
    bodyContent: `
<h1>Syndicator Pricing & Plans</h1>
<p>List your deals on EquityMD and reach accredited investors. Flexible plans for syndicators.</p>
<p><a href="${SITE_URL}/pricing">View pricing</a></p>`,
  },
  "/resources/education/what-is-irr": {
    title: "What is IRR (Internal Rate of Return) in Real Estate? | EquityMD",
    description: "Learn what IRR (Internal Rate of Return) means in real estate investing. Understand how IRR is calculated, typical targets for syndications, and why it matters for passive investors.",
    canonical: `${SITE_URL}/resources/education/what-is-irr`,
    bodyContent: `
<h1>What is IRR (Internal Rate of Return) in Real Estate?</h1>
<p><em>Published May 24, 2026 · By EquityMD Team</em></p>

<p>Internal Rate of Return (IRR) is one of the most important metrics in real estate investing. Whether you're evaluating a <a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">real estate syndication</a>, comparing two multifamily deals, or deciding between asset classes, IRR gives you a single number that accounts for the time value of money — something simpler metrics cannot do.</p>

<h2>IRR Definition: What Does It Actually Mean?</h2>
<p>IRR is the annualized rate of return that makes the net present value (NPV) of all cash flows from an investment equal to zero. In plain English, it's the rate at which your invested capital grows each year when you account for <strong>when</strong> you receive each dollar back — not just <strong>how much</strong> you receive.</p>
<p>Unlike a simple return calculation, IRR factors in the timing of every cash flow: your initial investment, quarterly or monthly distributions, and your final payout when the property sells. A dollar received in year one is worth more than a dollar received in year five, and IRR captures this difference precisely.</p>

<h2>How IRR Works in Real Estate Syndications</h2>
<p>In a typical <a href="${SITE_URL}/resources/education/apartment-syndication-guide">apartment syndication</a>, here's how cash flows might look for a $100,000 investment:</p>
<ul>
<li><strong>Year 0:</strong> You invest $100,000 (negative cash flow)</li>
<li><strong>Years 1-4:</strong> You receive $8,000/year in quarterly distributions (8% cash-on-cash)</li>
<li><strong>Year 5:</strong> Property sells — you receive $8,000 in distributions plus $130,000 from the sale proceeds</li>
</ul>
<p>Your total return is $162,000 on a $100,000 investment (62% total). But the IRR calculation considers <strong>when</strong> each payment arrived. In this example, the IRR would be approximately 17.5% — a strong return for a value-add multifamily deal.</p>

<h2>IRR vs. Cash-on-Cash Return: What's the Difference?</h2>
<p>Cash-on-cash return measures your annual cash distributions divided by your initial investment. It's simple and useful, but it has a critical limitation: it ignores your profit at sale and the time value of money.</p>
<ul>
<li><strong>Cash-on-Cash Return:</strong> Tells you what you earn in cash each year relative to your investment. A deal paying $8,000/year on a $100,000 investment has an 8% cash-on-cash return.</li>
<li><strong>IRR:</strong> Captures the total picture — distributions, appreciation, and timing. A deal with a modest 6% cash-on-cash return but a large equity multiple at sale could have a higher IRR than one paying 10% cash-on-cash with no appreciation.</li>
</ul>
<p>Smart investors use both metrics together. Cash-on-cash tells you about ongoing income; IRR tells you about total wealth creation over the investment's life.</p>

<h2>Typical IRR Targets in Real Estate Syndications</h2>
<p>IRR expectations vary significantly by strategy, risk profile, and market conditions:</p>
<ul>
<li><strong>Core / Stabilized (low risk):</strong> 8-12% IRR — Class A properties in strong markets with stable tenants and minimal renovation needed</li>
<li><strong>Value-Add (moderate risk):</strong> 13-18% IRR — Properties requiring renovations, management improvements, or repositioning. This is the most common syndication strategy.</li>
<li><strong>Opportunistic (higher risk):</strong> 18-25%+ IRR — Ground-up development, major repositioning, or distressed assets. Higher return potential comes with more execution risk.</li>
</ul>
<p>Most <a href="${SITE_URL}/find">syndication deals on EquityMD</a> target 15-20% IRR, which reflects the value-add strategies favored by experienced syndicators.</p>

<h2>Limitations of IRR: What Investors Should Know</h2>
<p>IRR is powerful but not perfect. Understanding its limitations makes you a better investor:</p>
<ul>
<li><strong>IRR is a projection, not a guarantee.</strong> Syndicators calculate projected IRR based on assumptions about rent growth, cap rates, and exit timing. Actual IRR can be higher or lower.</li>
<li><strong>Short holds can inflate IRR.</strong> A quick flip with a small profit can show a high IRR simply because the holding period was short. Always look at equity multiple alongside IRR.</li>
<li><strong>IRR assumes reinvestment.</strong> The formula assumes interim distributions are reinvested at the same rate, which may not be realistic.</li>
<li><strong>It ignores investment size.</strong> A 25% IRR on a $10,000 investment may be less impactful than a 15% IRR on $500,000. Consider absolute returns alongside percentages.</li>
</ul>

<h2>The Equity Multiple: IRR's Essential Companion</h2>
<p>Always evaluate IRR alongside the equity multiple (also called return on equity or total return multiple). The equity multiple tells you how many times you get your money back. An equity multiple of 2.0x means you doubled your money. Combined with IRR, you get the full picture: how much you earned and how quickly.</p>

<h2>Why IRR Matters for Passive Real Estate Investors</h2>
<p>As a passive investor in syndications, IRR helps you:</p>
<ul>
<li>Compare deals with different hold periods and cash flow patterns on an apples-to-apples basis</li>
<li>Evaluate whether a deal's return justifies the risk and illiquidity</li>
<li>Benchmark sponsor performance against industry standards</li>
<li>Make informed portfolio allocation decisions across multiple investments</li>
</ul>
<p>When reviewing a deal on EquityMD, look at the projected IRR in the context of the strategy, market, hold period, and the syndicator's track record of hitting their projections.</p>

<h2>Start Evaluating Deals Today</h2>
<p>Ready to put your IRR knowledge to work? <a href="${SITE_URL}/find">Browse active syndication deals</a> on EquityMD, use our <a href="${SITE_URL}/resources/calculator">returns calculator</a>, or explore our <a href="${SITE_URL}/resources/glossary">syndication glossary</a> to learn more investing terms.</p>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Find Verified Syndicators</a></li>
<li><a href="${SITE_URL}/resources/education">Education Center</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">What is Real Estate Syndication?</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-preferred-equity">What is Preferred Equity?</a></li>
</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "What is IRR (Internal Rate of Return) in Real Estate?",
      "description": "Learn what IRR (Internal Rate of Return) means in real estate investing. Understand how IRR is calculated, typical targets for syndications, and why it matters for passive investors.",
      "datePublished": "2026-05-24",
      "author": { "@type": "Organization", "name": "EquityMD Team" },
      "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/resources/education/what-is-irr` },
    },
  },
  "/resources/education/what-is-real-estate-syndication": {
    title: "What is Real Estate Syndication? Complete 2026 Guide | EquityMD",
    description: "Complete guide to real estate syndication in 2026. Learn how syndications work, GP/LP structure, typical returns, tax benefits, risks, and how to get started as a passive investor.",
    canonical: `${SITE_URL}/resources/education/what-is-real-estate-syndication`,
    bodyContent: `
<h1>What is Real Estate Syndication? Complete 2026 Guide</h1>
<p><em>Published May 24, 2026 · By EquityMD Team</em></p>

<p>Real estate syndication is a partnership structure where multiple investors pool their capital to acquire and manage commercial real estate that would be difficult or impossible to purchase individually. It's the primary way accredited investors access institutional-quality real estate — large apartment communities, office buildings, industrial warehouses, and more — without becoming landlords.</p>

<h2>How Real Estate Syndication Works</h2>
<p>Every syndication has two groups of participants:</p>
<ul>
<li><strong>General Partners (GPs) — The Syndicators:</strong> These are the experienced operators who find the deal, arrange financing, manage the property, and execute the business plan. They typically invest 5-20% of the total equity and earn management fees plus a share of profits (called "promote" or "carried interest").</li>
<li><strong>Limited Partners (LPs) — The Passive Investors:</strong> LPs provide the majority of the equity capital (typically 80-95%). In return, they receive passive income through quarterly distributions and a share of profits when the property sells. LPs have no management responsibilities or personal liability beyond their investment.</li>
</ul>
<p>The relationship is governed by a legal document called the Private Placement Memorandum (PPM) and an operating agreement that spells out the exact terms: fee structure, profit splits, decision-making authority, and investor rights.</p>

<h2>The Syndication Deal Structure</h2>
<p>A typical value-add apartment syndication might look like this:</p>
<ul>
<li><strong>Total acquisition:</strong> $15 million (purchase price + closing costs + renovation budget)</li>
<li><strong>Debt (mortgage):</strong> $10 million (65-70% loan-to-value)</li>
<li><strong>Equity raise:</strong> $5 million from LP investors + GP co-investment</li>
<li><strong>Minimum investment:</strong> $50,000-$100,000 per LP</li>
<li><strong>Preferred return:</strong> 7-8% annually (LPs get paid first)</li>
<li><strong>Profit split:</strong> 70/30 or 80/20 (LP/GP) after preferred return is met</li>
<li><strong>Target hold period:</strong> 3-7 years</li>
<li><strong>Target <a href="${SITE_URL}/resources/education/what-is-irr">IRR</a>:</strong> 15-20%</li>
<li><strong>Target equity multiple:</strong> 1.8x-2.2x</li>
</ul>

<h2>Types of Properties in Syndications</h2>
<p>Syndications span virtually every commercial real estate asset class:</p>
<ul>
<li><strong>Multifamily Apartments:</strong> The most common syndication asset class. <a href="${SITE_URL}/resources/education/apartment-syndication-guide">Apartment syndications</a> benefit from strong demand, value-add opportunities, and favorable financing through agency debt (Fannie Mae/Freddie Mac).</li>
<li><strong>Industrial & Logistics:</strong> Warehouses and distribution centers driven by e-commerce growth. Lower management intensity than multifamily.</li>
<li><strong>Self-Storage:</strong> Recession-resistant, low operating costs, and strong demand fundamentals.</li>
<li><strong>Medical Office:</strong> Long-term leases, recession-resistant tenants, and limited new supply.</li>
<li><strong>Retail & Mixed-Use:</strong> Neighborhood centers and mixed-use developments in growing markets.</li>
<li><strong>Hospitality:</strong> Hotels and short-term rentals — higher risk/reward profile.</li>
</ul>

<h2>Typical Returns in Real Estate Syndications</h2>
<p>Returns vary by strategy, market conditions, and operator skill. Here's what experienced investors typically see:</p>
<ul>
<li><strong>Cash-on-cash return (annual income):</strong> 6-10%</li>
<li><strong>IRR (annualized total return):</strong> 13-20%</li>
<li><strong>Equity multiple (total return over hold period):</strong> 1.6x-2.2x</li>
</ul>
<p>These are projections — actual results depend on market conditions, property performance, and the syndicator's execution. Past performance by the sponsor is the single best indicator, which is why <a href="${SITE_URL}/directory">reviewing syndicator track records</a> matters so much.</p>

<h2>Tax Benefits of Real Estate Syndication</h2>
<p>Syndication tax advantages are one of the biggest reasons sophisticated investors allocate to this asset class:</p>
<ul>
<li><strong>Depreciation:</strong> Commercial properties are depreciated over 27.5 years (residential) or 39 years (commercial). Cost segregation studies can accelerate this to generate massive paper losses in year one.</li>
<li><strong>K-1 Tax Reporting:</strong> Each LP receives a Schedule K-1 showing their share of income, losses, depreciation, and other tax items. These passive losses can offset passive income from other investments.</li>
<li><strong>1031 Exchange Potential:</strong> Some syndications offer 1031 exchange options, allowing investors to defer capital gains taxes when reinvesting proceeds.</li>
<li><strong>Bonus Depreciation:</strong> Under current tax law, cost segregation combined with bonus depreciation can generate first-year paper losses equal to 40-80% of your investment, even while you're receiving cash distributions.</li>
<li><strong>Long-Term Capital Gains:</strong> Profits from properties held longer than one year are taxed at favorable long-term capital gains rates rather than ordinary income rates.</li>
</ul>

<h2>Who Can Invest in Syndications?</h2>
<p>Most real estate syndications are offered under SEC Regulation D exemptions:</p>
<ul>
<li><strong>506(b) offerings:</strong> Open to up to 35 sophisticated (non-accredited) investors and unlimited accredited investors. Cannot be publicly advertised.</li>
<li><strong>506(c) offerings:</strong> Open only to verified accredited investors but can be publicly advertised.</li>
</ul>
<p><strong>Accredited investor requirements (2026):</strong></p>
<ul>
<li>Individual income of $200,000+ ($300,000+ with spouse) for the past two years with expectation of the same, OR</li>
<li>Net worth exceeding $1 million (excluding primary residence), OR</li>
<li>Certain professional certifications (Series 7, Series 65, Series 82)</li>
</ul>

<h2>Risks of Real Estate Syndication</h2>
<p>Like any investment, syndications carry risks that investors must understand:</p>
<ul>
<li><strong>Illiquidity:</strong> Your capital is typically locked for 3-7 years. There is no secondary market to sell your shares easily.</li>
<li><strong>Operator risk:</strong> The syndicator's competence and integrity are paramount. Thorough due diligence on the sponsor is essential.</li>
<li><strong>Market risk:</strong> Property values and rental rates can decline due to economic conditions, oversupply, or local market factors.</li>
<li><strong>Leverage risk:</strong> Most syndications use 60-75% debt. While leverage amplifies returns, it also amplifies losses and introduces refinancing risk.</li>
<li><strong>Capital call risk:</strong> Unexpected costs may require additional capital contributions from investors.</li>
</ul>

<h2>How to Get Started with Real Estate Syndication</h2>
<p>Follow these steps to begin your syndication investing journey:</p>
<ul>
<li><strong>Educate yourself:</strong> Understand the terminology, deal structures, and risk factors. Our <a href="${SITE_URL}/resources/glossary">syndication glossary</a> and <a href="${SITE_URL}/resources/education">education center</a> are great starting points.</li>
<li><strong>Verify your accreditation status:</strong> Determine if you meet accredited investor requirements.</li>
<li><strong>Research syndicators:</strong> <a href="${SITE_URL}/directory">Browse the EquityMD syndicator directory</a> to find verified operators with strong track records.</li>
<li><strong>Start evaluating deals:</strong> <a href="${SITE_URL}/find">Browse active deals</a> and practice analyzing offering documents, business plans, and financial projections.</li>
<li><strong>Invest conservatively:</strong> Start with one deal and a comfortable amount before scaling your allocation.</li>
</ul>

<h2>Real Estate Syndication vs. Crowdfunding</h2>
<p>While related, syndication and <a href="${SITE_URL}/resources/education/real-estate-crowdfunding-vs-syndication">real estate crowdfunding</a> are distinct. Syndications typically involve direct investment in a specific property with a known sponsor, while crowdfunding platforms may pool capital across multiple deals or offer REIT-like structures. Learn more in our detailed <a href="${SITE_URL}/resources/education/real-estate-crowdfunding-vs-syndication">comparison guide</a>.</p>

<h2>Explore Syndication Opportunities</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Active Deals</a></li>
<li><a href="${SITE_URL}/directory">Find Verified Syndicators</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-irr">Understanding IRR</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-preferred-equity">What is Preferred Equity?</a></li>
<li><a href="${SITE_URL}/resources/education/apartment-syndication-guide">Apartment Syndication Guide</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/education">Education Center</a></li>
</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "What is Real Estate Syndication? Complete 2026 Guide",
      "description": "Complete guide to real estate syndication in 2026. Learn how syndications work, GP/LP structure, typical returns, tax benefits, risks, and how to get started as a passive investor.",
      "datePublished": "2026-05-24",
      "author": { "@type": "Organization", "name": "EquityMD Team" },
      "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/resources/education/what-is-real-estate-syndication` },
    },
  },
  "/resources/education/what-is-preferred-equity": {
    title: "Preferred Equity in Real Estate Explained | EquityMD",
    description: "Learn what preferred equity means in real estate syndications. Understand how it works, preferred vs common equity, risk/reward profiles, and why sponsors use it in capital stacks.",
    canonical: `${SITE_URL}/resources/education/what-is-preferred-equity`,
    bodyContent: `
<h1>Preferred Equity in Real Estate Explained</h1>
<p><em>Published May 24, 2026 · By EquityMD Team</em></p>

<p>Preferred equity is a critical concept in real estate syndication that sits between debt and common equity in a property's capital stack. Understanding how preferred equity works — and how it differs from a preferred return — is essential for any serious passive investor evaluating syndication deals.</p>

<h2>What is Preferred Equity?</h2>
<p>Preferred equity is a class of ownership in a real estate investment that has priority over common equity when it comes to receiving distributions and return of capital. In a syndication's capital stack, it typically sits above common equity but below senior debt (the mortgage):</p>
<ul>
<li><strong>Senior Debt (First Mortgage):</strong> Gets paid first — lowest risk, lowest return</li>
<li><strong>Mezzanine Debt:</strong> Subordinate to senior debt, higher interest rate</li>
<li><strong>Preferred Equity:</strong> Priority over common equity for distributions and capital return</li>
<li><strong>Common Equity:</strong> Gets paid last — highest risk, highest potential return</li>
</ul>
<p>Preferred equity investors receive their agreed-upon return before common equity holders see any profit. However, unlike debt, preferred equity does not create a lien on the property and has no fixed maturity date with mandatory repayment.</p>

<h2>How Preferred Equity Works in Syndications</h2>
<p>In a typical deal, a preferred equity investor might provide $2 million in a $15 million deal and receive:</p>
<ul>
<li>A fixed preferred return of 10-14% annually, paid before any distributions to common equity</li>
<li>Priority on return of capital — they get their $2 million back before common equity investors</li>
<li>Limited or no participation in upside beyond the preferred return (depending on deal terms)</li>
</ul>
<p>This structure is attractive to investors who want higher yields than senior debt offers but with more downside protection than common equity provides.</p>

<h2>Preferred Equity vs. Preferred Return: A Critical Distinction</h2>
<p>These terms sound similar but mean very different things:</p>
<ul>
<li><strong>Preferred Return:</strong> A profit distribution threshold in a syndication. Limited Partners typically receive a 7-8% preferred return before the General Partner receives any promote/carry. All common equity investors hold the same class of ownership — the preferred return is simply a distribution waterfall feature.</li>
<li><strong>Preferred Equity:</strong> An entirely separate class of ownership with structural priority over common equity. Preferred equity is a distinct position in the capital stack, not just a distribution preference.</li>
</ul>
<p>A syndication might have <em>both</em>: preferred equity investors with structural priority, and a preferred return waterfall among the common equity investors (GPs and LPs).</p>

<h2>Preferred Equity vs. Common Equity</h2>
<ul>
<li><strong>Risk:</strong> Preferred equity carries less risk because it gets paid first. Common equity bears the first losses.</li>
<li><strong>Return potential:</strong> Common equity has unlimited upside — if the property appreciates significantly, common equity holders capture that gain. Preferred equity returns are typically capped.</li>
<li><strong>Control:</strong> Common equity (specifically GPs) controls property operations and decision-making. Preferred equity investors typically have protective rights (like approval of major decisions) but not operational control.</li>
<li><strong>Loss exposure:</strong> In a downturn, common equity is wiped out first. Preferred equity is protected until losses exceed the common equity cushion.</li>
</ul>

<h2>When Syndicators Use Preferred Equity</h2>
<p>Sponsors add preferred equity to their capital stack for several reasons:</p>
<ul>
<li><strong>Bridge the gap:</strong> When senior debt covers 65% and the sponsor needs to raise less common equity, preferred equity fills the 10-15% gap</li>
<li><strong>Reduce dilution:</strong> Less common equity raised means a larger promote share for the GP</li>
<li><strong>Attract different investor profiles:</strong> Some investors prefer the more predictable, lower-risk preferred position</li>
<li><strong>Competitive acquisitions:</strong> Preferred equity can help close deals faster by reducing the common equity raise needed</li>
</ul>

<h2>Risk/Reward Profile of Preferred Equity</h2>
<p>Preferred equity is often described as offering "bond-like returns with equity-level risk." The reality is more nuanced:</p>
<ul>
<li><strong>Target returns:</strong> 10-14% annualized (higher than senior debt at 5-7%, lower than common equity at 15-20%+)</li>
<li><strong>Downside protection:</strong> Meaningful — common equity absorbs losses first</li>
<li><strong>Upside participation:</strong> Limited or none — you trade upside for priority</li>
<li><strong>Best for:</strong> Investors seeking steady, predictable returns with moderate risk who are willing to forgo equity appreciation</li>
</ul>

<h2>Evaluating Preferred Equity Investments</h2>
<p>When reviewing a preferred equity opportunity, focus on:</p>
<ul>
<li>The size of the common equity cushion below you (bigger = more protection)</li>
<li>The loan-to-value ratio (lower leverage = less risk)</li>
<li>The sponsor's track record and the property's business plan</li>
<li>Redemption rights and liquidity provisions</li>
<li>Intercreditor agreements between the senior lender and preferred equity</li>
</ul>

<h2>Learn More</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Find Verified Syndicators</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">What is Real Estate Syndication?</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-irr">Understanding IRR</a></li>
<li><a href="${SITE_URL}/resources/education">Education Center</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Preferred Equity in Real Estate Explained",
      "description": "Learn what preferred equity means in real estate syndications. Understand how it works, preferred vs common equity, risk/reward profiles, and why sponsors use it in capital stacks.",
      "datePublished": "2026-05-24",
      "author": { "@type": "Organization", "name": "EquityMD Team" },
      "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/resources/education/what-is-preferred-equity` },
    },
  },
  "/resources/education/apartment-syndication-guide": {
    title: "Apartment Syndication: Complete Guide for Investors | EquityMD",
    description: "Complete guide to apartment syndication investing. Learn how multifamily syndications work, typical deal structures, returns, tax advantages, and how to evaluate apartment deals.",
    canonical: `${SITE_URL}/resources/education/apartment-syndication-guide`,
    bodyContent: `
<h1>Apartment Syndication: Complete Guide for Investors</h1>
<p><em>Published May 24, 2026 · By EquityMD Team</em></p>

<p>Apartment syndication is the most popular form of <a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">real estate syndication</a>, and for good reason. Multifamily properties offer strong fundamentals — consistent rental demand, favorable financing, proven value-add strategies, and significant tax advantages. This guide covers everything passive investors need to know before investing in apartment syndications.</p>

<h2>What is Apartment Syndication?</h2>
<p>Apartment syndication is a real estate investment structure where a sponsor (General Partner) pools capital from multiple passive investors (Limited Partners) to acquire, improve, and manage a multifamily apartment community. The sponsor handles all operations — finding the deal, securing financing, managing renovations, overseeing property management — while investors contribute capital and receive passive returns.</p>
<p>Typical apartment syndications target properties with 100-500+ units, though some focus on smaller assets in the 50-100 unit range. The sweet spot for many syndicators is 150-300 units — large enough for professional management and economies of scale, but not so large that competition from institutional buyers drives prices to unprofitable levels.</p>

<h2>How Multifamily Syndication Deals Are Structured</h2>
<p>Understanding the deal structure is crucial for evaluating any apartment syndication:</p>

<h3>Capital Stack</h3>
<ul>
<li><strong>Senior Debt:</strong> 60-75% of the total cost, secured by the property. Agency loans (Fannie Mae/Freddie Mac) are common for multifamily and offer favorable terms — lower interest rates, longer terms, and non-recourse to the borrower.</li>
<li><strong>Equity:</strong> 25-40% raised from LP investors and GP co-investment. Some deals include <a href="${SITE_URL}/resources/education/what-is-preferred-equity">preferred equity</a> in the capital stack.</li>
</ul>

<h3>Distribution Waterfall</h3>
<ul>
<li><strong>Preferred Return:</strong> LPs receive a 7-8% preferred return before the GP earns any promote</li>
<li><strong>First Split:</strong> After the preferred return, profits are split 70/30 or 80/20 (LP/GP)</li>
<li><strong>Higher Tiers:</strong> Some deals have multiple hurdles — e.g., above 15% <a href="${SITE_URL}/resources/education/what-is-irr">IRR</a>, the split shifts to 60/40</li>
</ul>

<h3>Fee Structure</h3>
<ul>
<li><strong>Acquisition Fee:</strong> 1-3% of purchase price (paid to GP at closing)</li>
<li><strong>Asset Management Fee:</strong> 1-2% of effective gross revenue annually</li>
<li><strong>Property Management:</strong> 4-6% of gross revenue (often third-party)</li>
<li><strong>Disposition Fee:</strong> 0-1% of sale price</li>
<li><strong>Refinance Fee:</strong> 0.5-1% (if applicable)</li>
</ul>

<h2>Value-Add Apartment Strategy</h2>
<p>The dominant strategy in apartment syndication is "value-add" — acquiring underperforming properties and improving them to increase net operating income (NOI) and property value. Common value-add plays include:</p>
<ul>
<li><strong>Interior renovations:</strong> Upgrading kitchens, bathrooms, flooring, and fixtures to command $150-$300/month rent premiums per unit</li>
<li><strong>Exterior improvements:</strong> New paint, landscaping, signage, amenities (dog parks, fitness centers, package lockers)</li>
<li><strong>Operational improvements:</strong> Better property management, reduced vacancy, lower operating expenses, implementing RUBS (ratio utility billing)</li>
<li><strong>Revenue optimization:</strong> Adding income streams through pet fees, parking, storage, laundry, and valet trash service</li>
</ul>

<h2>Typical Returns in Apartment Syndications</h2>
<ul>
<li><strong>Cash-on-cash return:</strong> 6-10% annually from rental income</li>
<li><strong>IRR:</strong> 14-20% for value-add deals</li>
<li><strong>Equity multiple:</strong> 1.7x-2.2x over a 3-7 year hold</li>
<li><strong>Hold period:</strong> 3-5 years for value-add; 5-10 years for stabilized/core-plus</li>
</ul>
<p>These returns are projections. The syndicator's ability to execute the business plan, secure favorable financing, and time the exit all impact actual results.</p>

<h2>Tax Advantages of Apartment Syndication</h2>
<p>Multifamily syndications offer some of the most powerful tax benefits in real estate:</p>
<ul>
<li><strong>Cost Segregation:</strong> An engineering study that reclassifies building components into shorter depreciation schedules (5, 7, and 15 years). Combined with bonus depreciation, this can generate paper losses of 40-80% of your investment in year one.</li>
<li><strong>K-1 Passive Losses:</strong> These paper losses offset passive income from other investments, reducing your tax bill while you're receiving actual cash distributions.</li>
<li><strong>Long-Term Capital Gains:</strong> Sale profits on properties held over one year are taxed at preferential rates (0-20% vs. up to 37% for ordinary income).</li>
<li><strong>1031 Exchange:</strong> Some sponsors structure exits to allow investors to defer capital gains through a 1031 exchange into a subsequent deal.</li>
</ul>
<p>Always consult with a CPA experienced in real estate syndications. Tax benefits can significantly enhance your after-tax returns.</p>

<h2>How to Evaluate an Apartment Syndication Deal</h2>
<p>Before investing, conduct thorough due diligence on both the deal and the sponsor:</p>

<h3>Sponsor Due Diligence</h3>
<ul>
<li>Track record: How many deals have they completed? What were the actual returns vs. projections?</li>
<li>Experience in the specific market and property class</li>
<li>Co-investment: How much of their own capital is in the deal?</li>
<li>Communication: How often do they provide investor updates?</li>
<li>Reviews and references from existing investors</li>
</ul>

<h3>Deal Due Diligence</h3>
<ul>
<li>Market fundamentals: population growth, job growth, rent growth, supply pipeline</li>
<li>Comparable properties: Are the projected rents achievable based on nearby competition?</li>
<li>Conservative underwriting: Are rent growth and exit cap rate assumptions realistic?</li>
<li>Debt terms: Interest rate, term, recourse, prepayment penalties</li>
<li>Renovation budget: Is it adequate? Is there a contingency reserve?</li>
</ul>

<h2>Minimum Investments</h2>
<p>Most apartment syndications require $50,000-$100,000 minimum investments, though some sponsors offer lower minimums of $25,000-$50,000 for smaller deals or to attract new investors. Higher minimums of $100,000-$250,000 are common in larger institutional-quality deals.</p>

<h2>Start Exploring Apartment Deals</h2>
<p>Ready to invest in apartment syndications? <a href="${SITE_URL}/find">Browse active multifamily deals</a> on EquityMD, or <a href="${SITE_URL}/directory">explore our syndicator directory</a> to find experienced apartment operators.</p>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Find Verified Syndicators</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">What is Real Estate Syndication?</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-irr">Understanding IRR</a></li>
<li><a href="${SITE_URL}/resources/education/real-estate-crowdfunding-vs-syndication">Crowdfunding vs. Syndication</a></li>
<li><a href="${SITE_URL}/resources/education">Education Center</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Apartment Syndication: Complete Guide for Investors",
      "description": "Complete guide to apartment syndication investing. Learn how multifamily syndications work, typical deal structures, returns, tax advantages, and how to evaluate apartment deals.",
      "datePublished": "2026-05-24",
      "author": { "@type": "Organization", "name": "EquityMD Team" },
      "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/resources/education/apartment-syndication-guide` },
    },
  },
  "/resources/education/real-estate-crowdfunding-vs-syndication": {
    title: "Real Estate Crowdfunding vs Syndication: Key Differences | EquityMD",
    description: "Compare real estate crowdfunding and syndication. Understand SEC regulations, minimum investments, control, liquidity, typical returns, and which is better for your investment goals.",
    canonical: `${SITE_URL}/resources/education/real-estate-crowdfunding-vs-syndication`,
    bodyContent: `
<h1>Real Estate Crowdfunding vs Syndication: Key Differences</h1>
<p><em>Published May 24, 2026 · By EquityMD Team</em></p>

<p>Real estate crowdfunding and real estate syndication are both ways to invest in commercial property without buying it yourself, but they differ significantly in structure, regulation, investor access, and potential returns. Understanding these differences is essential for choosing the right approach for your investment goals and risk tolerance.</p>

<h2>What is Real Estate Crowdfunding?</h2>
<p>Real estate crowdfunding uses online platforms to pool money from many investors — sometimes hundreds or thousands — to fund real estate projects. These platforms act as intermediaries, sourcing deals, conducting due diligence, and managing investor relationships. Popular platforms include Fundrise, CrowdStreet, RealtyMogul, and YieldStreet.</p>
<p>Crowdfunding investments come in several forms:</p>
<ul>
<li><strong>eREITs:</strong> Pooled funds investing across multiple properties, similar to a traditional REIT but offered through a platform. Low minimums ($10-$500).</li>
<li><strong>Individual Deal Investments:</strong> Direct investment in a specific property through the platform. Higher minimums ($25,000-$50,000), similar to syndication.</li>
<li><strong>Debt Investments:</strong> Lending to developers/operators at fixed interest rates. Lower risk but lower return potential.</li>
</ul>

<h2>What is Real Estate Syndication?</h2>
<p><a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">Real estate syndication</a> is a direct partnership between a sponsor (General Partner) and a group of investors (Limited Partners) to acquire a specific property. The relationship is direct — you know exactly who is managing your money, which property your capital is invested in, and the exact terms of the deal.</p>

<h2>Key Differences: Head-to-Head Comparison</h2>

<h3>SEC Regulation</h3>
<ul>
<li><strong>Crowdfunding:</strong> Many platforms operate under Regulation A+ (allowing non-accredited investors) or Regulation D. Some eREIT products are registered with the SEC.</li>
<li><strong>Syndication:</strong> Typically offered under Regulation D, Rule 506(b) or 506(c). Most syndications require accredited investor status, particularly 506(c) offerings.</li>
</ul>

<h3>Minimum Investment</h3>
<ul>
<li><strong>Crowdfunding:</strong> As low as $10-$500 for eREIT products; $25,000-$50,000 for individual deals</li>
<li><strong>Syndication:</strong> Typically $50,000-$100,000; some as low as $25,000</li>
</ul>

<h3>Investor Access</h3>
<ul>
<li><strong>Crowdfunding:</strong> Many platforms accept non-accredited investors for pooled products (Reg A+). Individual deals often require accreditation.</li>
<li><strong>Syndication:</strong> Most require accredited investor status. 506(b) offerings can include up to 35 sophisticated (non-accredited) investors.</li>
</ul>

<h3>Control and Transparency</h3>
<ul>
<li><strong>Crowdfunding:</strong> The platform selects and manages investments. In pooled products, you may not know exactly which properties your money is in. Limited ability to contact the sponsor directly.</li>
<li><strong>Syndication:</strong> You choose the specific property and sponsor. You receive detailed offering documents (PPM, operating agreement). Direct relationship with the GP, including regular updates and communication.</li>
</ul>

<h3>Liquidity</h3>
<ul>
<li><strong>Crowdfunding:</strong> Some platforms offer quarterly or annual redemption windows. eREITs may have early withdrawal penalties. Still largely illiquid.</li>
<li><strong>Syndication:</strong> Illiquid for the full hold period (3-7 years). No redemption option — you're committed until the property sells or refinances. Some sponsors facilitate secondary transfers between investors.</li>
</ul>

<h3>Typical Returns</h3>
<ul>
<li><strong>Crowdfunding (eREITs/pooled):</strong> 8-12% annualized, lower volatility, diversified across properties</li>
<li><strong>Crowdfunding (individual deals):</strong> 12-18% target <a href="${SITE_URL}/resources/education/what-is-irr">IRR</a>, similar to syndication</li>
<li><strong>Syndication:</strong> 14-20% target IRR for value-add deals, with potential for higher returns through direct sponsor selection</li>
</ul>

<h3>Fees</h3>
<ul>
<li><strong>Crowdfunding:</strong> Platform fees (0.5-2.5% annually) PLUS sponsor fees. Two layers of fees can reduce net returns.</li>
<li><strong>Syndication:</strong> Only sponsor fees (acquisition, asset management, disposition). No platform middleman fee when investing directly.</li>
</ul>

<h3>Tax Benefits</h3>
<ul>
<li><strong>Crowdfunding:</strong> eREIT products may issue 1099s rather than K-1s, limiting your ability to benefit from depreciation pass-through. Individual deals typically issue K-1s.</li>
<li><strong>Syndication:</strong> K-1 reporting with full depreciation pass-through, including cost segregation benefits. Significant tax advantages for high-income investors.</li>
</ul>

<h2>Which is Better for You?</h2>

<h3>Choose Crowdfunding If:</h3>
<ul>
<li>You're a non-accredited investor looking for real estate exposure</li>
<li>You want to start with small amounts ($500-$5,000)</li>
<li>You prefer platform-managed diversification</li>
<li>You value some liquidity options, even limited ones</li>
<li>You don't want to conduct deep due diligence on individual sponsors</li>
</ul>

<h3>Choose Syndication If:</h3>
<ul>
<li>You're an accredited investor with $50,000+ to deploy</li>
<li>You want direct relationships with experienced operators</li>
<li>You value transparency — knowing exactly which property your money is in</li>
<li>Tax optimization through K-1 depreciation is important to you</li>
<li>You're willing to do due diligence on sponsors for potentially higher returns</li>
<li>You don't need liquidity during the 3-7 year hold period</li>
</ul>

<h2>The EquityMD Advantage</h2>
<p>EquityMD combines the best of both worlds: a technology platform that makes discovering and comparing syndication deals easy, with the direct investor-sponsor relationship that syndication provides. No platform middleman fees. No pooled fund opacity. Just direct access to <a href="${SITE_URL}/directory">verified syndicators</a> and their deals.</p>

<h2>Explore Your Options</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Find Verified Syndicators</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-real-estate-syndication">What is Real Estate Syndication?</a></li>
<li><a href="${SITE_URL}/resources/education/apartment-syndication-guide">Apartment Syndication Guide</a></li>
<li><a href="${SITE_URL}/resources/education/what-is-preferred-equity">What is Preferred Equity?</a></li>
<li><a href="${SITE_URL}/resources/education">Education Center</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Real Estate Crowdfunding vs Syndication: Key Differences",
      "description": "Compare real estate crowdfunding and syndication. Understand SEC regulations, minimum investments, control, liquidity, typical returns, and which is better for your investment goals.",
      "datePublished": "2026-05-24",
      "author": { "@type": "Organization", "name": "EquityMD Team" },
      "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/resources/education/real-estate-crowdfunding-vs-syndication` },
    },
  },
};


export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  // Humans -> let the SPA handle it (Vercel serves index.html via SPA rewrite below)
  if (!isBot(userAgent)) return next();

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  return await renderForBot(pathname, url);
}

async function renderForBot(pathname: string, url: URL): Promise<Response> {
  // Static page
  const staticMeta = STATIC_PAGES[pathname];
  if (staticMeta) {
    let meta = { ...staticMeta };
    if (pathname === "/directory" && SUPABASE_ANON_KEY) {
      const syndicators = await fetchSupabase("/syndicators?select=company_name,city,state,active_deals&verification_status=in.(verified,premier)&limit=30") as any[] | null;
      if (syndicators && syndicators.length > 0) {
        const list = syndicators.slice(0, 30).map((s) =>
          `${escapeHtml(s.company_name || "")} — ${escapeHtml(s.city || "")}, ${escapeHtml(s.state || "")} (${s.active_deals || 0} deals)`
        ).join("; ");
        meta.bodyContent = `
<h1>Real Estate Syndicator Directory</h1>
<p>Browse verified real estate syndicators. Compare track records, reviews, and specialties.</p>
<h2>Featured Syndicators</h2>
<p>${list}</p>
<p><a href="${SITE_URL}/directory">View full directory</a></p>`;
      }
    }
    return new Response(generateFullHtml(meta), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" },
    });
  }

  // Blog listing
  if (pathname === "/blog") {
    const posts = await fetchSupabase("/blog_posts?is_published=eq.true&order=published_at.desc&limit=50&select=slug,title,excerpt,category,published_at,author") as any[] | null;
    let body = `<h1>Real Estate Investing Blog — Syndication Insights & Market Analysis</h1>
<p>Educational articles on real estate syndication, deal analysis, market trends, tax strategies, and passive investing for accredited investors. Written by experienced syndicators and investment professionals.</p>`;
    if (posts && posts.length > 0) {
      // Group by category
      const byCategory: Record<string, typeof posts> = {};
      const uncategorized: typeof posts = [];
      for (const p of posts) {
        if (p.category) {
          if (!byCategory[p.category]) byCategory[p.category] = [];
          byCategory[p.category]!.push(p);
        } else {
          uncategorized.push(p);
        }
      }
      const categories = Object.keys(byCategory).sort();
      for (const cat of categories) {
        body += `\n<h2>${escapeHtml(cat)}</h2>`;
        for (const p of byCategory[cat]!) {
          const date = p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
          body += `\n<article>
<h3><a href="${SITE_URL}/blog/${escapeHtml(p.slug || "")}">${escapeHtml(p.title || "")}</a></h3>
<p><em>${date}${p.author ? ` · By ${escapeHtml(p.author)}` : ""}</em></p>
<p>${escapeHtml((p.excerpt || "").substring(0, 300))}</p>
</article>`;
        }
      }
      if (uncategorized.length > 0) {
        body += `\n<h2>More Articles</h2>`;
        for (const p of uncategorized) {
          const date = p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
          body += `\n<article>
<h3><a href="${SITE_URL}/blog/${escapeHtml(p.slug || "")}">${escapeHtml(p.title || "")}</a></h3>
<p><em>${date}${p.author ? ` · By ${escapeHtml(p.author)}` : ""}</em></p>
<p>${escapeHtml((p.excerpt || "").substring(0, 300))}</p>
</article>`;
        }
      }
    }
    body += `\n<h2>Explore EquityMD</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Syndicator Directory</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a></li>
</ul>`;
    return new Response(generateFullHtml({
      title: "Real Estate Investing Blog | Syndication Insights & Market Analysis | EquityMD",
      description: "Educational articles on real estate syndication, deal analysis, market trends, tax strategies, and passive investing for accredited investors.",
      canonical: `${SITE_URL}/blog`,
      bodyContent: body,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Blog post
  if (pathname.startsWith("/blog/") && pathname !== "/blog") {
    const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
    const posts = await fetchSupabase(`/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,content,image_url,published_at,author,category,meta_description,faq_schema,key_takeaways,sources`) as any[] | null;
    if (posts && posts.length > 0) {
      const post = posts[0];
      const title = `${post.title} | EquityMD Blog`;
      const desc = post.meta_description || post.excerpt || "Read this article on EquityMD";
      const img = post.image_url || DEFAULT_IMAGE;
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

      // Convert markdown content to HTML
      const convertedMarkdownContent = markdownToHtml(post.content || post.excerpt || "");

      // FAQ section
      let faqSection = "";
      let faqItems: { question: string; answer: string }[] = [];
      if (post.faq_schema) {
        try {
          const faqData = typeof post.faq_schema === "string" ? JSON.parse(post.faq_schema) : post.faq_schema;
          if (Array.isArray(faqData) && faqData.length > 0) {
            faqItems = faqData;
            faqSection = `<h2>Frequently Asked Questions</h2>`;
            for (const faq of faqData) {
              faqSection += `\n<h3>${escapeHtml(faq.question || faq.q || "")}</h3>\n<p>${escapeHtml(faq.answer || faq.a || "")}</p>`;
            }
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Key takeaways section
      let keyTakeawaysSection = "";
      if (post.key_takeaways) {
        try {
          const takeaways = typeof post.key_takeaways === "string" ? JSON.parse(post.key_takeaways) : post.key_takeaways;
          if (Array.isArray(takeaways) && takeaways.length > 0) {
            keyTakeawaysSection = `<h2>Key Takeaways</h2>\n<ul>${takeaways.map((t: string) => `<li>${escapeHtml(t)}</li>`).join("\n")}</ul>`;
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Sources section
      let sourcesSection = "";
      if (post.sources) {
        try {
          const sources = typeof post.sources === "string" ? JSON.parse(post.sources) : post.sources;
          if (Array.isArray(sources) && sources.length > 0) {
            sourcesSection = `<h2>Sources</h2>\n<ol>${sources.map((s: any) => {
              if (typeof s === "string") return `<li>${escapeHtml(s)}</li>`;
              return `<li>${s.url ? `<a href="${escapeHtml(s.url)}">${escapeHtml(s.title || s.name || s.url)}</a>` : escapeHtml(s.title || s.name || "")}</li>`;
            }).join("\n")}</ol>`;
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Related articles (same category, different slug)
      let relatedSection = "";
      if (post.category) {
        const related = await fetchSupabase(`/blog_posts?is_published=eq.true&category=eq.${encodeURIComponent(post.category)}&slug=neq.${encodeURIComponent(slug)}&order=published_at.desc&limit=5&select=slug,title,excerpt`) as any[] | null;
        if (related && related.length > 0) {
          relatedSection = `<h2>Related Articles</h2>\n<ul>${related.map((r) =>
            `<li><a href="${SITE_URL}/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a>${r.excerpt ? ` — ${escapeHtml(r.excerpt.substring(0, 100))}` : ""}</li>`
          ).join("\n")}</ul>`;
        }
      }
      // If no category matches or too few, fetch recent posts
      if (!relatedSection) {
        const recent = await fetchSupabase(`/blog_posts?is_published=eq.true&slug=neq.${encodeURIComponent(slug)}&order=published_at.desc&limit=5&select=slug,title,excerpt`) as any[] | null;
        if (recent && recent.length > 0) {
          relatedSection = `<h2>More from EquityMD Blog</h2>\n<ul>${recent.map((r) =>
            `<li><a href="${SITE_URL}/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a>${r.excerpt ? ` — ${escapeHtml(r.excerpt.substring(0, 100))}` : ""}</li>`
          ).join("\n")}</ul>`;
        }
      }

      // Schema.org
      const schemas: object[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": desc,
        "image": img,
        "datePublished": post.published_at,
        "author": { "@type": "Person", "name": post.author || "EquityMD Team" },
        "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
      }];
      if (faqItems.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map((f) => ({
            "@type": "Question",
            "name": f.question || (f as any).q || "",
            "acceptedAnswer": { "@type": "Answer", "text": f.answer || (f as any).a || "" },
          })),
        });
      }

      return new Response(generateFullHtml({
        title,
        description: desc.substring(0, 160),
        canonical: `${SITE_URL}/blog/${slug}`,
        image: img,
        bodyContent: `
<h1>${escapeHtml(post.title)}</h1>
<p><em>By ${escapeHtml(post.author || "EquityMD Team")} · ${date}</em></p>
${convertedMarkdownContent}
${faqSection}
${keyTakeawaysSection}
${sourcesSection}
${relatedSection}
<p><a href="${SITE_URL}/blog">← Back to all articles</a></p>`,
        jsonLd: schemas,
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
    }
  }

  // Deal page
  if (pathname.startsWith("/deals/") && pathname !== "/deals") {
    const slug = pathname.replace("/deals/", "").replace(/\/$/, "");
    // Schema: deals table has title, description, property_type, location (single field),
    // cover_image_url, slug. There is NO name/tagline/city/state column.
    const deals = await fetchSupabase(`/deals?slug=eq.${encodeURIComponent(slug)}&select=id,title,description,property_type,location,cover_image_url`) as any[] | null;
    if (deals && deals.length > 0) {
      const deal = deals[0];
      const image = deal.cover_image_url || DEFAULT_IMAGE;
      const title = `${deal.title} | EquityMD`;
      const desc = (deal.description || `${deal.property_type || "Commercial real estate"} investment opportunity${deal.location ? ` in ${deal.location}` : ""}`).substring(0, 160);
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": deal.title,
        "description": desc,
        "image": image,
      };
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/deals/${slug}`,
        image,
        bodyContent: `
<h1>${escapeHtml(deal.title)}</h1>
<p>${escapeHtml(desc)}</p>
<p>${escapeHtml(deal.property_type || "")}${deal.location ? ` investment in ${escapeHtml(deal.location)}` : ""}</p>
<p><a href="${SITE_URL}/deals/${slug}">View deal details</a></p>`,
        jsonLd: productSchema,
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
    }
  }

  // Syndicator profile (use company_name, company_description, company_logo_url)
  if (pathname.startsWith("/syndicators/") && pathname !== "/syndicators") {
    const slug = pathname.replace("/syndicators/", "").replace(/\/$/, "");
    const syndicators = await fetchSupabase(`/syndicators?slug=eq.${encodeURIComponent(slug)}&select=company_name,company_description,company_logo_url,city,state,years_in_business`) as any[] | null;
    if (syndicators && syndicators.length > 0) {
      const s = syndicators[0];
      const title = `${s.company_name} Reviews & Ratings 2026 | EquityMD`;
      const desc = (s.company_description || `${s.company_name} is a verified real estate syndicator`).substring(0, 160);
      const img = s.company_logo_url || DEFAULT_IMAGE;
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": s.company_name,
        "description": desc,
        "image": img,
      };
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/syndicators/${slug}`,
        image: img,
        bodyContent: `
<h1>${escapeHtml(s.company_name)}</h1>
<p>${escapeHtml((s.company_description || "").substring(0, 400))}</p>
<p>${s.city || ""}, ${s.state || ""} · ${s.years_in_business || "—"} years in business</p>
<p><a href="${SITE_URL}/syndicators/${slug}">View full profile</a></p>`,
        jsonLd: orgSchema,
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
    }
  }

  // City page
  if (pathname.startsWith("/cities/")) {
    const citySlug = pathname.replace("/cities/", "").replace(/\/$/, "");
    const cities = await fetchSupabase(`/cities?slug=eq.${encodeURIComponent(citySlug)}&select=name,state,median_price,sales_change,market_trends`) as any[] | null;
    if (cities && cities.length > 0) {
      const c = cities[0];
      const title = `${c.name} Real Estate Market | EquityMD`;
      const desc = `Market data for ${c.name}, ${c.state}. Median price, sales trends, and investment insights.`;
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/cities/${citySlug}`,
        bodyContent: `
<h1>${escapeHtml(c.name)} Real Estate Market</h1>
<p>${escapeHtml(c.market_trends || desc)}</p>
<p><a href="${SITE_URL}/cities/${citySlug}">View full market report</a></p>`,
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
    }
  }

  // State market reports (must be before generic /resources/* handler)
  if (pathname.startsWith("/resources/market-reports/") && pathname !== "/resources/market-reports" && pathname !== "/resources/market-reports/") {
    const stateSlug = pathname.replace("/resources/market-reports/", "").replace(/\/$/, "");
    const stateName = stateSlug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const stateAbbrev = STATE_ABBREVS[stateSlug.toLowerCase()] || "";

    // Fetch real data from Supabase in parallel
    const [cities, syndicators, deals] = await Promise.all([
      stateAbbrev ? fetchSupabase(`/cities?state=eq.${stateAbbrev}&select=name,slug,median_price,sales_change&limit=10&order=median_price.desc`) as Promise<any[] | null> : Promise.resolve(null),
      stateAbbrev ? fetchSupabase(`/syndicators?state=eq.${stateAbbrev}&select=company_name,slug,city,active_deals&verification_status=in.(verified,premier)&limit=10`) as Promise<any[] | null> : Promise.resolve(null),
      stateAbbrev ? fetchSupabase(`/deals?state=eq.${stateAbbrev}&select=name,slug,property_type,city&status=eq.active&limit=10`) as Promise<any[] | null> : Promise.resolve(null),
    ]);

    const cityCount = cities?.length || 0;
    const syndCount = syndicators?.length || 0;
    const dealCount = deals?.length || 0;
    const hasData = cityCount > 0 || syndCount > 0 || dealCount > 0;

    // Build unique meta description from real data
    const descParts: string[] = [];
    if (syndCount > 0) descParts.push(`${syndCount}+ verified syndicators`);
    if (dealCount > 0) descParts.push(`${dealCount} active investment opportunities`);
    if (cityCount > 0) descParts.push(`market data for ${cityCount} cities`);
    const metaDesc = hasData
      ? `${stateName} real estate syndication: ${descParts.join(", ")} on EquityMD. Explore cap rates, property trends, and investment analysis across ${stateName}.`
      : `${stateName} real estate market analysis for syndication investors. Property trends, cap rates, population growth, and investment opportunities across ${stateName}. Browse syndicators and deals on EquityMD.`;

    const title = `${stateName} Real Estate Market Report 2026 | Investment Trends & Data | EquityMD`;

    // --- Build rich body content ---
    let body = `<h1>${escapeHtml(stateName)} Real Estate Market Report 2026</h1>`;
    body += `<p>${escapeHtml(stateName)} real estate market analysis for syndication investors. Whether you're a seasoned LP or exploring your first passive real estate investment, this report covers property trends, cap rates, population growth, and investment opportunities across ${escapeHtml(stateName)}.</p>`;

    // Top Markets section
    body += `<h2>Top ${escapeHtml(stateName)} Markets for Real Estate Investment</h2>`;
    if (cities && cityCount > 0) {
      body += `<p>These are the leading real estate markets in ${escapeHtml(stateName)} based on median home prices and sales activity:</p><ul>`;
      for (const c of cities) {
        const priceStr = c.median_price ? `$${Number(c.median_price).toLocaleString("en-US")}` : "N/A";
        const changeStr = c.sales_change != null ? ` (${c.sales_change > 0 ? "+" : ""}${c.sales_change}% YoY)` : "";
        body += `<li><a href="${SITE_URL}/cities/${escapeHtml(c.slug || "")}">${escapeHtml(c.name)}</a> — Median Price: ${priceStr}${changeStr}</li>`;
      }
      body += `</ul>`;
      body += `<p>Tracking local market data helps syndication investors identify emerging opportunities before institutional capital moves in. Cities with strong population growth and employment gains often signal favorable entry points for multifamily and commercial syndications.</p>`;
    } else {
      body += `<p>Market data for ${escapeHtml(stateName)} cities is being compiled. In the meantime, explore the <a href="${SITE_URL}/cities">full city directory</a> for real-time median prices, sales trends, and investment scores across the country. Real estate syndication investors should evaluate metro-level employment data, population migration patterns, and rent-to-price ratios when assessing ${escapeHtml(stateName)} markets.</p>`;
    }

    // Active Syndicators section
    body += `<h2>Active Syndicators in ${escapeHtml(stateName)}</h2>`;
    if (syndicators && syndCount > 0) {
      body += `<p>The following verified syndicators are currently operating in ${escapeHtml(stateName)}:</p><ul>`;
      for (const s of syndicators) {
        const dealNote = s.active_deals ? ` — ${s.active_deals} active deal${s.active_deals > 1 ? "s" : ""}` : "";
        body += `<li><a href="${SITE_URL}/syndicator/${escapeHtml(s.slug || "")}">${escapeHtml(s.company_name)}</a> (${escapeHtml(s.city || stateName)})${dealNote}</li>`;
      }
      body += `</ul>`;
      body += `<p>Choosing the right syndicator is one of the most important decisions for passive investors. Look for a proven track record, transparent reporting, and alignment of interests through co-investment. EquityMD verifies syndicator credentials so you can invest with confidence.</p>`;
    } else {
      body += `<p>We're actively onboarding syndicators in ${escapeHtml(stateName)}. Browse the <a href="${SITE_URL}/directory">full syndicator directory</a> to find operators across all 50 states, or <a href="${SITE_URL}/list">list your syndication</a> to reach accredited investors looking to deploy capital in ${escapeHtml(stateName)}.</p>`;
      body += `<p>Quality syndicators typically have a consistent distribution history, conservative underwriting, and a clear value-add or development strategy. Evaluate general partners based on their exit performance and investor communication track record.</p>`;
    }

    // Current Investment Opportunities section
    body += `<h2>Current Investment Opportunities in ${escapeHtml(stateName)}</h2>`;
    if (deals && dealCount > 0) {
      body += `<p>Active syndication deals available for investment in ${escapeHtml(stateName)}:</p><ul>`;
      for (const d of deals) {
        const locStr = d.city ? ` in ${escapeHtml(d.city)}, ${stateAbbrev}` : "";
        body += `<li><a href="${SITE_URL}/deal/${escapeHtml(d.slug || "")}">${escapeHtml(d.name)}</a> — ${escapeHtml(d.property_type || "Real Estate")}${locStr}</li>`;
      }
      body += `</ul>`;
      body += `<p>Each deal on EquityMD includes detailed offering documents, projected returns, hold period, minimum investment, and sponsor background. Review the full investment thesis and risk factors before committing capital.</p>`;
    } else {
      body += `<p>There are currently no active syndication deals listed in ${escapeHtml(stateName)}. New opportunities are added regularly — <a href="${SITE_URL}/find">browse all active deals</a> or set up alerts to be notified when ${escapeHtml(stateName)} deals launch. Syndicators can <a href="${SITE_URL}/list">list deals for free</a> to reach our investor network.</p>`;
    }

    // Why Invest section (always unique with state-specific content)
    body += `<h2>Why Invest in ${escapeHtml(stateName)} Real Estate</h2>`;
    body += `<p>${escapeHtml(stateName)} presents diverse opportunities for real estate syndication investors. From multifamily apartments and industrial warehouses to retail centers and self-storage facilities, the state's economic fundamentals drive demand across multiple asset classes. Key factors investors should evaluate include:</p>`;
    body += `<ul>`;
    body += `<li><strong>Population Growth:</strong> States with net migration gains create sustained housing and commercial real estate demand.</li>`;
    body += `<li><strong>Employment Trends:</strong> Job creation in technology, healthcare, logistics, and energy sectors supports occupancy rates and rent growth.</li>`;
    body += `<li><strong>Regulatory Environment:</strong> Landlord-friendly states with lower property taxes and fewer rent control restrictions often provide stronger risk-adjusted returns.</li>`;
    body += `<li><strong>Cap Rate Spreads:</strong> Compare local cap rates against the 10-year Treasury yield to assess relative value in ${escapeHtml(stateName)} markets.</li>`;
    body += `<li><strong>Infrastructure Investment:</strong> Federal and state infrastructure spending can catalyze development in specific metros and corridors.</li>`;
    body += `</ul>`;
    body += `<p>Syndication allows investors to access institutional-quality real estate in ${escapeHtml(stateName)} with lower minimum commitments than direct ownership. By pooling capital with other accredited investors, you gain professional asset management, portfolio diversification, and potential tax advantages through depreciation and cost segregation.</p>`;

    // Getting Started section
    body += `<h2>Getting Started with ${escapeHtml(stateName)} Real Estate Syndication</h2>`;
    body += `<p>Ready to explore passive real estate investment in ${escapeHtml(stateName)}? Here's how to get started on EquityMD:</p>`;
    body += `<ol>`;
    body += `<li><strong>Create a free investor account</strong> to access deal details, syndicator profiles, and market data.</li>`;
    body += `<li><strong>Browse verified syndicators</strong> operating in ${escapeHtml(stateName)} and review their track records.</li>`;
    body += `<li><strong>Evaluate active deals</strong> with full offering documents, projected returns, and risk disclosures.</li>`;
    body += `<li><strong>Connect directly</strong> with sponsors to ask questions and complete your due diligence.</li>`;
    body += `</ol>`;
    body += `<p>EquityMD is the marketplace connecting real estate syndicators with accredited investors. All syndicators on our platform are verified, and our tools help you compare deals, track distributions, and build a diversified portfolio.</p>`;

    // Navigation links
    body += `<p><a href="${SITE_URL}/resources/market-reports">View All State Reports</a> | <a href="${SITE_URL}/find">Browse Deals</a> | <a href="${SITE_URL}/directory">Find Syndicators</a></p>`;

    return new Response(generateFullHtml({
      title,
      description: metaDesc,
      canonical: `${SITE_URL}/resources/market-reports/${stateSlug}`,
      bodyContent: body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": metaDesc,
        "url": `${SITE_URL}/resources/market-reports/${stateSlug}`,
        "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
        "datePublished": "2026-01-01",
        "dateModified": new Date().toISOString().split("T")[0],
      },
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Resources: Glossary
  if (pathname === "/resources/glossary" || pathname === "/resources/glossary/") {
    const glossaryTerms = [
      { term: "Accredited Investor", definition: "An individual with a net worth exceeding $1 million (excluding primary residence) or annual income above $200,000 ($300,000 jointly) for the past two years. SEC regulations require most real estate syndication investments to be offered only to accredited investors under Regulation D exemptions." },
      { term: "Capital Call", definition: "A request from the General Partner for Limited Partners to contribute additional capital beyond their initial investment. Capital calls are typically outlined in the operating agreement and may be used to fund unexpected repairs, cover shortfalls, or seize new opportunities within the investment." },
      { term: "Cap Rate (Capitalization Rate)", definition: "The ratio of a property's Net Operating Income (NOI) to its current market value or purchase price, expressed as a percentage. Cap rates help investors compare the relative value of different properties — a higher cap rate generally indicates higher potential returns but also higher risk." },
      { term: "Cash-on-Cash Return", definition: "The annual pre-tax cash flow divided by the total cash invested, expressed as a percentage. This metric measures the actual cash income earned on the cash invested and is one of the most common ways to evaluate the ongoing performance of a real estate syndication." },
      { term: "Preferred Return (Pref)", definition: "A minimum annual return that Limited Partners receive before the General Partner takes any share of profits. Common preferred returns in syndications range from 6% to 10%. This aligns incentives by ensuring investors are compensated before the sponsor profits." },
      { term: "IRR (Internal Rate of Return)", definition: "A comprehensive return metric that accounts for the timing and magnitude of all cash flows over the life of an investment. IRR reflects both ongoing distributions and the final profit at sale, making it the most widely used metric to compare syndication deals with different hold periods and cash flow patterns." },
      { term: "Equity Multiple", definition: "The total cash distributions received divided by the total equity invested. An equity multiple of 2.0x means an investor doubled their money over the life of the investment. Unlike IRR, the equity multiple does not account for the time value of money." },
      { term: "General Partner (GP)", definition: "The sponsor or syndicator who organizes, manages, and operates the real estate investment. The GP is responsible for finding deals, securing financing, managing the property, and executing the business plan. GPs typically invest alongside LPs and earn fees plus a share of profits (the promote)." },
      { term: "Limited Partner (LP)", definition: "A passive investor in a real estate syndication who contributes capital but does not participate in day-to-day management decisions. LPs have limited liability — their risk is generally capped at the amount of their investment — and they receive distributions according to the waterfall structure." },
      { term: "Waterfall Distribution", definition: "The hierarchical structure that determines how cash flow and profits are split between General Partners and Limited Partners. A typical waterfall might return all invested capital first, then pay a preferred return, then split remaining profits 70/30 or 80/20 between LPs and GPs." },
      { term: "Hurdle Rate", definition: "A minimum return threshold that must be achieved before the General Partner receives their promoted interest (profit share). The hurdle rate is typically equal to the preferred return and ensures the sponsor only profits after delivering satisfactory returns to investors." },
      { term: "Clawback Provision", definition: "A contractual clause that requires the General Partner to return excess distributions if, at the end of the investment, LPs have not received their agreed-upon preferred return and return of capital. This provision protects investors from scenarios where early distributions were overly optimistic." },
      { term: "Promote (Carried Interest)", definition: "The General Partner's share of profits above the preferred return hurdle. The promote is the primary financial incentive for the sponsor and typically ranges from 20% to 40% of profits after LPs receive their preferred return. It aligns GP and LP interests by rewarding strong performance." },
      { term: "K-1 Tax Form", definition: "An IRS tax document (Schedule K-1, Form 1065) provided annually to each partner in a real estate syndication. The K-1 reports each investor's share of income, losses, deductions, and credits, which are then reported on the investor's personal tax return. K-1s are often issued in March or April." },
      { term: "1031 Exchange", definition: "A provision in the U.S. tax code (Section 1031) that allows investors to defer capital gains taxes by reinvesting proceeds from the sale of one investment property into a like-kind replacement property. Strict timelines apply: 45 days to identify replacements and 180 days to close." },
      { term: "Depreciation", definition: "A non-cash tax deduction that allows real estate investors to write off the cost of a building over its useful life (27.5 years for residential, 39 years for commercial). Depreciation can significantly reduce taxable income from syndication distributions, creating \"phantom losses\" that offset real cash flow." },
      { term: "Cost Segregation", definition: "An engineering-based tax strategy that accelerates depreciation by identifying building components (carpeting, fixtures, landscaping) that can be depreciated over 5, 7, or 15 years instead of the standard 27.5 or 39 years. This front-loads tax benefits and can dramatically improve after-tax returns in early years." },
      { term: "Debt Service Coverage Ratio (DSCR)", definition: "The ratio of a property's Net Operating Income to its total debt payments (principal and interest). A DSCR of 1.25x means the property generates 25% more income than needed to cover its debt. Lenders typically require a minimum DSCR of 1.2x to 1.5x." },
      { term: "Loan-to-Value (LTV)", definition: "The ratio of a property's mortgage balance to its appraised value, expressed as a percentage. An LTV of 70% means the loan represents 70% of the property's value. Lower LTV ratios indicate more equity and less risk, while higher LTV increases leverage and potential returns — but also risk." },
      { term: "Net Operating Income (NOI)", definition: "A property's total income minus all operating expenses, excluding debt service, capital expenditures, and depreciation. NOI is the foundational metric for commercial real estate valuation and is used to calculate cap rates, DSCR, and overall property performance." },
      { term: "Value-Add", definition: "An investment strategy focused on acquiring properties below market value that can be improved through renovations, better management, or repositioning to increase rents and property value. Value-add syndications typically target higher returns than core strategies but involve more execution risk and a longer path to stabilization." },
      { term: "Core / Core-Plus / Opportunistic", definition: "Risk-return categories for real estate investments. Core properties are stabilized, high-quality assets with low risk and modest returns (6-8% IRR). Core-Plus adds light value-add potential (8-12% IRR). Opportunistic strategies involve significant repositioning, development, or distress with the highest return targets (15%+ IRR) and greatest risk." },
      { term: "Syndication", definition: "A structure where a group of investors pool their capital to acquire real estate assets that would be difficult to purchase individually. The General Partner (sponsor) manages the investment while Limited Partners provide the majority of equity capital. Syndications are typically structured as LLCs and governed by SEC regulations." },
      { term: "PPM (Private Placement Memorandum)", definition: "The primary legal disclosure document in a real estate syndication, similar to a prospectus. The PPM outlines the investment opportunity, business plan, risk factors, fee structure, projected returns, and the rights and obligations of all parties. Reviewing the PPM thoroughly is essential before investing." },
      { term: "Subscription Agreement", definition: "The legal contract an investor signs to formally commit capital to a syndication. The subscription agreement confirms the investor's accredited status, investment amount, and acknowledgment of risks. Once signed and accepted by the GP, it creates a binding obligation to fund the investment." },
      { term: "Operating Agreement", definition: "The governing document of the LLC that holds the syndication property. The operating agreement defines the rights, responsibilities, and economic arrangements between GPs and LPs, including distribution waterfalls, voting rights, reporting requirements, and procedures for major decisions or dissolution." },
      { term: "Hold Period", definition: "The projected length of time a syndication plans to own and operate the property before selling, typically ranging from 3 to 7 years. The hold period affects overall returns, tax implications, and liquidity — investors should be prepared to have their capital locked up for the full duration." },
      { term: "Stabilized Property", definition: "A property that has reached a consistent level of occupancy (typically 90%+) and is generating predictable cash flow. Stabilized properties are generally lower risk than properties undergoing lease-up or renovation and are valued based on their current income rather than projected future performance." },
      { term: "Bridge Loan", definition: "Short-term financing (typically 1-3 years) used to acquire or reposition a property before securing long-term permanent financing. Bridge loans offer flexibility and faster closings but carry higher interest rates and often require interest-only payments. They are common in value-add syndication strategies." },
      { term: "Mezzanine Debt", definition: "A layer of financing that sits between senior debt (the primary mortgage) and equity in the capital stack. Mezzanine debt carries higher interest rates than senior debt because it is subordinate in the event of default, but it allows sponsors to increase leverage without diluting LP equity." },
      { term: "Pari Passu", definition: "A Latin term meaning \"on equal footing.\" In syndications, pari passu describes a distribution structure where all investors at the same level receive returns proportionally to their investment amount, without preference given to any single investor over others in the same class." },
      { term: "Pro Rata", definition: "Proportional allocation based on each investor's ownership percentage. In a syndication, distributions, capital calls, and voting rights are typically allocated pro rata — meaning an investor who contributed 10% of the equity receives 10% of the distributions and bears 10% of any additional capital requests." },
    ];

    const glossaryHtml = glossaryTerms.map(t =>
      `<h3>${escapeHtml(t.term)}</h3>\n      <p>${escapeHtml(t.definition)}</p>`
    ).join("\n      ");

    return new Response(generateFullHtml({
      title: "Real Estate Syndication Glossary | 30+ Investment Terms Defined | EquityMD",
      description: "Comprehensive glossary of 30+ real estate syndication and passive investing terms. Learn about IRR, cap rates, waterfall distributions, preferred returns, 1031 exchanges, and more.",
      canonical: `${SITE_URL}/resources/glossary`,
      bodyContent: `<h1>Real Estate Syndication Glossary</h1>
      <p>Understanding real estate syndication terminology is essential for making informed investment decisions. This comprehensive glossary covers 30+ key terms every passive investor should know — from accredited investor requirements to waterfall distribution structures. Whether you're evaluating your first syndication deal or building a diversified portfolio, these definitions will help you navigate offering documents, analyze deal structures, and communicate confidently with sponsors.</p>
      ${glossaryHtml}
      <h2>Continue Your Education</h2>
      <p>Now that you understand the terminology, put your knowledge to work:</p>
      <ul>
        <li><a href="${SITE_URL}/resources/due-diligence">Due Diligence Checklist</a> — A step-by-step guide to evaluating syndication deals</li>
        <li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a> — Model projected returns for any syndication investment</li>
        <li><a href="${SITE_URL}/find">Browse Active Deals</a> — Explore syndication opportunities on EquityMD</li>
        <li><a href="${SITE_URL}/directory">Find Syndicators</a> — Connect with vetted sponsors and operators</li>
      </ul>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "name": "Real Estate Syndication Glossary",
        "description": "Comprehensive glossary of real estate syndication and passive investing terms including IRR, cap rate, waterfall distributions, preferred returns, and 30+ more investment terms.",
        "url": `${SITE_URL}/resources/glossary`,
        "hasDefinedTerm": glossaryTerms.map(t => ({
          "@type": "DefinedTerm",
          "name": t.term,
          "description": t.definition,
        })),
      },
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Resources: Due Diligence
  if (pathname === "/resources/due-diligence" || pathname === "/resources/due-diligence/") {
    return new Response(generateFullHtml({
      title: "Real Estate Syndication Due Diligence Checklist | EquityMD",
      description: "Complete due diligence checklist for evaluating real estate syndication deals. Covers sponsor vetting, deal structure analysis, property evaluation, financial projections, and legal document review.",
      canonical: `${SITE_URL}/resources/due-diligence`,
      bodyContent: `<h1>Real Estate Syndication Due Diligence Checklist</h1>
      <p>Thorough due diligence is the most important step in real estate syndication investing. Unlike publicly traded REITs, syndication investments are illiquid and involve entrusting your capital to a specific sponsor for years. This comprehensive checklist will guide you through every critical area of evaluation — from vetting the syndicator to reviewing legal documents — so you can invest with confidence and avoid costly mistakes.</p>

      <h2>1. Sponsor and Syndicator Evaluation</h2>
      <p>The sponsor (General Partner) is the single most important factor in a syndication's success. Even a mediocre deal can succeed with an exceptional operator, while a great property can fail under poor management.</p>
      <h3>Track Record and Experience</h3>
      <ul>
        <li><strong>Deal history:</strong> How many syndications has the sponsor completed? What were the actual returns versus projections? Ask for a full track record showing realized deals, not just current offerings.</li>
        <li><strong>Asset class expertise:</strong> Does the sponsor specialize in the property type being offered (multifamily, self-storage, office)? Specialists typically outperform generalists.</li>
        <li><strong>Market knowledge:</strong> How well does the sponsor know the specific market? Local operators with boots-on-the-ground presence often have advantages in deal sourcing, contractor relationships, and tenant management.</li>
        <li><strong>Full-cycle experience:</strong> Has the sponsor completed full investment cycles (acquisition through disposition)? Sponsors who have only acquired properties during a bull market may lack experience navigating downturns.</li>
      </ul>
      <h3>References and Reputation</h3>
      <ul>
        <li><strong>Investor references:</strong> Ask to speak with 3-5 current or past investors. Inquire about communication quality, distribution consistency, and how the sponsor handled unexpected challenges.</li>
        <li><strong>Online presence:</strong> Search for reviews, complaints, and any SEC or state regulatory actions. Check the sponsor's profile on platforms like EquityMD for verified reviews.</li>
        <li><strong>Skin in the game:</strong> How much of their own capital is the GP investing alongside LPs? Sponsors who co-invest (typically 5-10%+ of equity) demonstrate alignment and confidence in their own deals.</li>
      </ul>

      <h2>2. Deal Structure Analysis</h2>
      <p>Understanding how the deal is structured determines how your returns are calculated and when you get paid. No two syndications are identical, so careful comparison is essential.</p>
      <h3>Equity Split and Waterfall</h3>
      <ul>
        <li><strong>LP/GP split:</strong> Common structures include 70/30 or 80/20 splits after preferred return. Understand exactly what percentage of profits you receive at each tier of the waterfall.</li>
        <li><strong>Preferred return:</strong> What is the preferred return rate (typically 6-10%)? Is it cumulative (accrues if unpaid) or non-cumulative? Cumulative preferred returns offer stronger investor protection.</li>
        <li><strong>Return of capital:</strong> When do investors receive their initial capital back — before or after the GP takes their promote? Look for structures that return LP capital before GP profit participation.</li>
      </ul>
      <h3>Fee Structure</h3>
      <ul>
        <li><strong>Acquisition fee:</strong> Typically 1-3% of purchase price. Ensure this is reasonable for the deal size and complexity.</li>
        <li><strong>Asset management fee:</strong> Usually 1-2% of collected revenue or invested equity. Understand the basis for calculation and whether it's charged on committed or deployed capital.</li>
        <li><strong>Disposition fee:</strong> Often 1% of the sale price. Some sponsors waive this if return hurdles aren't met.</li>
        <li><strong>Construction/renovation management fee:</strong> Typically 5-10% of renovation budget for value-add deals. This should be clearly disclosed in the PPM.</li>
        <li><strong>Refinance fee:</strong> Some sponsors charge 0.5-1% upon refinancing. Excessive fees can erode LP returns.</li>
      </ul>

      <h2>3. Property Analysis</h2>
      <p>The underlying real estate fundamentals must support the business plan. Even the best sponsor cannot overcome a fundamentally flawed property or market.</p>
      <h3>Location and Market Fundamentals</h3>
      <ul>
        <li><strong>Population and job growth:</strong> Target markets with above-average population growth, diverse employment bases, and major employers. Avoid markets dependent on a single industry.</li>
        <li><strong>Supply pipeline:</strong> Research new construction permits and projects under development. Markets with limited new supply and high demand create favorable conditions for rent growth.</li>
        <li><strong>Landlord-friendly regulations:</strong> Understand state and local laws regarding rent control, eviction processes, and tenant protections. Landlord-friendly states generally offer more predictable cash flows.</li>
        <li><strong>Submarket analysis:</strong> Drill down beyond the MSA level. Evaluate the specific neighborhood, school districts, crime statistics, and proximity to amenities and transportation.</li>
      </ul>
      <h3>Physical Property Condition</h3>
      <ul>
        <li><strong>Inspection reports:</strong> Review third-party property condition assessments (PCAs). Understand the age and condition of major systems: roof, HVAC, plumbing, electrical, and structural elements.</li>
        <li><strong>Deferred maintenance:</strong> Identify any deferred maintenance that could become expensive surprises. Ensure the renovation budget includes adequate reserves.</li>
        <li><strong>Environmental reports:</strong> Phase I (and Phase II if needed) environmental site assessments should be completed to identify contamination risks, asbestos, lead paint, or other environmental hazards.</li>
      </ul>

      <h2>4. Financial Projections Review</h2>
      <p>Every syndication presents projected returns, but the assumptions behind those projections matter far more than the headline numbers. Scrutinize each assumption independently.</p>
      <h3>Revenue Assumptions</h3>
      <ul>
        <li><strong>Current vs. projected rents:</strong> Compare the sponsor's rent projections to current market rents from independent sources (CoStar, RentCafe, local comps). Be skeptical of projections that assume rents significantly above market.</li>
        <li><strong>Occupancy assumptions:</strong> What stabilized occupancy does the pro forma assume? For most multifamily properties, 93-95% is realistic. Be wary of projections assuming 97%+ occupancy.</li>
        <li><strong>Rent growth rate:</strong> Annual rent growth projections should be supported by historical market data. Be cautious of projections assuming more than 3-4% annual growth without strong justification.</li>
        <li><strong>Other income:</strong> Evaluate assumptions for ancillary income (pet fees, parking, storage, RUBS/utility billing). These should be benchmarked against comparable properties in the market.</li>
      </ul>
      <h3>Expense and Exit Assumptions</h3>
      <ul>
        <li><strong>Operating expenses:</strong> Are expense projections realistic? Compare the expense ratio (expenses as a percentage of revenue) to market averages. Be skeptical of unusually low expense projections.</li>
        <li><strong>Tax reassessment:</strong> Will the property be reassessed upon purchase? Factor in potential property tax increases, which can significantly impact NOI in states without Proposition 13-style protections.</li>
        <li><strong>Exit cap rate:</strong> The exit (reversion) cap rate assumption drives a large portion of projected returns. Conservative underwriting should assume an exit cap rate 0.25-0.50% higher than the going-in cap rate to account for potential market softening.</li>
        <li><strong>Sensitivity analysis:</strong> Ask the sponsor to show returns under different scenarios: base case, downside, and upside. A deal that still returns invested capital in a downside scenario demonstrates appropriate risk management.</li>
      </ul>

      <h2>5. Legal Document Review</h2>
      <p>Legal documents govern every aspect of your investment. Never invest without reading — or having an attorney review — the key documents.</p>
      <h3>PPM (Private Placement Memorandum)</h3>
      <ul>
        <li><strong>Risk factors:</strong> Read every risk factor. The PPM is legally required to disclose material risks, and this section reveals what could go wrong.</li>
        <li><strong>Use of proceeds:</strong> Understand exactly how your investment capital will be deployed — purchase price, closing costs, renovation budget, reserves, and fees.</li>
        <li><strong>Conflicts of interest:</strong> Review disclosures about related-party transactions, such as GP-affiliated property management companies or construction firms.</li>
      </ul>
      <h3>Operating Agreement</h3>
      <ul>
        <li><strong>Distribution waterfall:</strong> Confirm the waterfall matches what was presented in marketing materials. Look for any provisions that could alter the split under certain conditions.</li>
        <li><strong>Major decision rights:</strong> Under what circumstances can LPs vote? Typically, LP consent is required for refinancing, additional capital calls, or early sale. Understand your voting rights.</li>
        <li><strong>Removal provisions:</strong> Can the GP be removed for cause (fraud, gross negligence)? What is the vote threshold? Strong GP removal provisions protect investors from worst-case scenarios.</li>
        <li><strong>Transfer restrictions:</strong> Understand the limitations on selling or transferring your interest. Most syndications restrict transfers and require GP approval.</li>
      </ul>

      <h2>6. Red Flags to Watch For</h2>
      <p>Experienced investors learn to recognize warning signs that suggest a deal may not be as presented. Walk away if you encounter any of these red flags:</p>
      <ul>
        <li><strong>Guaranteed returns:</strong> No real estate investment can guarantee returns. Any sponsor who uses the word \"guaranteed\" is either misleading you or violating securities regulations.</li>
        <li><strong>Pressure to invest quickly:</strong> Legitimate sponsors provide adequate time for due diligence. High-pressure tactics suggesting you'll \"miss out\" are a red flag.</li>
        <li><strong>Lack of transparency:</strong> If a sponsor is evasive about their track record, fee structure, or past losses, move on. Reputable sponsors are transparent about both successes and failures.</li>
        <li><strong>No third-party reports:</strong> Sponsors should provide independent appraisals, property condition assessments, and environmental reports. Relying solely on sponsor-prepared materials is risky.</li>
        <li><strong>Unrealistic projections:</strong> If projected returns seem too good to be true — especially in a competitive market — they probably are. Compare projections to market benchmarks and recent comparable sales.</li>
        <li><strong>Excessive fees:</strong> Total fees that exceed 5-6% of invested capital at acquisition should be scrutinized. High fees can significantly erode LP returns, especially in shorter hold periods.</li>
        <li><strong>No co-investment:</strong> Sponsors who don't invest their own capital alongside LPs may lack alignment. Meaningful GP co-investment demonstrates conviction in the deal.</li>
        <li><strong>Poor communication history:</strong> Ask existing investors about the sponsor's reporting cadence and quality. Monthly or quarterly updates with financial details are the industry standard.</li>
      </ul>

      <h2>Your Due Diligence Toolkit</h2>
      <p>Use these EquityMD resources to support your due diligence process:</p>
      <ul>
        <li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a> — Understand every term in offering documents</li>
        <li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a> — Model and compare projected returns across deals</li>
        <li><a href="${SITE_URL}/directory">Syndicator Directory</a> — Research sponsors with verified profiles and reviews</li>
        <li><a href="${SITE_URL}/find">Browse Active Deals</a> — Find syndication opportunities that match your criteria</li>
        <li><a href="${SITE_URL}/resources/market-reports">Market Reports</a> — Research market fundamentals by state</li>
      </ul>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Real Estate Syndication Due Diligence Checklist",
        "description": "A comprehensive step-by-step guide to evaluating real estate syndication investments, covering sponsor evaluation, deal structure, property analysis, financial projections, and legal review.",
        "url": `${SITE_URL}/resources/due-diligence`,
        "step": [
          { "@type": "HowToStep", "name": "Evaluate the Sponsor", "text": "Research the syndicator's track record, experience, references, and co-investment. The sponsor is the most important factor in a syndication's success." },
          { "@type": "HowToStep", "name": "Analyze Deal Structure", "text": "Review the equity split, waterfall distribution, preferred return, and complete fee structure to understand how returns are calculated." },
          { "@type": "HowToStep", "name": "Assess the Property", "text": "Evaluate location fundamentals, market conditions, physical property condition, and environmental reports." },
          { "@type": "HowToStep", "name": "Review Financial Projections", "text": "Scrutinize rent assumptions, occupancy projections, expense ratios, exit cap rates, and sensitivity analysis." },
          { "@type": "HowToStep", "name": "Review Legal Documents", "text": "Read the PPM, operating agreement, and subscription agreement. Understand risk factors, use of proceeds, voting rights, and transfer restrictions." },
          { "@type": "HowToStep", "name": "Check for Red Flags", "text": "Watch for guaranteed returns, pressure tactics, lack of transparency, unrealistic projections, excessive fees, and poor communication." },
        ],
      },
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Resources: Calculator
  if (pathname === "/resources/calculator" || pathname === "/resources/calculator/") {
    return new Response(generateFullHtml({
      title: "Real Estate Syndication Returns Calculator | EquityMD",
      description: "Calculate projected returns for real estate syndication investments. Model IRR, equity multiple, cash-on-cash returns, and total distributions based on your investment amount, hold period, and deal terms.",
      canonical: `${SITE_URL}/resources/calculator`,
      bodyContent: `<h1>Real Estate Syndication Returns Calculator</h1>
      <p>Making informed investment decisions requires understanding exactly how your capital will perform over time. The EquityMD Returns Calculator helps you model projected returns for any real estate syndication deal, compare different investment opportunities side by side, and understand how changes in key variables affect your bottom line.</p>

      <h2>How the Calculator Works</h2>
      <p>Our syndication returns calculator uses industry-standard financial modeling to project your investment outcomes. Input your deal-specific variables and the calculator will generate projected returns across multiple metrics — giving you a comprehensive view of how your investment may perform.</p>

      <h2>Calculator Inputs Explained</h2>

      <h3>Investment Amount</h3>
      <p>The total capital you plan to invest in the syndication. Most syndications require minimum investments of $25,000 to $100,000, though some accept lower amounts. Enter your actual planned investment to see personalized projections of dollar-amount returns, not just percentages.</p>

      <h3>Target IRR (Internal Rate of Return)</h3>
      <p>The annualized return that accounts for the timing of all cash flows — both ongoing distributions and the final payout at sale. IRR is the gold standard metric for comparing syndication deals because it reflects the time value of money. Typical syndication IRR targets range from 12% to 20%+ depending on the risk profile: core deals may target 8-12%, value-add strategies 14-18%, and opportunistic deals 18-25%+.</p>

      <h3>Hold Period</h3>
      <p>The projected number of years the syndication plans to hold the property before selling, typically 3 to 7 years. The hold period significantly impacts your returns — longer holds generally produce higher equity multiples but may result in lower IRRs due to the time value of money. Consider your personal liquidity needs when evaluating hold periods, as syndication investments are illiquid during this time.</p>

      <h3>Preferred Return</h3>
      <p>The minimum annual return paid to Limited Partners before the General Partner receives any profit share. Preferred returns typically range from 6% to 10% and may be paid monthly or quarterly. A higher preferred return provides more downside protection and ensures you receive consistent income during the hold period before the sponsor participates in profits.</p>

      <h3>Equity Multiple</h3>
      <p>The total amount of money you expect to receive (including return of capital) divided by your initial investment. An equity multiple of 2.0x means you expect to receive $2 for every $1 invested — doubling your money. This metric tells you the total return magnitude but doesn't account for how long it takes to achieve. Typical syndication equity multiples range from 1.5x to 2.5x over a 3-7 year hold period.</p>

      <h2>Understanding Your Results</h2>

      <h3>Total Distributions</h3>
      <p>The sum of all cash payments you'll receive throughout the life of the investment, including ongoing preferred return distributions and the final distribution upon property sale. This represents the total dollars returned to you and is the basis for calculating your equity multiple.</p>

      <h3>Annual Cash Flow</h3>
      <p>The projected yearly distributions you'll receive during the hold period, before the final sale. This represents your ongoing passive income from the investment and is determined primarily by the property's cash flow and your preferred return rate.</p>

      <h3>Profit Above Investment</h3>
      <p>Your total distributions minus your original investment amount — this is your actual profit in dollar terms. For a $100,000 investment with a 2.0x equity multiple, your profit above investment would be $100,000.</p>

      <h2>Example Scenarios</h2>

      <h3>Scenario 1: Conservative Multifamily (Core-Plus)</h3>
      <p>A $50,000 investment in a stabilized 200-unit apartment complex with an 8% preferred return, 5-year hold period, and projected 1.7x equity multiple. Expected annual cash distributions of approximately $4,000 (8% pref) with a projected total return of $85,000 — including $35,000 in profit above the initial investment. Projected IRR: approximately 13%.</p>

      <h3>Scenario 2: Value-Add Multifamily</h3>
      <p>A $75,000 investment in a 150-unit apartment complex requiring renovation, with a 7% preferred return, 4-year hold period, and projected 2.0x equity multiple. Cash flow may be lower in years 1-2 during renovations, ramping up to full distributions in years 3-4. Projected total return of $150,000 with $75,000 in profit. Projected IRR: approximately 18%.</p>

      <h3>Scenario 3: Opportunistic Self-Storage Development</h3>
      <p>A $100,000 investment in a ground-up self-storage development with a 10% preferred return, 3-year hold period, and projected 1.8x equity multiple. Limited cash flow during the construction and lease-up phase (year 1), with distributions beginning in year 2. Projected total return of $180,000 with $80,000 in profit. Projected IRR: approximately 22%.</p>

      <h2>Tips for Using the Calculator</h2>
      <ul>
        <li><strong>Run multiple scenarios:</strong> Don't just model the sponsor's base case. Create conservative, base, and optimistic projections to understand the range of possible outcomes.</li>
        <li><strong>Compare deals apples-to-apples:</strong> Use the same investment amount across different deals to directly compare dollar-amount returns, not just percentages.</li>
        <li><strong>Focus on IRR and equity multiple together:</strong> A high equity multiple with a long hold period may produce a lower IRR than a moderate multiple achieved quickly. Both metrics matter.</li>
        <li><strong>Account for taxes:</strong> Calculator results show pre-tax returns. Consult a CPA about how depreciation, cost segregation, and K-1 distributions will affect your after-tax returns.</li>
        <li><strong>Build in a margin of safety:</strong> Reduce the sponsor's projected returns by 15-20% to stress-test the deal. If the investment still meets your return threshold after a haircut, it demonstrates resilience.</li>
      </ul>

      <h2>Learn More About Syndication Investing</h2>
      <ul>
        <li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a> — Master the terminology used in syndication deals</li>
        <li><a href="${SITE_URL}/resources/due-diligence">Due Diligence Checklist</a> — Comprehensive guide to evaluating syndication investments</li>
        <li><a href="${SITE_URL}/find">Browse Active Deals</a> — Apply your knowledge to real syndication opportunities</li>
        <li><a href="${SITE_URL}/directory">Find Syndicators</a> — Connect with vetted sponsors on EquityMD</li>
        <li><a href="${SITE_URL}/resources/market-reports">Market Reports</a> — Research real estate market fundamentals by state</li>
      </ul>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Real Estate Syndication Returns Calculator",
        "description": "Calculate and model projected returns for real estate syndication investments including IRR, equity multiple, cash-on-cash returns, and total distributions.",
        "url": `${SITE_URL}/resources/calculator`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Resources (generic fallback for other resource pages)
  if (pathname.startsWith("/resources/")) {
    const resource = pathname.replace("/resources/", "").replace(/\/$/, "") || "resources";
    const title = `Resources | EquityMD`;
    return new Response(generateFullHtml({
      title,
      description: "EquityMD resources for real estate syndication investors — glossary, due diligence guides, returns calculator, and market reports.",
      canonical: `${SITE_URL}/resources/${resource}`,
      bodyContent: `<h1>Real Estate Syndication Resources</h1>
      <p>EquityMD provides free educational resources to help passive investors make informed decisions about real estate syndication investments.</p>
      <ul>
        <li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a> — 30+ real estate syndication terms defined</li>
        <li><a href="${SITE_URL}/resources/due-diligence">Due Diligence Checklist</a> — Step-by-step guide to evaluating deals</li>
        <li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a> — Model projected investment returns</li>
        <li><a href="${SITE_URL}/resources/market-reports">Market Reports</a> — Real estate market data by state</li>
      </ul>
      <p><a href="${SITE_URL}/find">Browse Active Deals</a> | <a href="${SITE_URL}/directory">Find Syndicators</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Success stories
  if (pathname === "/success-stories") {
    return new Response(generateFullHtml({
      title: "Real Estate Investing Success Stories | EquityMD",
      description: "Read real success stories from investors who built passive income through real estate syndication on EquityMD.",
      canonical: `${SITE_URL}/success-stories`,
      bodyContent: `<h1>Real Estate Investing Success Stories</h1><p>Discover how investors are building passive income through real estate syndication.</p><p><a href="${SITE_URL}/success-stories">Read stories</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Market map
  if (pathname === "/market-map") {
    return new Response(generateFullHtml({
      title: "Real Estate Investment Market Map | EquityMD",
      description: "Interactive map showing real estate syndication deals and syndicators across the US. Find investment opportunities near you.",
      canonical: `${SITE_URL}/market-map`,
      bodyContent: `<h1>Real Estate Investment Market Map</h1><p>Explore syndication opportunities across the US on our interactive market map.</p><p><a href="${SITE_URL}/market-map">View map</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Compare syndicators
  if (pathname === "/compare") {
    return new Response(generateFullHtml({
      title: "Compare Real Estate Syndicators | EquityMD",
      description: "Side-by-side comparison of real estate syndicators. Compare track records, fees, minimum investments, and reviews.",
      canonical: `${SITE_URL}/compare`,
      bodyContent: `<h1>Compare Real Estate Syndicators</h1><p>Compare syndicators side-by-side to find the best fit for your investment goals.</p><p><a href="${SITE_URL}/compare">Compare now</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // New pricing
  if (pathname === "/new-pricing") {
    return new Response(generateFullHtml({
      title: "Syndicator Plans & Pricing 2026 | EquityMD",
      description: "Affordable plans for syndicators to list deals on EquityMD and reach thousands of accredited investors.",
      canonical: `${SITE_URL}/new-pricing`,
      bodyContent: `<h1>Syndicator Plans & Pricing</h1><p>List your deals on EquityMD. Free to start, premium plans for more visibility.</p><p><a href="${SITE_URL}/new-pricing">View plans</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Legal pages
  if (pathname.startsWith("/legal/")) {
    const page = pathname.replace("/legal/", "").replace(/\/$/, "");
    const legalTitles: Record<string, string> = {
      privacy: "Privacy Policy | EquityMD",
      terms: "Terms of Service | EquityMD",
      disclaimer: "Investment Disclaimer | EquityMD",
      accreditation: "Accreditation Requirements | EquityMD",
      compliance: "Compliance & Regulatory | EquityMD",
    };
    const title = legalTitles[page] || "Legal | EquityMD";
    return new Response(generateFullHtml({
      title,
      description: `${title.replace(" | EquityMD", "")} for EquityMD real estate syndication platform.`,
      canonical: `${SITE_URL}/legal/${page}`,
      bodyContent: `<h1>${escapeHtml(title.replace(" | EquityMD", ""))}</h1><p><a href="${SITE_URL}/legal/${page}">Read full document</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Rankings
  if (pathname.startsWith("/rankings")) {
    const cat = pathname.replace("/rankings", "").replace(/^\//, "").replace(/\/$/, "");
    const title = cat ? `Best ${cat.replace(/-/g, " ")} 2026 | EquityMD` : "Best Real Estate Syndicators 2026 | EquityMD";
    return new Response(generateFullHtml({
      title,
      description: `Compare top real estate syndicators. Ranked by reviews, track record, and deal volume.`,
      canonical: `${SITE_URL}/rankings${cat ? `/${cat}` : ""}`,
      bodyContent: `<h1>${escapeHtml(title)}</h1><p><a href="${SITE_URL}/rankings${cat ? `/${cat}` : ""}">View rankings</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  return next();
}
