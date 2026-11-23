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
}: PageProps<"/product/[slug]">) {
  return productMetadata("he", (await params).slug);
}

export default async function Page({ params }: PageProps<"/product/[slug]">) {
  return <ProductPage locale="he" slug={(await params).slug} />;
}
