import { FaqPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "faq");

export default function Page() {
  return <FaqPage locale="he" />;
}
