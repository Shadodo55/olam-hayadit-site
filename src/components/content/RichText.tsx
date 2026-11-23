import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Locale } from "@/lib/i18n/locales";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
    h2: ({ children }) => <h2 className="mt-10 text-2xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-xl">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 ps-6">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 ps-6">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="underline underline-offset-4"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
};

/**
 * Rich text from the CMS (`localeBlocks`). Falls back to Hebrew when the
 * English text is missing, marking it lang="he" for screen readers.
 */
export function RichText({
  value,
  locale,
}: {
  value: { he: PortableTextBlock[]; en: PortableTextBlock[] | null };
  locale: Locale;
}) {
  const useEnglish = locale === "en" && value.en;
  return (
    <div
      className="max-w-prose text-lg leading-relaxed"
      lang={locale === "en" && !useEnglish ? "he" : undefined}
      dir={locale === "en" && !useEnglish ? "rtl" : undefined}
    >
      <PortableText
        value={useEnglish ? value.en! : value.he}
        components={components}
      />
    </div>
  );
}
