import Link from "next/link";
import { HandleMark } from "@/components/ui/icons";

/**
 * Typographic wordmark. The name comes from the CMS and can be any length:
 * on small screens it wraps instead of overflowing. A placeholder until the store's real logo exists:
 * replace the contents here and every page follows.
 */
export function Wordmark({
  name,
  href,
  label,
  tone = "light",
}: {
  name: string;
  href: string;
  label: string;
  tone?: "light" | "dark";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex min-h-11 min-w-0 items-center gap-3"
    >
      <HandleMark className="hidden shrink-0 text-brass min-[420px]:block" />
      <span
        className={`min-w-0 font-display text-lg leading-tight text-balance sm:text-[1.375rem] sm:leading-none sm:whitespace-nowrap ${tone === "dark" ? "text-paper" : "text-ink"}`}
      >
        {name}
      </span>
    </Link>
  );
}
