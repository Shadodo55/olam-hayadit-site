import { LegalPage, legalMetadata } from "@/features/legal/LegalPage";

export const metadata = legalMetadata("en", "cookies");

export default function Page() {
  return <LegalPage locale="en" page="cookies" />;
}
