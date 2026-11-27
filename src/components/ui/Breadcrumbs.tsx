import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

export function Breadcrumbs({
  items,
  label,
}: {
  items: Crumb[];
  label: string;
}) {
  return (
    <>
      {/* The same trail for search engines (BreadcrumbList). */}
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label={label} className="text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
