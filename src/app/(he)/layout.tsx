import type { Metadata } from "next";
import { RootDocument } from "@/components/layout/RootDocument";
import { baseMetadata } from "@/lib/seo/metadata";
import "../globals.css";

export const metadata: Metadata = baseMetadata("he");

export default function HebrewRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootDocument locale="he">{children}</RootDocument>;
}
