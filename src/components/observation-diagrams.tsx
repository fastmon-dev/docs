// Inline SVG diagrams for the Observations page: when a shift, a trend, and
// an outage open and end. One component per diagram, labels in both
// languages, colors from the fumadocs theme tokens so both modes read well.

type Lang = "en" | "de";

const TEXT = "currentColor";
const MUTED = "var(--color-fd-muted-foreground)";
const BORDER = "var(--color-fd-border)";
const WORSE = "#e5484d";
const OPEN_FILL = "rgba(229, 72, 77, 0.55)";
const BAR = "rgba(120, 120, 130, 0.35)";
const FONT = 12;

function Frame({
  title,
  viewBox,
  children,
}: {
  title: string;
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-6">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={title}
        className="h-auto w-full max-w-[720px]"
        style={{ fontFamily: "inherit", fontSize: FONT }}
      >
        <title>{title}</title>
        {children}
      </svg>
    </figure>
  );
}

function Dashed({ y, x1, x2, label }: { y: number; x1: number; x2: number; label: string }) {
  return (
    <g>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={MUTED} strokeDasharray="4 4" strokeWidth={1} />
      <text x={x2 + 6} y={y + 4} fill={MUTED}>
        {label}
      </text>
    </g>
  );
}

type PanelProps = {
  offsetY: number;
  values: number[];
  openFrom: number;
  openLen: number;
  endAt: number;
  threshold: number;
  labels: {
    way: string;
    written: string;
    threshold: string;
    x15: string;
    usual: string;
    start: string;
    ends: string;
  };
};

/** One way a shift opens: the bars of its quarter hours, the usual value,
 *  the opening threshold and the 1.5 times line it ends under. */
function ShiftPanel({ offsetY, values, openFrom, openLen, endAt, threshold, labels }: PanelProps) {
  const left = 40;
  const right = 580;
  const base = offsetY + 170;
  const step = (right - left) / values.length;
  const barW = step * 0.6;
  const y = (v: number) => base - v * 30;
  const xOf = (i: number) => left + i * step + (step - barW) / 2;
  const lastOpen = openFrom + openLen - 1;
  const top = offsetY + 14;

  return (
    <g>
      <text x={left} y={top} fill={TEXT} fontWeight={600}>
        {labels.way}
      </text>
      <text x={left} y={top + 17} fill={MUTED}>
        {labels.written}
      </text>

      <Dashed y={y(threshold)} x1={left} x2={right} label={labels.threshold} />
      <Dashed y={y(1.5)} x1={left} x2={right} label={labels.x15} />
      <Dashed y={y(1)} x1={left} x2={right} label={labels.usual} />
      {values.map((v, i) => {
        const inOpening = i >= openFrom && i <= lastOpen;
        const inShift = i > lastOpen && i < endAt;
        const fill = inOpening ? WORSE : inShift ? OPEN_FILL : BAR;
        return (
          <rect key={i} x={xOf(i)} y={y(v)} width={barW} height={base - y(v)} fill={fill} rx={2} />
        );
      })}
      <line x1={left} x2={right} y1={base} y2={base} stroke={BORDER} />

      {/* opening bracket */}
      <line
        x1={xOf(openFrom)}
        x2={xOf(lastOpen) + barW}
        y1={top + 30}
        y2={top + 30}
        stroke={WORSE}
        strokeWidth={1.5}
      />
      <text
        x={xOf(openFrom) - 4}
        y={y(threshold) - 6}
        fill={WORSE}
        textAnchor="end"
        fontWeight={600}
      >
        {labels.start}
      </text>

      {/* end marker */}
      <line
        x1={xOf(endAt) + barW / 2}
        x2={xOf(endAt) + barW / 2}
        y1={y(1.5) - 24}
        y2={y(values[endAt]) - 4}
        stroke={TEXT}
        strokeWidth={1}
      />
      <text
        x={xOf(endAt) + barW / 2}
        y={y(1.5) - 30}
        fill={TEXT}
        textAnchor="middle"
        fontWeight={600}
      >
        {labels.ends}
      </text>
    </g>
  );
}

/** A shift: it opens in one of two ways, two quarter hours over 3 times the
 *  usual value or eight over twice, and ends under 1.5 times either way. */
export function ShiftDiagram({ lang = "en" }: { lang?: Lang }) {
  const L =
    lang === "de"
      ? {
          title:
            "Ablauf eines Shifts: öffnet nach 2 Viertelstunden über dem Dreifachen oder 8 über dem Doppelten, endet unter dem 1,5-Fachen",
          usual: "üblich",
          x3: "3× üblich",
          x2: "2× üblich",
          x15: "1,5× üblich",
          start: "Beginn",
          way1: "Weg 1: 2 Viertelstunden in Folge über 3× (oder unter 1/3)",
          written1: "sichtbar nach der 2. Viertelstunde",
          way2: "Weg 2: 8 Viertelstunden in Folge über 2×, nur bei Verschlechterung",
          written2: "sichtbar nach der 8. Viertelstunde, 2 Stunden",
          ends: "endet: zurück unter 1,5×",
          axis: "Viertelstunden, verglichen mit derselben Viertelstunde der 7 Tage davor",
        }
      : {
          title:
            "Life of a shift: opens after 2 quarter hours above 3 times the usual value or 8 above twice, ends under 1.5 times",
          usual: "usual",
          x3: "3× usual",
          x2: "2× usual",
          x15: "1.5× usual",
          start: "start",
          way1: "Way 1: 2 quarter hours in a row over 3× (or under 1/3)",
          written1: "visible after the 2nd quarter hour",
          way2: "Way 2: 8 quarter hours in a row over 2×, degradations only",
          written2: "visible after the 8th quarter hour, 2 hours",
          ends: "ends: back under 1.5×",
          axis: "quarter hours, compared with the same quarter hour on the 7 days before",
        };

  const factor = [1.0, 0.9, 1.1, 1.0, 3.4, 3.8, 3.1, 2.2, 1.7, 1.2, 1.0, 1.1, 0.9, 1.0];
  const sustained = [1.0, 1.1, 0.9, 2.3, 2.6, 2.4, 2.7, 2.5, 2.2, 2.6, 2.4, 1.9, 1.3, 1.0];

  return (
    <Frame title={L.title} viewBox="0 0 700 420">
      <ShiftPanel
        offsetY={0}
        values={factor}
        openFrom={4}
        openLen={2}
        endAt={9}
        threshold={3}
        labels={{
          way: L.way1,
          written: L.written1,
          threshold: L.x3,
          x15: L.x15,
          usual: L.usual,
          start: L.start,
          ends: L.ends,
        }}
      />
      <ShiftPanel
        offsetY={200}
        values={sustained}
        openFrom={3}
        openLen={8}
        endAt={12}
        threshold={2}
        labels={{
          way: L.way2,
          written: L.written2,
          threshold: L.x2,
          x15: L.x15,
          usual: L.usual,
          start: L.start,
          ends: L.ends,
        }}
      />
      <text x={310} y={408} fill={MUTED} textAnchor="middle">
        {L.axis}
      </text>
    </Frame>
  );
}

/** A trend: the last 7 days against the 14 days before, judged once a day. */
export function TrendDiagram({ lang = "en" }: { lang?: Lang }) {
  const L =
    lang === "de"
      ? {
          title:
            "Ablauf eines Trends: öffnet, wenn die letzten 7 Tage das 1,3-Fache der 14 Tage davor erreichen, endet unter dem 1,1-Fachen",
          reference: "Referenz: die 14 Tage davor, eingefroren beim Öffnen",
          week: "die letzten 7 Tage",
          ref: "Referenz",
          x13: "1,3× öffnet",
          x11: "1,1× endet",
          axis: "ganze Tage (UTC), einmal pro Nacht beurteilt",
          share: "Anteil langsamer Seitenaufrufe",
        }
      : {
          title:
            "Life of a trend: opens when the last 7 days reach 1.3 times the 14 days before, ends under 1.1 times",
          reference: "reference: the 14 days before, frozen at the opening",
          week: "the last 7 days",
          ref: "reference",
          x13: "1.3× opens",
          x11: "1.1× ends",
          axis: "whole days (UTC), judged once a night",
          share: "share of slow page views",
        };

  const refDays = [8.1, 8.9, 8.4, 7.9, 9.0, 8.6, 8.2, 8.8, 8.3, 8.0, 9.1, 8.5, 8.7, 8.4];
  const week = [9.9, 10.8, 11.6, 11.3, 12.0, 11.7, 12.2];
  const values = [...refDays, ...week];
  const reference = 8.5;
  const left = 40;
  const right = 560;
  const base = 225;
  const step = (right - left) / values.length;
  const barW = step * 0.6;
  const y = (v: number) => base - v * 15;
  const xOf = (i: number) => left + i * step + (step - barW) / 2;
  const weekStart = refDays.length;

  return (
    <Frame title={L.title} viewBox="0 0 700 280">
      <Dashed y={y(reference * 1.3)} x1={left} x2={right} label={L.x13} />
      <Dashed y={y(reference * 1.1)} x1={left} x2={right} label={L.x11} />
      <Dashed y={y(reference)} x1={left} x2={right} label={L.ref} />
      {values.map((v, i) => (
        <rect
          key={i}
          x={xOf(i)}
          y={y(v)}
          width={barW}
          height={base - y(v)}
          fill={i >= weekStart ? WORSE : BAR}
          rx={2}
        />
      ))}
      <line x1={left} x2={right} y1={base} y2={base} stroke={BORDER} />

      {/* brackets */}
      <line x1={xOf(0)} x2={xOf(weekStart - 1) + barW} y1={28} y2={28} stroke={MUTED} />
      <text x={(xOf(0) + xOf(weekStart - 1) + barW) / 2} y={18} fill={MUTED} textAnchor="middle">
        {L.reference}
      </text>
      <line x1={xOf(weekStart)} x2={xOf(values.length - 1) + barW} y1={28} y2={28} stroke={WORSE} />
      <text
        x={(xOf(weekStart) + xOf(values.length - 1) + barW) / 2}
        y={18}
        fill={WORSE}
        textAnchor="middle"
        fontWeight={600}
      >
        {L.week}
      </text>

      <text x={left} y={base + 22} fill={MUTED}>
        {L.axis}
      </text>
      <text x={right} y={base + 22} fill={MUTED} textAnchor="end">
        {L.share}
      </text>
    </Frame>
  );
}
