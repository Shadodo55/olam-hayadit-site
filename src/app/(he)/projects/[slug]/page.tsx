import {
  ProjectPage,
  projectMetadata,
  projectStaticParams,
} from "@/features/content/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">) {
  return projectMetadata("he", (await params).slug);
}

export default async function Page({ params }: PageProps<"/projects/[slug]">) {
  return <ProjectPage locale="he" slug={(await params).slug} />;
}
