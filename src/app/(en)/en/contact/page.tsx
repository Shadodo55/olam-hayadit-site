import { staticPageMetadata } from "@/features/content/pages";
import { ContactPage } from "@/features/forms/pages";

export const metadata = staticPageMetadata("en", "contact");

export default function Page() {
  return <ContactPage locale="en" />;
}
