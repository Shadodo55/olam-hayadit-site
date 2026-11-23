import {
  MeasuringGuidePage,
  staticPageMetadata,
} from "@/features/content/pages";

export const metadata = staticPageMetadata("he", "measuringGuide");

export default function Page() {
  return <MeasuringGuidePage locale="he" />;
}
