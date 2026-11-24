import Link from "next/link";
import { LogoMark } from "./LogoMark";

/** The name on two lines like the logo: the last word is the second line. */
export function splitName(name: string): [string, string | null] {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, null];
  return [words.slice(0, -1).join(" "), words.at(-1)!];
}

/**
 * The logo as a lockup: the mark, then the store name on two lines (navy,
 * then teal), as in the logo file. The mark stays on the physical left in
 * both languages, like the logo. The name comes from the CMS.
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
  const [first, second] = splitName(name);
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex min-h-11 min-w-0 items-center gap-2.5 rtl:flex-row-reverse"
    >
      <LogoMark
        tone={tone}
        className="hidden h-11 w-auto shrink-0 min-[380px]:block"
      />
      <span className="min-w-0 wordmark text-xl leading-none whitespace-nowrap sm:text-[1.375rem]">
        <span
          className={`block ${tone === "dark" ? "text-wordmark-on-band" : "text-wordmark"}`}
        >
          {first}
        </span>{" "}
        {second && (
          <span
            className={`block ${tone === "dark" ? "text-accent-on-band" : "text-wordmark-accent"}`}
          >
            {second}
          </span>
        )}
      </span>
    </Link>
  );
}
