import Image from "next/image";
import Link from "next/link";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import type { Project } from "./data";

export function ProjectCard({
  project,
  locale,
  sampleLabel,
}: {
  project: Project;
  locale: Locale;
  sampleLabel: string;
}) {
  const title = localized(project.title, locale);
  return (
    <article className="group relative has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ink">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {project.cover && (
          <Image
            src={project.cover.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
            style={{ objectPosition: project.cover.objectPosition }}
          />
        )}
        {project.isSample && (
          <span className="absolute start-2 top-2 bg-ink px-2 py-0.5 text-xs font-semibold text-paper">
            {sampleLabel}
          </span>
        )}
      </div>
      <h3
        className="mt-3 font-display text-xl"
        lang={title.isFallback ? "he" : undefined}
      >
        <Link
          href={localeHref(locale, `/projects/${project.slug}`)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {title.value}
        </Link>
      </h3>
    </article>
  );
}
