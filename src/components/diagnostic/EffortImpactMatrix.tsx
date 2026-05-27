"use client";

// Effort vs Impact scatter plot for the diagnostic report.
//
// Layout: numbered dots on the chart, with a legend list below mapping
// each number to its label. This avoids label collisions when multiple
// pain points cluster around adjacent (impact, effort) coordinates.
//
//   X-axis: Effort to Fix (1 = easy, 5 = hard)
//   Y-axis: Impact (1 = low, 5 = high)
//   Top-left quadrant ("Fix First") highlighted with a subtle fill.
//   High-impact + low-effort dots in the primary accent colour.
//   All other dots in muted grey.

import {
  CartesianGrid,
  Label,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EffortImpactItem } from "@/lib/diagnostic-prompts";

const PRIMARY = "#188bf6";
const MUTED = "#94a3b8";

type Props = {
  items: EffortImpactItem[];
};

type IndexedItem = EffortImpactItem & { n: number; isPrimary: boolean };
type PositionedItem = IndexedItem & { displayX: number; displayY: number };

// When two or more pain points share identical (impact, effort) scores
// they render in the same pixel and only the last one is visible. This
// spreads colocated items horizontally around their shared coordinate
// so each numbered dot is distinct. Tooltips and the legend still show
// the original scores.
function jitterColocatedDots(items: IndexedItem[]): PositionedItem[] {
  const groups = new Map<string, IndexedItem[]>();
  for (const item of items) {
    const key = `${item.impact}_${item.effort}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  const positioned: PositionedItem[] = [];
  // Spacing of ~0.22 on the effort axis keeps colocated dots inside the
  // visible 1-5 range without crossing into a neighbouring integer.
  const SPACING = 0.22;
  for (const group of groups.values()) {
    if (group.length === 1) {
      const only = group[0];
      positioned.push({
        ...only,
        displayX: only.effort,
        displayY: only.impact,
      });
      continue;
    }
    group.forEach((item, idx) => {
      const offset = (idx - (group.length - 1) / 2) * SPACING;
      positioned.push({
        ...item,
        displayX: item.effort + offset,
        displayY: item.impact,
      });
    });
  }
  // Preserve numeric ordering so the legend matches the dot numbers.
  return positioned.sort((a, b) => a.n - b.n);
}

export default function EffortImpactMatrix({ items }: Props) {
  if (!items || items.length === 0) return null;

  // Assign a stable display number to each item (1, 2, 3, ...). Sort by
  // impact desc, then effort asc, so the most important items get the
  // lowest numbers — the legend reads top-down in priority order.
  const indexed: IndexedItem[] = [...items]
    .sort((a, b) => b.impact - a.impact || a.effort - b.effort)
    .map((item, i) => ({
      ...item,
      n: i + 1,
      isPrimary: item.impact >= 4 && item.effort <= 2,
    }));

  // Jitter dots that share exact (impact, effort) coordinates so all
  // visible. Without this, e.g. two items both at (impact 5, effort 2)
  // render in the same pixel and only the last one is seen.
  const positioned = jitterColocatedDots(indexed);

  const primaryDots = positioned.filter((i) => i.isPrimary);
  const otherDots = positioned.filter((i) => !i.isPrimary);

  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] mb-2">
        Where to Focus
      </h2>
      <p className="text-sm text-[#111111]/65 italic mb-6 max-w-2xl">
        The items in the top-left quadrant have the highest impact and
        require the least structural change to fix.
      </p>
      <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <div className="w-full h-[260px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ScatterChart
              margin={{ top: 16, right: 24, bottom: 32, left: 8 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <ReferenceArea
                x1={0.5}
                x2={2.5}
                y1={3.5}
                y2={5.5}
                fill={PRIMARY}
                fillOpacity={0.08}
                stroke={PRIMARY}
                strokeOpacity={0.18}
                strokeDasharray="3 3"
                ifOverflow="visible"
              >
                <Label
                  value="Fix First"
                  position="insideTopLeft"
                  fill={PRIMARY}
                  fontSize={11}
                  offset={6}
                />
              </ReferenceArea>
              <XAxis
                type="number"
                dataKey="x"
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: "#64748b" }}
              >
                <Label
                  value="Effort to Fix"
                  position="bottom"
                  offset={12}
                  style={{ fontSize: 11, fill: "#64748b" }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: "#64748b" }}
              >
                <Label
                  value="Impact"
                  angle={-90}
                  position="left"
                  offset={-4}
                  style={{ fontSize: 11, fill: "#64748b" }}
                />
              </YAxis>
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<MatrixTooltip />}
              />
              {otherDots.length > 0 && (
                <Scatter
                  data={otherDots.map((i) => ({
                    x: i.displayX,
                    y: i.displayY,
                    label: i.label,
                    n: i.n,
                    effort: i.effort,
                    impact: i.impact,
                  }))}
                  shape={(props: ScatterShapeProps) => (
                    <NumberedDot {...props} fill={MUTED} />
                  )}
                />
              )}
              {primaryDots.length > 0 && (
                <Scatter
                  data={primaryDots.map((i) => ({
                    x: i.displayX,
                    y: i.displayY,
                    label: i.label,
                    n: i.n,
                    effort: i.effort,
                    impact: i.impact,
                  }))}
                  shape={(props: ScatterShapeProps) => (
                    <NumberedDot {...props} fill={PRIMARY} />
                  )}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-none p-0">
          {indexed.map((item) => (
            <li
              key={item.n}
              className="flex items-start gap-2.5 text-sm text-[#111111]/85"
            >
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                style={{ background: item.isPrimary ? PRIMARY : MUTED }}
              >
                {item.n}
              </span>
              <span className="leading-snug">
                <span className="font-medium">{item.label}</span>
                <span className="text-[#111111]/50 text-xs ml-1.5">
                  impact {item.impact} &middot; effort {item.effort}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Recharts passes per-point geometry (cx, cy) plus the data object back
// to a custom shape. We render an SVG circle with the dot's number
// centred inside it. No external label — the legend below carries the
// readable text.
type ScatterShapeProps = {
  cx?: number;
  cy?: number;
  payload?: { label?: string; n?: number };
  fill?: string;
};

function NumberedDot({ cx, cy, payload, fill }: ScatterShapeProps) {
  if (cx == null || cy == null) return null;
  const n = payload?.n ?? "";
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill={fill} fillOpacity={0.95} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="#ffffff"
        style={{ pointerEvents: "none" }}
      >
        {n}
      </text>
    </g>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: {
      label?: string;
      // x/y are the jittered display coords; effort/impact are the
      // original scores. Tooltips read from the originals so users
      // see the real numbers, not "Effort 1.78".
      x?: number;
      y?: number;
      effort?: number;
      impact?: number;
    };
  }>;
};

function MatrixTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-md bg-[#0a0f1e] text-white text-xs px-3 py-2 shadow-lg">
      <div className="font-semibold mb-1">{d.label}</div>
      <div className="text-white/70">
        Impact {d.impact ?? d.y} &middot; Effort {d.effort ?? d.x}
      </div>
    </div>
  );
}
