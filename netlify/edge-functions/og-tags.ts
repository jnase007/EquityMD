import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://fzacguhxadpvjrmycwes.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
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
};

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get("user-agent") || "";
  if (!isBot(userAgent)) return context.next();

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

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
    const deals = await fetchSupabase(`/deals?slug=eq.${encodeURIComponent(slug)}&select=id,name,tagline,description,city,state,property_type`) as any[] | null;
    if (deals && deals.length > 0) {
      const deal = deals[0];
      let image = DEFAULT_IMAGE;
      const media = await fetchSupabase(`/deal_media?deal_id=eq.${deal.id}&is_cover=eq.true&select=url`) as any[] | null;
      if (media && media[0]?.url) image = media[0].url;
      const title = `${deal.name} | EquityMD`;
      const desc = deal.tagline || (deal.description || "").substring(0, 160) || `${deal.property_type} in ${deal.city}, ${deal.state}`;
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": deal.name,
        "description": desc,
        "image": image,
      };
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/deals/${slug}`,
        image,
        bodyContent: `
<h1>${escapeHtml(deal.name)}</h1>
<p>${escapeHtml(desc)}</p>
<p>${escapeHtml(deal.property_type || "")} investment in ${escapeHtml(deal.city || "")}, ${escapeHtml(deal.state || "")}</p>
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

  return context.next();
}
