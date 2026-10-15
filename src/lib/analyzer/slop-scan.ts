// Anti-slop gate for analyzer prose. A TypeScript port of
// ai-marketing-agency/scripts/lib/slop-scan.js (the publish-pipeline gate),
// rules unchanged. That file is the source of truth; keep the lists in sync.
// Blog-only rules (body word count) are off by default here because report
// paragraphs are short by design.
//
// Applied to prose we write (narrative, model judgements, fix and consequence
// sentences). Not applied to quoted site evidence, which is the site's own
// copy and may legitimately contain anything.

export type SlopFinding = { line: number; rule: string; match: string; message: string };
export type SlopResult = { errors: SlopFinding[]; warnings: SlopFinding[] };

const FILLER_QUALIFIERS = ["genuinely", "honestly", "actually", "really", "truly"];
const HONEST_FRAMING = ["honest", "the honest", "to be honest"];
const PERSONIFIED_ADVERBS = ["quietly", "seamlessly", "effortlessly", "silently"];
const AI_TELL_HARD = ["delve", "tapestry", "multifaceted", "resonate", "embark", "foster", "illuminate", "paramount", "pivotal", "holistic", "testament", "meticulous", "intricate", "furthermore", "moreover", "leverage"];
const BANNED_PHRASES_HARD = ["here's the thing", "here is the thing", "let me explain", "the truth is", "at the end of the day", "let that sink in", "sound familiar", "it's worth noting", "it is worth noting", "in today's world", "in an era of", "in essence", "in conclusion", "in summary", "more than ever", "needless to say"];
const AI_TELL_SOFT = ["robust", "comprehensive", "nuanced", "journey", "navigate", "unlock", "empower", "transform", "revolutionize", "skyrocket", "game changer", "game-changer", "cutting-edge", "supercharge", "elevate"];
const DUAL_ADJECTIVE_PAIRS = ["simple and predictable", "safe and secure", "bold and brave", "smart and strategic", "clear and concise", "calm and confident"];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordListRe(words: string[]): RegExp {
  return new RegExp(`\\b(${words.map(escapeRe).join("|")})\\b`, "gi");
}
function phraseListRe(phrases: string[]): RegExp {
  return new RegExp(`(${phrases.map(escapeRe).join("|")})`, "gi");
}
function pushMatches(findings: SlopFinding[], lines: string[], re: RegExp, rule: string, message: string) {
  lines.forEach((text, i) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      findings.push({ line: i + 1, rule, match: m[0], message });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  });
}

export function scanForSlop(text: string, opts: { minWords?: number; maxWords?: number; allowWords?: string[] } = {}): SlopResult {
  const { minWords, maxWords, allowWords = [] } = opts;
  const lines = text.split(/\r?\n/);
  const errors: SlopFinding[] = [];
  const warnings: SlopFinding[] = [];
  const allow = new Set(allowWords.map((w) => w.toLowerCase()));
  const aiHard = AI_TELL_HARD.filter((w) => !allow.has(w.toLowerCase()));

  pushMatches(errors, lines, /[—–]/g, "em-dash", "Em/en dash banned. Use a comma, colon, or full stop.");
  pushMatches(errors, lines, /(?<![-\s])--(?![-])|(?<=\s)--(?=\s)/g, "double-dash", "Double dash banned. Rewrite the sentence.");
  pushMatches(errors, lines, /;/g, "semicolon", "Semicolon banned. Use a period or a comma.");
  pushMatches(errors, lines, wordListRe(FILLER_QUALIFIERS), "filler-qualifier", "Filler qualifier. Cut it; let the sentence carry the weight.");
  pushMatches(errors, lines, wordListRe(HONEST_FRAMING), "honest-framing", "'Honest' framing banned. State it directly.");
  pushMatches(errors, lines, wordListRe(PERSONIFIED_ADVERBS), "personified-adverb", "Personified adverb. Abstractions do not act quietly. Say what happens.");
  if (aiHard.length) pushMatches(errors, lines, wordListRe(aiHard), "ai-tell-word", "AI-tell word. Use a plain, direct word.");
  pushMatches(errors, lines, wordListRe(["most people"]), "most-people", "Use 'many people', not 'most people', unless the majority claim is true and needed.");
  pushMatches(errors, lines, phraseListRe(BANNED_PHRASES_HARD), "banned-phrase", "Banned filler phrase. Delete it or state the thing directly.");

  pushMatches(warnings, lines, wordListRe(AI_TELL_SOFT), "ai-tell-soft", "Often slop. Keep only if a concrete mechanism follows immediately.");
  pushMatches(warnings, lines, phraseListRe(DUAL_ADJECTIVE_PAIRS), "dual-adjective", "Dual-adjective stacking. Pick one strong word.");
  pushMatches(warnings, lines, /\w\s*\.\.\.(?=\s|$)/g, "trailing-ellipsis", "Trailing ellipsis. Do not let a sentence dissolve.");

  const antithesis = text.match(/\b(is|are|was|were)\s+not\b[^.!?]*[.!?]\s+(it|they|that|this)\s+(is|are)\b/gi);
  if (antithesis && antithesis.length > 1) {
    warnings.push({ line: 0, rule: "repeated-antithesis", match: `${antithesis.length}x`, message: "Repeated 'not X. It is Y' antithesis. One accurate distinction is fine; more is a tell." });
  }
  if (minWords !== undefined || maxWords !== undefined) {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if ((minWords !== undefined && wordCount < minWords) || (maxWords !== undefined && wordCount > maxWords)) {
      warnings.push({ line: 0, rule: "word-count", match: `${wordCount} words`, message: `Word count ${wordCount} is outside ${minWords ?? 0}-${maxWords ?? "∞"}.` });
    }
  }
  return { errors, warnings };
}

export function describeSlop(r: SlopResult): string {
  return [...r.errors.map((f) => `"${f.match}" (${f.rule})`), ...r.warnings.map((f) => `"${f.match}" (${f.rule}, advisory)`)].join(", ");
}
