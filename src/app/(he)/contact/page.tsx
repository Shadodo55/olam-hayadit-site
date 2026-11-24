import { staticPageMetadata } from "@/features/content/pages";
import { ContactPage } from "@/features/forms/pages";

export const metadata = staticPageMetadata("he", "contact");

export default function Page() {
  return <ContactPage locale="he" />;
}
