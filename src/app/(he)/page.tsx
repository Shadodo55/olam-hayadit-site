import { HomePage } from "@/features/home/HomePage";
import { homeMetadata } from "@/lib/seo/metadata";

export const metadata = homeMetadata("he");

export default function Page() {
  return <HomePage locale="he" />;
}
