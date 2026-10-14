// Assessed-layer rubric definitions. The text here is what the model is
// given, verbatim. Change the markdown rubric and this file together.

import type { Dimension } from "../types";

export type RubricCriterion = {
  id: string;
  weight: number;
  /** "assessed" is scored by the model; "measured" is computed in measured.ts. */
  kind: "assessed" | "measured";
  title: string;
  pass: string;
  partial: string;
  fail: string;
  /** Optional: when this criterion does not apply, the model may return "na" with a reason. */
  naAllowed?: boolean;
};

export type Rubric = { dimension: Dimension; name: string; purpose: string; notScored?: string; criteria: RubricCriterion[] };

export const OFFER_RUBRIC: Rubric = {
  dimension: 1,
  name: "Offer clarity",
  purpose: "Can a stranger say in ten seconds what this business does, for whom, what changes for the buyer, and why this one over the next tab? Or is it the category's stock pitch?",
  criteria: [
    { id: "of-01", weight: 20, kind: "assessed", title: "Ten-second clarity: what, for whom, outcome", pass: "Hero plus opening state the service, the buyer and the change for the buyer, in plain words.", partial: "Two of the three are stated.", fail: "One or none, or the hero is a slogan with no content." },
    { id: "of-02", weight: 15, kind: "assessed", title: "A named mechanism: how it works", pass: "The site explains how the result is produced: a process, steps, a method or a model, described plainly. A coined name alone does not count; the explanation does.", partial: "A process is implied or appears only in passing.", fail: "Outcomes are claimed with no mechanism." },
    { id: "of-03", weight: 20, kind: "assessed", title: "Differentiated from the category's stock pitch", pass: "The pitch could not be lifted onto a competitor's site with the logo swapped. It says something specific about who, how, or what is refused.", partial: "Some specific lines inside generic framing.", fail: "Generic lines any competitor could claim: quality service, tailored solutions, trusted partner, above and beyond, feature lists." },
    { id: "of-04", weight: 15, kind: "assessed", title: "Outcome-led, not feature-led", pass: "Copy leads with what changes for the buyer and follows with what is delivered.", partial: "Mixed.", fail: "Opens with features, deliverables, or the company." },
    { id: "of-05", weight: 10, kind: "measured", title: "One primary next step", pass: "", partial: "", fail: "" },
    { id: "of-06", weight: 10, kind: "assessed", title: "Pricing or how-it-is-priced context", pass: "A figure, a range, or a plain statement of how pricing is scoped together with a value anchor.", partial: "Pricing is mentioned but not answered, for example 'contact us for pricing'.", fail: "Silence on price or how it is priced." },
    { id: "of-07", weight: 10, kind: "assessed", title: "Risk reversal or fit statement", pass: "A guarantee, a defined outcome standard, or an explicit statement of who this is for and not for.", partial: "Fit is implied through scope, price routing or tone.", fail: "None." },
  ],
};

export const COPY_RUBRIC: Rubric = {
  dimension: 2,
  name: "Copy quality",
  purpose: "Regardless of whether the offer is good, is the copy written to best practice? Headline, lead, benefit language, specificity, objections, readability.",
  notScored: "Do not reward or penalise urgency, scarcity, countdowns, FOMO or inevitability framing. They are outside this rubric.",
  criteria: [
    { id: "cq-01", weight: 20, kind: "assessed", title: "Headline passes the 4-U test (useful, unique, relevant now, ultra-specific)", pass: "Three or four of the four.", partial: "Two.", fail: "One or none, or a greeting, a company name alone, or a feature label." },
    { id: "cq-02", weight: 10, kind: "assessed", title: "Lead pays off the headline", pass: "The first sentence after the headline connects directly to its promise.", partial: "Connects within two sentences.", fail: "Throat-clearing, company history, or an unrelated opener." },
    { id: "cq-03", weight: 15, kind: "assessed", title: "Benefit-first language", pass: "Sections open with what the reader gets or stops suffering; features follow.", partial: "Mixed.", fail: "Feature-first, for example 'Our platform includes'." },
    { id: "cq-04", weight: 10, kind: "assessed", title: "Specific, believable, not boring", pass: "No line in the windows is confusing, unbelievable (a claim with no specific) or boring (generic benefit, slow pacing).", partial: "One of the three occurs.", fail: "Two or three occur." },
    { id: "cq-05", weight: 10, kind: "assessed", title: "Objections pre-empted near the CTA", pass: "At least two of price, time or effort, and 'will it work for me' are addressed within one screen of a call to action or in a FAQ near it.", partial: "One.", fail: "None." },
    { id: "cq-06", weight: 10, kind: "measured", title: "Reading grade 5 to 8", pass: "", partial: "", fail: "" },
    { id: "cq-07", weight: 5, kind: "measured", title: "Sentence-length variety", pass: "", partial: "", fail: "" },
    { id: "cq-08", weight: 10, kind: "measured", title: "Low slop density", pass: "", partial: "", fail: "" },
    { id: "cq-09", weight: 5, kind: "measured", title: "CTA copy in the visitor's voice", pass: "", partial: "", fail: "" },
    { id: "cq-10", weight: 5, kind: "assessed", title: "Proof adjacent to the first CTA", pass: "A testimonial, metric or credential sits within one screen of the first call to action.", partial: "Proof exists but far from any call to action.", fail: "None." },
  ],
};

export const TARGET_MARKET_RUBRIC: Rubric = {
  dimension: 3,
  name: "Target market clarity",
  purpose: "Does the site say who it is for, in their situation, before it talks about itself?",
  criteria: [
    { id: "tm-01", weight: 15, kind: "assessed", title: "Audience named in the hero", pass: "The hero names a specific audience by role, industry or situation.", partial: "Audience is named below the fold or only implied.", fail: "'Businesses', 'everyone', 'individuals and companies', or no audience." },
    { id: "tm-02", weight: 10, kind: "assessed", title: "Audience defined by situation, not category", pass: "Defined by what is happening to them, for example 'already generating enquiries and losing them'.", partial: "Category only: small businesses, professionals, SMEs.", fail: "No definition." },
    { id: "tm-03", weight: 15, kind: "assessed", title: "Opening is pain-led, not company-led", pass: "The opening describes the reader's situation, problem or doubt before describing the company.", partial: "Problem named but the company's story arrives within two sentences.", fail: "Opens with 'We are', 'Founded in', 'Our team', 'Welcome to', or a feature list." },
    { id: "tm-04", weight: 10, kind: "measured", title: "You-to-we ratio", pass: "", partial: "", fail: "" },
    { id: "tm-05", weight: 10, kind: "assessed", title: "Voice of customer, not industry vocabulary", pass: "The problem is described in words the buyer would use.", partial: "Plain language in the hero with jargon immediately below, or mixed.", fail: "Feature labels, category jargon, or capitalised framework names in place of the problem." },
    { id: "tm-06", weight: 10, kind: "measured", title: "Buying-stage questions answered", pass: "", partial: "", fail: "" },
    { id: "tm-07", weight: 10, kind: "measured", title: "Audience-specific pages or sections", pass: "", partial: "", fail: "" },
    { id: "tm-08", weight: 10, kind: "assessed", title: "Qualification: who it is for and not for", pass: "An explicit 'not for' or fit statement.", partial: "Fit implied through pricing, tone or scope.", fail: "Nothing. The site wants everyone." },
    { id: "tm-09", weight: 5, kind: "assessed", title: "Audience consistent across pages and metadata", pass: "The same audience across the hero, meta description, schema description and other pages.", partial: "Drift between them.", fail: "Contradiction, or metadata names no audience." },
    { id: "tm-10", weight: 5, kind: "assessed", title: "Proof drawn from the same audience", pass: "Results and testimonials come from the audience the site says it serves.", partial: "Proof exists but from a different buyer type.", fail: "No proof, or proof that contradicts the stated audience.", naAllowed: true },
  ],
};

export const TRUST_RUBRIC: Rubric = {
  dimension: 4,
  name: "Trust and proof",
  purpose: "Is there evidence a real, credible operator is behind this, and is it specific enough to believe? Score proof as specific and attributable (numbers, category, geography, a named person where one exists). A named client is not required. Anonymous praise with no specific is not proof.",
  criteria: [
    { id: "tr-01", weight: 20, kind: "assessed", title: "Testimonials present and attributed", pass: "At least two testimonials or case studies with first name, role, category or location, and a specific result.", partial: "Testimonials exist but are anonymous, initials-only, or praise with no result; or only result statements spoken by the business.", fail: "None." },
    { id: "tr-02", weight: 15, kind: "assessed", title: "Proof is specific", pass: "Proof carries numbers, timeframes or concrete situations.", partial: "Some specifics among round numbers and adjectives.", fail: "'Great results', 'many clients', 'proven', with nothing concrete." },
    { id: "tr-03", weight: 10, kind: "assessed", title: "Proof at the decision point", pass: "A proof element within one screen of the hero call to action and of the final call to action.", partial: "One of the two.", fail: "Proof quarantined in its own section only, or absent." },
    { id: "tr-04", weight: 10, kind: "assessed", title: "Named people with roles", pass: "The founder or team appear with name and role (a photo or Person schema counts as support).", partial: "A name without a role.", fail: "No human on the site." },
    { id: "tr-05", weight: 10, kind: "assessed", title: "Credentials, tenure, track record", pass: "Years in practice, certifications, affiliations, or a quantified track record stated plainly.", partial: "Vague, for example 'experienced team'.", fail: "None." },
    { id: "tr-06", weight: 10, kind: "measured", title: "A contactable, real business", pass: "", partial: "", fail: "" },
    { id: "tr-07", weight: 10, kind: "measured", title: "Third-party hosted proof", pass: "", partial: "", fail: "" },
    { id: "tr-08", weight: 10, kind: "assessed", title: "Statistics are sourced", pass: "Every statistic in the windows has a source named or linked.", partial: "Some sourced.", fail: "Confident numbers with no source.", naAllowed: true },
    { id: "tr-09", weight: 5, kind: "assessed", title: "No fabricated-looking proof", pass: "No stock-looking team imagery presented as clients, no initials-only quotes, no generic five-star widgets without a platform.", partial: "One of these.", fail: "More than one. This is a flag from text and alt text only, not an accusation." },
  ],
};

export const MESSAGE_RUBRICS: Rubric[] = [OFFER_RUBRIC, COPY_RUBRIC, TARGET_MARKET_RUBRIC, TRUST_RUBRIC];
