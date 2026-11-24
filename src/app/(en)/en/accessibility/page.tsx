import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const metadata = legalMetadata("en", "accessibility");

export default function Page() {
  return <LegalPage locale="en" page="accessibility" />;
}
