"use client";

import { ProtectedPage } from "@/components/auth/protected-page";

export default function ManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage allowedRoles={["admin", "manager_owner"]}>
      {children}
    </ProtectedPage>
  );
}
