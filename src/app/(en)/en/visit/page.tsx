import { staticPageMetadata, VisitPage } from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "visit");

export default function Page() {
  return <VisitPage locale="en" />;
}
