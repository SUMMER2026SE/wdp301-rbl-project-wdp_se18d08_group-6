import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Cổ Phục Rental ERP",
  description: "Landing page và cổng đăng nhập cho hệ thống ERP thuê cổ phục, áo dài Việt Nam có thử đồ AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="text-ink" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
