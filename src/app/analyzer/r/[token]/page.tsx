// The full report. Reached from the emailed link only (unguessable token),
// noindex. Structure (report decision, 15 Oct 2026): diagnosis, the five jobs
// with a verdict each, cost of loss with the working collapsed, the three
// moves, what it looks like fixed, one CTA, and every finding with its
// evidence in a collapsed appendix. The benchmark comparison lives in the
// appendix and nowhere public (framework §0 decision 3). No scores anywhere.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import TrackedCta from "@/components/TrackedCta";
import { getStore } from "@/lib/analyzer/store";
import { deliverReport } from "@/lib/analyzer/job";
import type { Report, ReportArea, ReportJob } from "@/lib/analyzer/report";
import { bandLabelFor, type Band, type StatusCounts } from "@/lib/analyzer/scoring";
import { BOOKING_URL, BOOKING_CTA_LABEL } from "@/lib/site";

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
          {!report ? <Pending state={job.state} host={job.host} error={job.error} /> : <ReportBody report={report} />}
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

function countsText(c: StatusCounts): string {
  return `${c.pass} passed, ${c.partial + c.uncertain} partial, ${c.fail} failed`;
}

function pagesText(report: Report): string {
  const n = report.pagesChecked;
  const pages = `${n} page${n === 1 ? "" : "s"}`;
  const dup = report.pagesDuplicate ? ` (${report.pagesDuplicate} duplicate${report.pagesDuplicate === 1 ? "" : "s"})` : "";
  const could = report.checksCouldNotRun.length ? ` and ${report.checksCouldNotRun.length} could not` : "";
  return `${pages} read${dup}. ${report.checksRun} checks ran${could}.`;
}

function ReportBody({ report }: { report: Report }) {
  const jobs = report.jobs.filter((j) => j.job !== "foundation");
  const foundation = report.jobs.find((j) => j.job === "foundation");
  return (
    <article>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[#111111]">
        {report.host} is {bandLabelFor(report.band as Band, report.moves.length > 0)}.
      </h1>
      <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#111111]">{report.narrative.diagnosis}</p>
      <p className="mt-4 text-sm text-black/55">{pagesText(report)}</p>
      {report.preliminary && <p className="mt-3 text-sm text-[#188bf6]">Some checks were still running when this was generated. The latest version is at this same link.</p>}

      <section className="mt-14">
        <h2 className="font-serif text-3xl tracking-tight text-[#111111]">What the site does on the five jobs</h2>
        <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {jobs.map((j) => <JobBlock key={j.job} j={j} />)}
        </div>
      </section>

      {report.cost && <CostSection cost={report.cost} />}

      {report.moves.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-[#111111]">Where to start</h2>
          <ol className="mt-6 space-y-5">
            {report.moves.map((m) => (
              <li key={m.order} className="rounded-2xl bg-[#F9FAFB] border border-black/10 p-5 md:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/50">{m.order}. {m.jobLabel}</p>
                <p className="mt-2 text-lg text-[#111111] font-medium">{m.move}</p>
                <p className="mt-2 text-[#111111]/70">{m.consequence}</p>
                <p className="mt-2 text-sm text-black/55">Found: {m.evidence}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-14 rounded-2xl border border-black/10 p-6 md:p-8">
        <h2 className="font-serif text-2xl tracking-tight text-[#111111]">What it looks like fixed</h2>
        <p className="mt-3 text-[#111111]/80 leading-relaxed">{report.narrative.fixed}</p>
      </section>

      <section className="mt-14 rounded-2xl bg-[#111111] text-white p-6 md:p-10">
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Turn this site into a smart site.</h2>
        <p className="mt-3 text-white/75 leading-relaxed">
          A smart site is your current site, moved onto a build that does the five jobs on its own. The pages and addresses Google already ranks come across with it. Whatever was holding the site back gets cleaned up on the way, and nothing is thrown away. It stops being a business card on the internet and starts working as a sales asset.
        </p>
        <p className="mt-3 text-white/75 leading-relaxed">
          There&apos;s less to it than a redesign, because the content stays and only the build changes. The call is twenty minutes. We pick the one visitor path most worth fixing first and work out whether there is a practical fit to build it together.
        </p>
        <div className="mt-6">
          <TrackedCta event="analyzer_book_click" data={{ host: report.host, band: report.band }}>
            <CTAButton href={`${BOOKING_URL}?src=analyzer`} variant="light" size="lg">{BOOKING_CTA_LABEL}</CTAButton>
          </TrackedCta>
        </div>
        <p className="mt-4 text-sm text-white/60">No generic website pitch, no obligation. If a smart site isn&apos;t the right next move, I&apos;ll tell you directly.</p>
      </section>

      <details className="mt-14 group">
        <summary className="cursor-pointer list-none">
          <span className="font-serif text-2xl tracking-tight text-[#111111] underline decoration-black/20 underline-offset-4 group-open:no-underline">Every check, with the evidence</span>
          <span className="ml-3 text-sm text-black/55">{report.checksRun} checks across the five jobs and the build it stands on</span>
        </summary>
        <div className="mt-6">
          {report.benchmark && <p className="text-sm text-black/55">Where a line says what a smart site returns, it is the same checks run on {report.benchmark.host}.</p>}
          {jobs.map((j) => <AppendixJob key={j.job} j={j} />)}
          {foundation && <AppendixJob j={foundation} />}
          {report.checksCouldNotRun.length > 0 && (
            <section className="mt-12">
              <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">Checks that could not run</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-black/65">
                {report.checksCouldNotRun.map((c, i) => <li key={`${c.scope}-${i}`}>{c.reason}</li>)}
              </ul>
            </section>
          )}
        </div>
      </details>
    </article>
  );
}

function JobBlock({ j }: { j: ReportJob }) {
  return (
    <div className="py-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-serif text-2xl tracking-tight text-[#111111]">
          {j.label}. <span className={j.verdict === "Working" ? "text-[#0d9488]" : j.verdict === "Not yet" ? "text-[#b42318]" : "text-black/60"}>{j.measured ? j.verdict : "Could not measure"}</span>
        </h3>
        {j.measured && <p className="text-sm text-black/55">{countsText(j.counts)}</p>}
      </div>
      {j.question && <p className="mt-1 text-sm text-black/50">{j.question}</p>}
      <p className="mt-4 text-[#111111]/85 leading-relaxed">{j.narrative}</p>
      {j.smartSiteLine && <p className="mt-3 text-[15px] text-[#188bf6] leading-relaxed">{j.smartSiteLine}</p>}
    </div>
  );
}

function AppendixJob({ j }: { j: ReportJob }) {
  return (
    <section className="mt-12">
      <h3 className="font-serif text-2xl tracking-tight text-[#111111]">{j.label}</h3>
      {j.areas.map((a) => <AreaBlock key={a.dimension} a={a} />)}
    </section>
  );
}

function AreaBlock({ a }: { a: ReportArea }) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/10 pb-2">
        <h4 className="text-lg font-medium text-[#111111]">{a.label}</h4>
        <p className="text-sm text-black/55">{a.measured ? countsText(a.counts) : "not measured"}</p>
      </div>
      {a.benchmark && <p className="mt-2 text-xs text-black/50">What a smart site returns on the same checks: {countsText(a.benchmark)}.</p>}
      <ul className="mt-3 divide-y divide-black/5">
        {a.findings.map((f) => (
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
    <section className="mt-14 rounded-2xl bg-[#F9FAFB] border border-black/10 p-6 md:p-8">
      <h2 className="font-serif text-2xl tracking-tight text-[#111111]">What this is costing</h2>
      {cost.applies ? (
        <>
          <p className="mt-3 text-xl text-[#111111]">Roughly {money(cost.lowMonthly)} to {money(cost.highMonthly)} {cost.period === "per month" ? "a month" : cost.period}.</p>
          <p className="mt-2 text-sm text-black/60">{cost.reason} Only your own numbers are used.</p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-[#188bf6]">Show the working</summary>
            <ol className="mt-3 space-y-1.5 text-sm text-[#111111]/80 list-decimal pl-5">
              {cost.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <ul className="mt-4 space-y-1 text-xs text-black/55">
              {cost.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              {cost.sources.map((s, i) => <li key={`s${i}`}>Source: {s}</li>)}
            </ul>
          </details>
        </>
      ) : (
        <p className="mt-3 text-[#111111]/80">{cost.reason}</p>
      )}
    </section>
  );
}
