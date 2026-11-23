import { ProjectsPage, staticPageMetadata } from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "projects");

export default function Page() {
  return <ProjectsPage locale="en" />;
}
