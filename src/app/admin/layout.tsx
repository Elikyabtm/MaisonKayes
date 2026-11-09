import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration Maison Kayes" },
  robots: { index: false, follow: false },
};

/** Dashboard privé : ni en-tête ni pied de page du site. */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-dvh flex-col bg-creme">{children}</div>;
}
