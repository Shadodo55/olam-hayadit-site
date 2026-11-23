import { BrandsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "brands");

export default function Page() {
  return <BrandsPage locale="en" />;
}
