import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Co Phuc Rental ERP",
  description: "ERP rental system for Vietnamese traditional costumes with AI try-on.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
