import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command Center // SeinDevStudio",
  description: "Private Owner Management Portal",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
