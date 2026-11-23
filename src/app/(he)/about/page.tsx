import { CmsPage, cmsPageMetadata } from "@/features/content/pages";

export function generateMetadata() {
  return cmsPageMetadata("he", "about", "about");
}

export default function Page() {
  return <CmsPage locale="he" slug="about" />;
}
