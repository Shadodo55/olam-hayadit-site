import Link from "next/link";
import { HandleMark } from "@/components/ui/icons";

/**
 * Typographic wordmark, styled per theme like the store's sign (heavy
 * turquoise letters with a black shadow in the "logo" theme). The name comes
 * from the CMS and can be any length: on small screens it wraps onto two
 * lines instead of overflowing. Replace with the real logo file when there is
 * one; every page follows.
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
      <HandleMark
        className={`hidden shrink-0 min-[420px]:block ${tone === "dark" ? "text-wordmark-on-band" : "text-accent"}`}
      />
      <span
        className={`min-w-0 wordmark text-[1.375rem] leading-[1.05] text-balance sm:text-2xl sm:whitespace-nowrap xl:text-[1.75rem] ${tone === "dark" ? "text-wordmark-on-band" : "text-wordmark"}`}
      >
        {name}
      </span>
    </Link>
  );
}
