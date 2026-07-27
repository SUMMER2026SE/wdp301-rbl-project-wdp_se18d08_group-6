"use client";

import { ProtectedPage } from "@/components/auth/protected-page";

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage allowedRoles={["admin", "manager_owner", "staff"]}>
      {children}
    </ProtectedPage>
  );
}
