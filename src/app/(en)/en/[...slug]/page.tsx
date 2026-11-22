import {
  ComingSoonPage,
  comingSoonMetadata,
} from "@/features/coming-soon/ComingSoonPage";
import { comingSoonSlugs } from "@/lib/routes";

/** Planned pages that aren't built yet (see src/lib/routes.ts). */
export const dynamicParams = false;

export function generateStaticParams() {
  return comingSoonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/en/[...slug]">) {
  const { slug } = await params;
  return comingSoonMetadata("en", slug);
}

export default async function Page({ params }: PageProps<"/en/[...slug]">) {
  const { slug } = await params;
  return <ComingSoonPage locale="en" slug={slug} />;
}
