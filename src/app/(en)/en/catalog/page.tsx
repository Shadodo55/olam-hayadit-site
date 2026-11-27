import type { Metadata } from "next";
import { CatalogIndexPage } from "@/features/catalog/CategoryPage";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(
  "en",
  pagePaths.catalog,
  messagesFor("en").pages.catalog,
  messagesFor("en").meta.pages.catalog,
);

export default function Page() {
  return <CatalogIndexPage locale="en" />;
}
