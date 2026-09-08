/**
 * Pick the product a post should point at.
 *
 * The companion to related-posts.ts, for the same reason and with the same
 * method. Blog-to-blog orphaning was fixed by generating links; blog-to-product
 * links were still whatever someone had typed by hand, and it showed:
 * /products/outreach-agent had one inbound link on the whole site (the
 * /products hub), /waitlist had two, and nine of 23 posts pointed at no
 * product at all.
 *
 * Products are static routes, not Sanity documents, so their match terms live
 * here. Every term is lifted from the product-to-question mapping already in
 * clients/adam-sowden/seo-keywords.md, so this file records that research
 * rather than inventing a second, competing taxonomy. When a product's
 * targeting changes there, change it here.
 */

export type Product = {
  slug: string;
  /** Product name as it is written on the site. */
  name: string;
  /** One line on what it does, for the link card. */
  tagline: string;
  /**
   * Phrases this product should win. Matched against a post's primary keyword
   * and title. Multi-word terms score higher than single words, so a specific
   * phrase beats an incidental word.
   */
  matchTerms: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "speed-to-lead-agent",
    name: "The Speed-to-Lead Agent",
    tagline:
      "Watches your forms, email and SMS around the clock and replies to every new enquiry in seconds, in your voice.",
    matchTerms: [
      "speed to lead",
      "lead response",
      "lead response automation",
      "automated lead response",
      "respond to leads faster",
      "follow up",
      "follow-up",
      "lead follow up",
      "automate lead response",
      "lead nurturing",
      "warm leads",
      "enquiry",
      "advisor follow-up",
      "financial advisors",
    ],
  },
  {
    slug: "site-conversation-agent",
    name: "The Site Conversation Agent",
    tagline:
      "Conversational AI that engages, qualifies and books your visitors in real time. Not a chatbot.",
    matchTerms: [
      "ai chatbot for website",
      "chatbot",
      "chatbot platforms",
      "ai website chat",
      "website chat",
      "conversational ai",
      "convert website visitors",
      "contact form",
      "contact form conversion",
      "book appointments from my website",
      "website visitors",
      "smart site",
      "smart-site",
    ],
  },
  {
    slug: "outreach-agent",
    name: "The Outreach Agent",
    tagline:
      "Continues every comment, reply and reaction your content earns, in your voice, while the interest is warm.",
    // NOTE: no published post currently targets these terms, so this product
    // wins few or no links. That is a content gap, not a matching bug:
    // seo-keywords.md lists both Outreach Agent questions ("How to follow up
    // on social media engagement?", "How to turn followers and comments into
    // clients?") as Open with no post against them. Do not add loose terms
    // here to manufacture links. A post pointed at the wrong product is worse
    // than a product with no inbound links, and it hides the real gap.
    matchTerms: [
      "social media engagement",
      "follow up on social media",
      "turn followers into clients",
      "comments into clients",
      "social media",
      "social media automation",
      "social media marketing",
      "outreach",
      "prospecting",
      "warm engagement",
    ],
  },
  {
    slug: "ai-marketing-team",
    name: "Irene, Your Own AI Marketing Team",
    tagline:
      "An AI marketing team trained on your methodology, voice and proof points. She plans the week and drafts. You approve.",
    matchTerms: [
      "ai marketing team",
      "what does an ai marketing team do",
      "ai marketing employee",
      "marketing va",
      "marketing va alternative",
      "hiring a marketing va",
      "ai copywriting",
      "copywriting",
      "email sequence",
      "ai marketing consultant",
      "marketing consultant",
      "in-house marketing",
      "write in your voice",
      "train an ai to write",
      "brand voice",
    ],
  },
  {
    slug: "content-ecosystem",
    name: "The Content Ecosystem",
    tagline:
      "A Living AI Website, a weekly content engine and a diagnostic that qualifies visitors. It publishes without you.",
    matchTerms: [
      "ai content marketing",
      "content marketing",
      "content system",
      "ai content tools",
      "content tools",
      "automated content creation",
      "ai blog writing",
      "create marketing content",
      "content without writing",
      "weekly content",
      "answer engine",
      "answer engine optimisation",
      "cited by ai",
      "ai seo",
      "update your website",
      "without a developer",
      "website is a brochure",
      "inbound marketing",
    ],
  },
  {
    slug: "marketing-ecosystem",
    name: "The Marketing Ecosystem",
    tagline:
      "Paid acquisition and distribution run as a system built on your methodology and owned by your business.",
    matchTerms: [
      "ai advertising",
      "advertising",
      "paid acquisition",
      "paid ads",
      "ai social media marketing",
      "marketing ecosystem",
      "distribution",
      "marketing automation",
      "marketing agency",
      "ai vs marketing agency",
      "replace a marketing agency",
      "ai lead generation",
      "lead generation",
      "ai marketing tools",
      "marketing tools",
      "ai marketing strategy",
    ],
  },
];

const W_PHRASE = 30; // a multi-word term found verbatim
const W_WORD = 8; // a single-word term
const W_TITLE_ONLY = 0.6; // a title hit counts for less than a keyword hit
const W_SECTION_ONLY = 0.8; // the section label is a deliberate topic statement
const MIN_SCORE = 12; // below this, link nothing rather than link badly
const W_ALREADY_LINKED = 10;

function normalise(s: string | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ");
}

function scoreProduct(
  product: Product,
  keyword: string,
  title: string,
  section: string
): number {
  let score = 0;
  for (const term of product.matchTerms) {
    const t = term.toLowerCase();
    const weight = t.includes(" ") || t.includes("-") ? W_PHRASE : W_WORD;
    if (keyword.includes(t)) score += weight;
    else if (section.includes(t)) score += weight * W_SECTION_ONLY;
    else if (title.includes(t)) score += weight * W_TITLE_ONLY;
  }
  return score;
}

export type ProductPostInput = {
  slug: string;
  title: string;
  primaryKeyword?: string;
  /**
   * The post's section label. Near-useless for clustering (19 of its 21 values
   * have one post each) but it is real editorial metadata about what the post
   * is about, and it often names the topic more plainly than the keyword does.
   * "The Follow-Up Gap" identifies a Speed-to-Lead post that neither its
   * keyword nor its title would match.
   */
  articleSection?: string;
};

/**
 * Assign one product to each post, across the whole corpus at once.
 *
 * Global rather than per-post for the same reason as related-posts: a purely
 * per-post choice pools everything on the two broadest products and leaves the
 * narrow ones with nothing, which is the problem being fixed. Each already-used
 * product carries a small penalty, enough to break near-ties without ever
 * overriding a clear match.
 *
 * A post with no product above MIN_SCORE gets none. A wrong product link is
 * worse than no product link.
 */
export function buildProductMap(
  posts: ProductPostInput[]
): Map<string, Product> {
  const result = new Map<string, Product>();
  const used = new Map<string, number>(PRODUCTS.map((p) => [p.slug, 0]));

  const order = [...posts].sort((a, b) => a.slug.localeCompare(b.slug));

  for (const post of order) {
    const keyword = normalise(post.primaryKeyword);
    const title = normalise(post.title);
    const section = normalise(post.articleSection);

    const ranked = PRODUCTS.map((product) => {
      const base = scoreProduct(product, keyword, title, section);
      return {
        product,
        base,
        adjusted: base - (used.get(product.slug) ?? 0) * W_ALREADY_LINKED,
      };
    })
      .filter((r) => r.base >= MIN_SCORE)
      .sort(
        (a, b) =>
          b.adjusted - a.adjusted || a.product.slug.localeCompare(b.product.slug)
      );

    if (ranked.length === 0) continue;

    const winner = ranked[0].product;
    used.set(winner.slug, (used.get(winner.slug) ?? 0) + 1);
    result.set(post.slug, winner);
  }

  return result;
}

/** The product for one post, or null if nothing matches well enough. */
export function selectProduct(
  posts: ProductPostInput[],
  currentSlug: string
): Product | null {
  return buildProductMap(posts).get(currentSlug) ?? null;
}
