import {
  CategoryPage,
  categoryMetadata,
  categoryStaticParams,
} from "@/features/catalog/CategoryPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoryStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/en/catalog/[...slug]">) {
  return categoryMetadata("en", (await params).slug);
}

export default async function Page({
  params,
}: PageProps<"/en/catalog/[...slug]">) {
  return <CategoryPage locale="en" slug={(await params).slug} />;
}
