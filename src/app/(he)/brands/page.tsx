import { BrandsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "brands");

export default function Page() {
  return <BrandsPage locale="he" />;
}
