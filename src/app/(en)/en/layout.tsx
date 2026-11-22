import type { Metadata } from "next";
import { RootDocument } from "@/components/layout/RootDocument";
import { baseMetadata } from "@/lib/seo/metadata";
import "../../globals.css";

export const metadata: Metadata = baseMetadata("en");

export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
