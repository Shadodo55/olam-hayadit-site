import { CmsPage, cmsPageMetadata } from "@/features/content/pages";

export function generateMetadata() {
  return cmsPageMetadata("en", "about", "about");
}

export default function Page() {
  return <CmsPage locale="en" slug="about" />;
}
