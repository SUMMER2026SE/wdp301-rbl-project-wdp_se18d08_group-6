import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Co Phuc Rental ERP",
  description: "ERP rental system for Vietnamese traditional costumes with AI try-on.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
