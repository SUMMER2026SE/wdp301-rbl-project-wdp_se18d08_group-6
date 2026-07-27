"use client";

import { ProtectedPage } from "@/components/auth/protected-page";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage allowedRoles={["admin"]}>
      {children}
    </ProtectedPage>
  );
}
