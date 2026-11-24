import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const metadata = legalMetadata("he", "accessibility");

export default function Page() {
  return <LegalPage locale="he" page="accessibility" />;
}
