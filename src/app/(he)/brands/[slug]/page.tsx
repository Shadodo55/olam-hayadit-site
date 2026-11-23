import {
  BrandPage,
  brandMetadata,
  brandStaticParams,
} from "@/features/content/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">) {
  return brandMetadata("he", (await params).slug);
}

export default async function Page({ params }: PageProps<"/brands/[slug]">) {
  return <BrandPage locale="he" slug={(await params).slug} />;
}
