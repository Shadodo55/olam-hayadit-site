import { FaqPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "faq");

export default function Page() {
  return <FaqPage locale="en" />;
}
