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
  purpose: "Can a cautious, intelligent prospect understand who the offer is for, what changes for them, why this offer could help, and why it matters now? Or is it the category's stock pitch? Assess the primary proposition: the hero plus the first two substantive sections.",
  criteria: [
    { id: "of-11", weight: 25, kind: "assessed", title: "Transformation clarity: current situation, desired outcome, change enabled", pass: "All three are explicit in the primary proposition, each specific enough for the stated audience to recognise whether it applies to them, and the link between the offer and the outcome is logical rather than a leap from a service label to a promise. A branded methodology is not required; a plain explanation of why the offer is relevant to the outcome is. Do not award pass for outcome words alone (growth, confidence, freedom, clarity, results) unless the page defines them for this buyer.", partial: "Two of the three are explicit and the third only implied; or all three appear but one is materially generic (grow your business, get better results, save time); or the outcome is clear but the connection to the offer is not; or the elements appear only after the first two sections.", fail: "Only a category, company description, slogan, feature list or broad aspiration; one or none of the three elements visible; the outcome is disconnected from the offer or needs outside knowledge; the opening is company history or values without a buyer change." },
    { id: "of-12", weight: 15, kind: "assessed", title: "Concrete stakes and value of action", pass: "At least one material, buyer-specific consequence of leaving the problem unresolved, and at least one specific, relevant payoff of resolving it, both tied to the buyer's situation. Any figure, cost, time claim or comparison used as evidence is sourced, scoped, or clearly marked as illustrative. Impacts may be financial, operational, time, emotional, reputational, compliance or opportunity. A premium or aspirational offer may state the concrete value of a gain instead of a severe problem; the standard is decision relevance, not negativity.", partial: "The consequence is concrete but the payoff generic, or the reverse; both mentioned but weakly tied to this buyer; specificity only in a distant section; or relevant figures whose scope or source is unclear.", fail: "The problem is described only vaguely (business is hard, time is valuable, you need better results); a generic benefit with no reason it matters; the only specificity is an unsupported number; no meaningful reason to act." },
    { id: "of-03", weight: 20, kind: "assessed", title: "Differentiated from the category's stock pitch", pass: "The pitch could not be lifted onto a competitor's site with the logo swapped. It says something specific about who, how, or what is refused.", partial: "Some specific lines inside generic framing.", fail: "Generic lines any competitor could claim: quality service, tailored solutions, trusted partner, above and beyond, feature lists." },
    { id: "of-05", weight: 10, kind: "measured", title: "One primary next step", pass: "", partial: "", fail: "" },
    { id: "of-06", weight: 15, kind: "assessed", title: "Pricing or how-it-is-priced context", pass: "A figure, a range, or a plain statement of how pricing is scoped together with a value anchor.", partial: "Pricing is mentioned but not answered, for example 'contact us for pricing'.", fail: "Silence on price or how it is priced." },
    { id: "of-07", weight: 15, kind: "assessed", title: "Risk reversal or fit statement", pass: "A guarantee, a defined outcome standard, or an explicit statement of who this is for and not for.", partial: "Fit is implied through scope, price routing or tone.", fail: "None." },
  ],
};

export const COPY_RUBRIC: Rubric = {
  dimension: 2,
  name: "Copy quality",
  purpose: "Does the writing help an intelligent but cautious prospect understand the problem, see the value of solving it, believe the promised change, and continue to the next step? This is about the craft of the copy; the substance of the offer is scored separately.",
  notScored: "Do not reward or penalise urgency, scarcity, countdowns, FOMO or inevitability framing. Do not penalise specialist language solely because it is specialist; penalise it only when unsuitable for the stated audience, unexplained where explanation is needed, or used to conceal a vague proposition.",
  criteria: [
    { id: "cq-01", weight: 15, kind: "assessed", title: "Headline passes the 4-U test (useful, unique, relevant now, ultra-specific)", pass: "Three or four of the four.", partial: "Two.", fail: "One or none, or a greeting, a company name alone, or a feature label." },
    { id: "cq-14", weight: 12, kind: "assessed", title: "Opening-line momentum", pass: "Within the opening (H1 plus the first 75 visible words): relevance to the intended reader is immediate; at least one effective device is used (a direct challenge, a specific result, a recognisable situation, a scene, a credible tension, a candid admission, or a supported surprising fact); it adds information or tension beyond repeating the headline; no greeting, generic framing or company-first introduction before the reader's situation. A calm opening can pass. The standard is relevance and forward movement, not drama.", partial: "Relevant but broadly phrased or predictable; reader-focused only in the second paragraph; repeats the headline before adding anything; company-first but reaches a buyer-relevant situation within the 75 words.", fail: "Begins with a greeting, company history, self-congratulation, a generic industry observation, or a broad claim; relies on empty setups like 'in today's fast-paced world' or 'we are passionate about'; unrelated to the headline; a reader cannot tell why it matters to them within the opening." },
    { id: "cq-13", weight: 20, kind: "assessed", title: "Benefit depth and outcome chain", pass: "For the three most prominent offer claims in the primary proposition, at least two complete the chain: capability or feature or process, to immediate practical benefit, to a meaningful buyer outcome (revenue, cost, time, risk, confidence, capacity, speed, quality of decision, relief). The chain is clear without the reader inferring the final implication. A claim may begin at any point in the chain. A feature list followed by a broad line like 'so you can grow faster' is not a complete chain.", partial: "One claim completes the chain and the rest stop at features or surface benefits; most claims reach a practical benefit but not the meaningful implication; an attractive final outcome is named but the pathway from the offer is unclear; the chain exists only in a secondary section.", fail: "The primary proposition is dominated by deliverables, capabilities, specifications, process or company activity without buyer impact; generic outcome promises with no practical explanation; the reader must do the 'so what' reasoning themselves." },
    { id: "cq-15", weight: 15, kind: "assessed", title: "Clear, credible voice for a sceptical buyer", pass: "Across the primary proposition and its material sections (hero, first substantive section, principal explanation, proof, primary CTA): the language is direct and understandable for the stated audience; necessary technical terms are familiar to that buyer or explained in context; material claims are bounded, evidenced, qualified, or clearly framed as aspiration, opinion or promise; no empty abstractions, unqualified superlatives, excessive jargon or corporate filler; the reader can separate what the business does, what it claims, what evidence it offers, and what result may reasonably be expected.", partial: "The main proposition is clear but one material section carries unnecessary jargon, vague abstractions, inflated language or poorly qualified claims; the technical language suits the audience but gives a newer buyer too little context; one prominent generic or exaggerated claim (industry-leading, world-class, revolutionary) without support; the reader cannot readily separate evidence from promotional assertion.", fail: "The hero is materially unclear, jargon-heavy, abstract, or dependent on unexplained internal terms; two or more material sections rely on vague corporate language, hype, unsupported absolutes or empty promotional phrases; claims repeatedly made without defining what they mean, who they apply to, or what supports them; a reasonably intelligent prospect could not explain the offer without translating it into plain terms." },
    { id: "cq-05", weight: 12, kind: "assessed", title: "Objections pre-empted near the CTA", pass: "At least two of price, time or effort, and 'will it work for me' are addressed within one screen of a call to action or in a FAQ near it.", partial: "One.", fail: "None." },
    { id: "cq-10", weight: 8, kind: "assessed", title: "Proof adjacent to the first CTA", pass: "A testimonial, metric or credential sits within one screen of the first call to action.", partial: "Proof exists but far from any call to action.", fail: "None." },
    { id: "cq-06", weight: 8, kind: "measured", title: "Reading grade 5 to 8", pass: "", partial: "", fail: "" },
    { id: "cq-07", weight: 5, kind: "measured", title: "Sentence-length variety (diagnostic)", pass: "", partial: "", fail: "" },
    { id: "cq-08", weight: 5, kind: "measured", title: "Filler and vague-language density (diagnostic)", pass: "", partial: "", fail: "" },
  ],
};

export const TARGET_MARKET_RUBRIC: Rubric = {
  dimension: 3,
  name: "Target market clarity",
  purpose: "Does the site say who it is for, in their situation, and does it tell them whether they fit?",
  criteria: [
    { id: "tm-01", weight: 15, kind: "assessed", title: "Audience named in the hero", pass: "The hero names a specific audience by role, industry or situation.", partial: "Audience is named below the fold or only implied.", fail: "'Businesses', 'everyone', 'individuals and companies', or no audience." },
    { id: "tm-02", weight: 15, kind: "assessed", title: "Audience defined by situation, not category", pass: "Defined by what is happening to them, for example 'already generating enquiries and losing them'.", partial: "Category only: small businesses, professionals, SMEs.", fail: "No definition." },
    { id: "tm-03", weight: 15, kind: "assessed", title: "The opening addresses the audience", pass: "Within the opening (H1 plus the first 75 words) the reader is addressed as the intended buyer: their role, situation or problem is named before the company is described.", partial: "The audience is addressed within the opening but after the company is introduced, or only implicitly.", fail: "The opening does not address any particular reader." },
    { id: "tm-04", weight: 10, kind: "measured", title: "You-to-we ratio", pass: "", partial: "", fail: "" },
    { id: "tm-06", weight: 10, kind: "measured", title: "Buying-stage questions answered", pass: "", partial: "", fail: "" },
    { id: "tm-07", weight: 10, kind: "measured", title: "Audience-specific pages or sections", pass: "", partial: "", fail: "" },
    { id: "tm-08", weight: 15, kind: "assessed", title: "Qualification: who it is for and not for", pass: "An explicit 'not for' or fit statement.", partial: "Fit implied through pricing, tone or scope.", fail: "Nothing. The site wants everyone." },
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
