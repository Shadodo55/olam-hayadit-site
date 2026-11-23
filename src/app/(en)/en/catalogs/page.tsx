import { CatalogsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "catalogs");

export default function Page() {
  return <CatalogsPage locale="en" />;
}
