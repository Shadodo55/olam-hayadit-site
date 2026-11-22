import Link from "next/link";
import { HandleMark } from "@/components/ui/icons";

/**
 * Typographic wordmark. A placeholder until the store's real logo exists:
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
      className="inline-flex min-h-11 shrink-0 items-center gap-3"
    >
      <HandleMark className="hidden shrink-0 text-brass min-[420px]:block" />
      <span
        className={`font-display text-lg leading-none whitespace-nowrap sm:text-[1.375rem] ${tone === "dark" ? "text-paper" : "text-ink"}`}
      >
        {name}
      </span>
    </Link>
  );
}
