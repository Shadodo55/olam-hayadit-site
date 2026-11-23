import {
  MeasuringGuidePage,
  staticPageMetadata,
} from "@/features/content/pages";

export const metadata = staticPageMetadata("en", "measuringGuide");

export default function Page() {
  return <MeasuringGuidePage locale="en" />;
}
