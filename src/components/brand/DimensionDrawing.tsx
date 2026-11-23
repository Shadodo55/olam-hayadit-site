/**
 * The site's signature drawing: a bar handle seen from the side with its
 * hole-to-hole dimension, in the style of a technical drawing. Used as the
 * home hero visual (when there is no photo/video) and in the measuring guide.
 * Decorative unless `title` is given.
 */
export function DimensionDrawing({
  mm = 128,
  title,
  className = "",
}: {
  mm?: number;
  /** Accessible description; omit for purely decorative use. */
  title?: string;
  className?: string;
}) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 640 300"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : "dimension-title"}
      focusable="false"
      // Drawings read the same in every language.
      direction="ltr"
    >
      {!decorative && <title id="dimension-title">{title}</title>}
      {/* the handle */}
      <rect
        x="60"
        y="70"
        width="520"
        height="34"
        rx="17"
        className="fill-accent"
      />
      <rect
        x="140"
        y="100"
        width="26"
        height="70"
        rx="5"
        className="fill-accent"
      />
      <rect
        x="474"
        y="100"
        width="26"
        height="70"
        rx="5"
        className="fill-accent"
      />
      {/* screw centre lines */}
      <g className="stroke-ink" strokeWidth="1.5" strokeDasharray="4 6">
        <line x1="153" y1="40" x2="153" y2="250" />
        <line x1="487" y1="40" x2="487" y2="250" />
      </g>
      {/* dimension line with arrow heads */}
      <g className="stroke-ink" strokeWidth="2" fill="none">
        <line x1="153" y1="222" x2="487" y2="222" />
        <path d="M168 214 L153 222 L168 230" />
        <path d="M472 214 L487 222 L472 230" />
      </g>
      <rect x="265" y="206" width="110" height="32" className="fill-paper" />
      <text
        x="320"
        y="229"
        textAnchor="middle"
        className="fill-ink"
        style={{ font: "600 22px var(--font-assistant), Arial, sans-serif" }}
      >
        {mm} mm
      </text>
    </svg>
  );
}
