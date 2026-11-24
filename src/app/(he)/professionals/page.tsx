import { staticPageMetadata } from "@/features/content/pages";
import { ProfessionalsPage } from "@/features/forms/pages";

export const metadata = staticPageMetadata("he", "professionals");

export default function Page() {
  return <ProfessionalsPage locale="he" />;
}
