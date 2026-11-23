import { SearchPage, searchMetadata } from "@/features/search/SearchPage";

export const metadata = searchMetadata("he");

export default function Page() {
  return <SearchPage locale="he" />;
}
