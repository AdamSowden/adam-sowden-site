import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SubscribeForm from "@/components/SubscribeForm";
import { client } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Blog — Adam Sowden",
  description:
    "Essays on building marketing that runs without us. Zero-dependency systems, AI architecture, and why The Four Bad Options trap so many owners.",
};

type BlogPostSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  metaDescription?: string;
  articleSection?: string;
};

export const revalidate = 60;

async function fetchPosts(): Promise<BlogPostSummary[]> {
  try {
    return await client.fetch<BlogPostSummary[]>(
      `*[_type == "blogPost" && complianceApproved == true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        metaDescription,
        articleSection
      }`
    );
  } catch {
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await fetchPosts();

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Header />
        {posts.length === 0 ? <EmptyState /> : <PostGrid posts={posts} />}
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function Header() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          Essays
        </p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.05] text-[#111111] max-w-3xl">
          On building marketing that runs without us.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#111111]/75 max-w-2xl leading-relaxed">
          Long-form deconstruction of The Owner Trap, The Four Bad Options,
          and the systems that replace them.
        </p>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
        <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-10 md:p-14 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
            Coming soon
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-[#111111]">
            First essay publishes soon.
          </h2>
          <p className="mt-5 text-[#111111]/70 leading-relaxed max-w-xl mx-auto">
            The Content Ecosystem is being primed. One core idea a week,
            written through the methodology, structured for search and AI
            answer engines, and ready for conversation the moment it lands.
          </p>
          <div className="mt-8 max-w-xl mx-auto text-left">
            <SubscribeForm buttonLabel="Get the first one" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PostGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {posts.map((p) => (
            <a
              key={p._id}
              href={`/blog/${p.slug.current}`}
              className="block bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 hover:border-black/30 transition group"
            >
              {p.articleSection && (
                <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-3">
                  {p.articleSection}
                </p>
              )}
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] leading-[1.15]">
                {p.title}
              </h2>
              {p.metaDescription && (
                <p className="mt-4 text-[#111111]/70 leading-relaxed line-clamp-3">
                  {p.metaDescription}
                </p>
              )}
              <p className="mt-6 text-sm text-[#188bf6] font-medium group-hover:underline">
                Read the essay →
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          Want the essays delivered?
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          One short email a week. One idea. No filler.
        </p>
        <div className="mt-8 max-w-xl mx-auto text-left">
          <SubscribeForm buttonLabel="Subscribe" />
        </div>
      </div>
    </section>
  );
}
