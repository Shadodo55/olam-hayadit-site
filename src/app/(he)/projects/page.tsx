import { ProjectsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "projects");

export default function Page() {
  return <ProjectsPage locale="he" />;
}
