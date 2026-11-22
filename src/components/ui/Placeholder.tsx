/**
 * A visible marker for business details we don't have yet (never invent them).
 * Search the codebase for <Placeholder to find every gap before launch.
 */
export function Placeholder({ label }: { label: string }) {
  return (
    <span className="rounded-sm border border-dashed border-current px-1 text-[0.85em] opacity-90">
      {label}
    </span>
  );
}
