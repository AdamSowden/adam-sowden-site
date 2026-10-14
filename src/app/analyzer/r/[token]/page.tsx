// The full report. Reached from the emailed link only (unguessable token),
// noindex. Structure per site-analyser-spec.md §8: headline finding, what was
// checked, findings grouped with evidence, cost of loss with the working
// shown, the three fixes, what it looks like fixed, one CTA. The benchmark
// comparison lives here and nowhere public (framework §0 decision 3).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { getStore } from "@/lib/analyzer/store";
import { deliverReport } from "@/lib/analyzer/job";
import type { Report, ReportDimension } from "@/lib/analyzer/report";
import type { StatusCounts } from "@/lib/analyzer/scoring";
import { BOOKING_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your site report — Smart Site Analyzer",
  robots: { index: false, follow: false },
};

const STATUS_WORD: Record<string, string> = { pass: "Passed", partial: "Partial", fail: "Failed", uncertain: "Could not confirm", na: "Not checked" };

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) notFound();
  const store = getStore();
  let job = await store.getJob(token);
  if (!job) notFound();
  if (!job.report && (job.state === "done" || job.state === "partial")) job = await deliverReport(job, store);
  const report = job.report;

  return (
    <>
      <SiteNav />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 pt-14 pb-24 md:pt-20">
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">Smart Site Analyzer, full report</p>
          {!report ? (
            <Pending state={job.state} host={job.host} error={job.error} />
          ) : (
            <ReportBody report={report} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Pending({ state, host, error }: { state: string; host: string; error: string | null }) {
  return (
    <section>
      <h1 className="font-serif text-4xl tracking-tight text-[#111111]">{state === "failed" ? `We could not analyse ${host}.` : `The report for ${host} is still being prepared.`}</h1>
      <p className="mt-4 text-[#111111]/75">{state === "failed" ? error ?? "The homepage could not be fetched." : "The remaining checks are running. Refresh this page in a minute."}</p>
    </section>
  );
}

function ReportBody({ report }: { report: Report }) {
  return (
    <article>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[#111111]">
        {report.host}: {report.band}
      </h1>
      <p className="mt-4 text-lg text-[#111111]/80">{report.bandMeaning}</p>
      {report.preliminary && <p className="mt-3 text-sm text-[#188bf6]">Some checks were still running when this was generated. The latest version is at this same link.</p>}

      <p className="mt-8 text-lg leading-relaxed text-[#111111]">{report.narrative.opening}</p>

      {report.headline && (
        <section className="mt-10 rounded-2xl border border-black/10 p-6 md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">The finding that matters most</p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl tracking-tight leading-[1.15] text-[#111111]">{report.headline.statement}</h2>
          <p className="mt-3 text-[#111111]/80">{report.headline.consequence}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">What was checked</h2>
        <p className="mt-2 text-[#111111]/80">
          {report.pagesChecked} page{report.pagesChecked === 1 ? "" : "s"} read from the public site. {report.checksRun} checks ran across the areas below.
          {report.checksCouldNotRun.length ? ` ${report.checksCouldNotRun.length} could not run; they are listed at the end.` : ""}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight text-[#111111]">The three things to fix, in order</h2>
        <ol className="mt-6 space-y-5">
          {report.fixes.map((f) => (
            <li key={f.order} className="rounded-2xl bg-[#F9FAFB] border border-black/10 p-5 md:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/50">{f.order}. {f.dimensionLabel}</p>
              <p className="mt-2 text-lg text-[#111111] font-medium">{f.fix}</p>
              <p className="mt-2 text-[#111111]/70">{f.consequence}</p>
              <p className="mt-2 text-sm text-black/55">Found: {f.evidence}</p>
            </li>
          ))}
        </ol>
      </section>

      {report.cost && <CostSection cost={report.cost} />}

      {report.pillars.map((p) => (
        <section key={p.pillar} className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-[#111111]">{p.label}</h2>
          <p className="mt-3 text-[#111111]/80 leading-relaxed">{report.narrative.pillars[p.pillar]}</p>
          {p.dimensions.map((d) => (
            <DimensionBlock key={d.dimension} d={d} benchmarkHost={report.benchmark?.host ?? null} />
          ))}
        </section>
      ))}

      {report.checksCouldNotRun.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">Checks that could not run</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-black/65">
            {report.checksCouldNotRun.map((c, i) => (
              <li key={`${c.scope}-${i}`}>{c.reason}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14 rounded-2xl border border-black/10 p-6 md:p-8">
        <h2 className="font-serif text-2xl tracking-tight text-[#111111]">What it looks like fixed</h2>
        <p className="mt-3 text-[#111111]/80 leading-relaxed">{report.narrative.fixed}</p>
      </section>

      <section className="mt-14 rounded-2xl bg-[#111111] text-white p-6 md:p-10">
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Talk it through.</h2>
        <p className="mt-3 text-white/75">Twenty minutes on what it would take to fix the three things above. No pitch.</p>
        <div className="mt-6">
          <CTAButton href={BOOKING_URL} variant="light" size="lg">Book a Quick Chat</CTAButton>
        </div>
      </section>
    </article>
  );
}

function countsText(c: StatusCounts): string {
  return `${c.pass} passed, ${c.partial + c.uncertain} partial, ${c.fail} failed`;
}

function DimensionBlock({ d, benchmarkHost }: { d: ReportDimension; benchmarkHost: string | null }) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/10 pb-2">
        <h3 className="text-lg font-medium text-[#111111]">{d.label}</h3>
        <p className="text-sm text-black/55">{d.measured ? countsText(d.counts) : "not measured"}</p>
      </div>
      {d.benchmark && benchmarkHost && (
        <p className="mt-2 text-xs text-black/50">What a smart site returns on the same checks: {countsText(d.benchmark)}.</p>
      )}
      <ul className="mt-3 divide-y divide-black/5">
        {d.findings.map((f) => (
          <li key={f.criterionId} className="py-3">
            <div className="flex items-baseline gap-3">
              <span className={`text-xs font-medium uppercase tracking-[0.12em] whitespace-nowrap ${f.status === "fail" ? "text-[#b42318]" : f.status === "pass" ? "text-[#0d9488]" : "text-black/50"}`}>{STATUS_WORD[f.status]}</span>
              <span className="text-[15px] text-[#111111]">{f.title}</span>
              {f.layer === "assessed" && <span className="text-[11px] text-black/40 uppercase tracking-[0.1em]">assessed</span>}
            </div>
            <p className="mt-1 text-sm text-[#111111]/70">{f.note ? `${f.note} ` : ""}{f.evidence}</p>
            {f.fix && <p className="mt-1 text-sm text-[#111111]">Fix: {f.fix}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostSection({ cost }: { cost: NonNullable<Report["cost"]> }) {
  const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return (
    <section className="mt-12 rounded-2xl bg-[#F9FAFB] border border-black/10 p-6 md:p-8">
      <h2 className="font-serif text-2xl tracking-tight text-[#111111]">What the response gaps are costing</h2>
      {cost.applies ? (
        <>
          <p className="mt-3 text-xl text-[#111111]">Roughly {money(cost.lowMonthly)} to {money(cost.highMonthly)} {cost.period}.</p>
          <p className="mt-2 text-sm text-black/60">{cost.reason}</p>
          <ol className="mt-4 space-y-1.5 text-sm text-[#111111]/80 list-decimal pl-5">
            {cost.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </>
      ) : (
        <p className="mt-3 text-[#111111]/80">{cost.reason}</p>
      )}
      <ul className="mt-4 space-y-1 text-xs text-black/55">
        {cost.assumptions.map((a, i) => <li key={i}>{a}</li>)}
        {cost.sources.map((s, i) => <li key={`s${i}`}>Source: {s}</li>)}
      </ul>
    </section>
  );
}
