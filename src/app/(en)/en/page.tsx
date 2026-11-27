import { HomePage } from "@/features/home/HomePage";
import { homeMetadata } from "@/lib/seo/metadata";

export const metadata = homeMetadata("en");

export default function Page() {
  return <HomePage locale="en" />;
}
