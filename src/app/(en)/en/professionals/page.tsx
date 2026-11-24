import { staticPageMetadata } from "@/features/content/pages";
import { ProfessionalsPage } from "@/features/forms/pages";

export const metadata = staticPageMetadata("en", "professionals");

export default function Page() {
  return <ProfessionalsPage locale="en" />;
}
