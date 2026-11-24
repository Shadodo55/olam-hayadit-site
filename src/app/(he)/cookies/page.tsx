import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const metadata = legalMetadata("he", "cookies");

export default function Page() {
  return <LegalPage locale="he" page="cookies" />;
}
