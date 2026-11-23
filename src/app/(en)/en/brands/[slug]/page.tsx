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
}: PageProps<"/en/brands/[slug]">) {
  return brandMetadata("en", (await params).slug);
}

export default async function Page({ params }: PageProps<"/en/brands/[slug]">) {
  return <BrandPage locale="en" slug={(await params).slug} />;
}
