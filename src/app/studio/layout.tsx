import { NextStudioLayout } from "next-sanity/studio";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
