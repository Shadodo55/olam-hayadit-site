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
}: PageProps<"/catalog/[...slug]">) {
  return categoryMetadata("he", (await params).slug);
}

export default async function Page({
  params,
}: PageProps<"/catalog/[...slug]">) {
  return <CategoryPage locale="he" slug={(await params).slug} />;
}
