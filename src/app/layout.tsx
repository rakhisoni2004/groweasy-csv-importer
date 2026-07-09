import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Importer | GrowEasy",
  description: "Upload any CSV export and let AI map it straight into GrowEasy CRM format.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
