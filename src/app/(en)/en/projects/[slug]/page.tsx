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
}: PageProps<"/en/projects/[slug]">) {
  return projectMetadata("en", (await params).slug);
}

export default async function Page({
  params,
}: PageProps<"/en/projects/[slug]">) {
  return <ProjectPage locale="en" slug={(await params).slug} />;
}
