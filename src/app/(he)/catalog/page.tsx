import type { Metadata } from "next";
import { CatalogIndexPage } from "@/features/catalog/CategoryPage";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(
  "he",
  pagePaths.catalog,
  messagesFor("he").pages.catalog,
);

export default function Page() {
  return <CatalogIndexPage locale="he" />;
}
