import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import type {
  PortableTextBlock,
  PortableTextComponents,
} from "@portabletext/react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import ChatWidget from "@/components/ChatWidget";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity-image";
import { portableTextToPlain } from "@/lib/portable-text-plain";

export const revalidate = 60;

type SanityImage = {
  asset?: { _ref: string };
  alt?: string;
};

type FAQItem = { question: string; answer: string };

type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  heroImage?: SanityImage;
  midImage?: SanityImage;
  socialImage?: SanityImage;
  body?: PortableTextBlock[];
  metaDescription?: string;
  primaryKeyword?: string;
  articleSection?: string;
  faqItems?: FAQItem[];
  authorName?: string;
};

const SITE_URL = "https://adam-sowden-site.vercel.app";

const postQuery = `*[_type == "blogPost" && slug.current == $slug && complianceApproved == true][0] {
  _id, title, slug, publishedAt, heroImage, midImage, socialImage,
  body, metaDescription, primaryKeyword, articleSection, faqItems, authorName
}`;

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await client.fetch<BlogPost | null>(postQuery, { slug });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: { current: string } }[]>(
      `*[_type == "blogPost" && complianceApproved == true && defined(slug.current)] { slug }`
    );
    return slugs.map((s) => ({ slug: s.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found — Adam Sowden" };

  const title = `${post.title} — Adam Sowden`;
  const description = post.metaDescription ?? "";
  const url = `${SITE_URL}/blog/${post.slug.current}`;
  const ogImage = post.socialImage
    ? urlFor(post.socialImage).width(1200).height(630).url()
    : post.heroImage
    ? urlFor(post.heroImage).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Adam Sowden",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-[#111111] mt-12 mb-5 leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-semibold text-xl md:text-2xl text-[#111111] mt-10 mb-4 leading-snug">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-lg text-[#111111]/85 leading-[1.75] mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#188bf6] pl-6 my-8 text-lg text-[#111111]/85 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-[#188bf6] hover:underline"
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc space-y-2 text-lg text-[#111111]/85">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal space-y-2 text-lg text-[#111111]/85">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  types: {
    image: ({ value }) => {
      const imgUrl = urlFor(value).width(1400).url();
      return (
        <figure className="my-10">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-black/5">
            <Image
              src={imgUrl}
              alt={value?.alt ?? ""}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
          {value?.alt && (
            <figcaption className="mt-3 text-sm text-black/55 text-center">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const heroImageUrl = post.heroImage
    ? urlFor(post.heroImage).width(1600).height(900).url()
    : null;
  const midImageUrl = post.midImage
    ? urlFor(post.midImage).width(1400).height(787).url()
    : null;

  const publishedDate = new Date(post.publishedAt).toLocaleDateString(
    "en-AU",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: heroImageUrl ? [heroImageUrl] : undefined,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName || "Adam Sowden",
    },
    publisher: {
      "@type": "Organization",
      name: "Adam Sowden",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/adam-sowden-logo.png`,
      },
    },
    articleSection: post.articleSection,
    keywords: post.primaryKeyword,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug.current}`,
  };

  const faqJsonLd =
    post.faqItems && post.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <article>
          <Header post={post} publishedDate={publishedDate} />
          {heroImageUrl && (
            <HeroImage
              src={heroImageUrl}
              alt={post.heroImage?.alt || post.title}
            />
          )}
          <BodyContainer>
            {post.body && post.body.length > 0 && (
              <PortableText value={post.body} components={components} />
            )}
            {midImageUrl && (
              <MidImage src={midImageUrl} alt={post.midImage?.alt || ""} />
            )}
          </BodyContainer>
          {post.faqItems && post.faqItems.length > 0 && (
            <FAQ items={post.faqItems} />
          )}
          <ChatWidget
            article={{
              title: post.title,
              articleSection: post.articleSection,
              metaDescription: post.metaDescription,
              bodyPlain: portableTextToPlain(post.body),
            }}
          />
          <PostCTA />
        </article>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </>
  );
}

function Header({
  post,
  publishedDate,
}: {
  post: BlogPost;
  publishedDate: string;
}) {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
        {post.articleSection && (
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">
            {post.articleSection}
          </p>
        )}
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.08] text-[#111111]">
          {post.title}
        </h1>
        {post.metaDescription && (
          <p className="mt-6 text-lg md:text-xl text-[#111111]/75 leading-relaxed">
            {post.metaDescription}
          </p>
        )}
        <div className="mt-8 flex items-center gap-4 text-sm text-black/55">
          <span>{post.authorName || "Adam Sowden"}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{publishedDate}</time>
        </div>
      </div>
    </header>
  );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-6 pb-4">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-black/5">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1280px) 1024px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function BodyContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">{children}</div>
    </div>
  );
}

function MidImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="my-12">
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-black/5">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      {alt && (
        <figcaption className="mt-3 text-sm text-black/55 text-center">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Frequently asked
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10">
          Questions answered in this essay.
        </h2>
        <div className="space-y-4">
          {items.map((f, i) => (
            <details
              key={i}
              className="group bg-white border border-black/10 rounded-xl p-6 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg text-[#111111] leading-snug">
                  {f.question}
                </h3>
                <span className="mt-1 text-[#188bf6] text-xl select-none transition-transform group-open:rotate-45 leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 text-[#111111]/80 leading-relaxed whitespace-pre-line">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCTA() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          Want this applied to your business?
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          A 20-minute Quick Chat. No pitch. We look at where owner
          dependency is costing us growth and what becomes possible when
          it&apos;s removed.
        </p>
        <div className="mt-8 inline-flex">
          <CTAButton size="lg">Book a Quick Chat</CTAButton>
        </div>
      </div>
    </section>
  );
}
