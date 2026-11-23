import { SearchPage, searchMetadata } from "@/features/search/SearchPage";

export const metadata = searchMetadata("en");

export default function Page() {
  return <SearchPage locale="en" />;
}
