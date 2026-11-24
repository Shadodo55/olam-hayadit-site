/**
 * The logo's mark, redrawn as a vector so it stays sharp and follows the
 * theme: a rounded frame and a lock plate with a keyhole (navy; white on dark
 * bands), a lever handle and the underline (teal). Decorative: the store name
 * next to it is the accessible text.
 */
export function LogoMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <svg
      viewBox="0 0 150 100"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        className={tone === "dark" ? "fill-wordmark-on-band" : "fill-wordmark"}
      >
        {/* Frame, open towards the handle, with a cut at the top end */}
        <path d="M70 0H24A24 24 0 0 0 0 24V76A24 24 0 0 0 24 100H36L29 87A15 15 0 0 1 14 72V28A15 15 0 0 1 29 13H59Z" />
        {/* Lock plate, with room around the handle and a keyhole */}
        <path
          fillRule="evenodd"
          d="M18 44A15 15 0 0 1 47.87 42H42.94A12 12 0 1 0 42.94 58H48V83H29A11 11 0 0 1 18 72ZM31.3 72.62A4 4 0 1 1 34.7 72.62L35.6 79H30.4Z"
        />
      </g>
      <g className={tone === "dark" ? "fill-accent-on-band" : "fill-accent"}>
        <circle cx="34" cy="50" r="9.5" />
        <path d="M34 44H95A6 6 0 0 1 95 56H34Z" />
        <path d="M34.5 93H146.5A3.5 3.5 0 0 1 146.5 100H38.3Z" />
      </g>
    </svg>
  );
}
