import {
  ProductPage,
  productMetadata,
  productStaticParams,
} from "@/features/catalog/ProductPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/en/product/[slug]">) {
  return productMetadata("en", (await params).slug);
}

export default async function Page({
  params,
}: PageProps<"/en/product/[slug]">) {
  return <ProductPage locale="en" slug={(await params).slug} />;
}
