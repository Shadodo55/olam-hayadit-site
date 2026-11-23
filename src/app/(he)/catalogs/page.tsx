import { CatalogsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "catalogs");

export default function Page() {
  return <CatalogsPage locale="he" />;
}
