import { staticPageMetadata, VisitPage } from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "visit");

export default function Page() {
  return <VisitPage locale="he" />;
}
