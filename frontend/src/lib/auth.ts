export type AppRole = "customer" | "staff" | "manager_owner" | "admin";

const dashboardPathByRole: Record<AppRole, string> = {
  customer: "/dashboard/customer",
  staff: "/dashboard/staff",
  manager_owner: "/dashboard/manager",
  admin: "/dashboard/admin",
};

export function getDashboardPathByRole(role: string | null | undefined): string {
  if (!role) {
    return "/dashboard";
  }

  return dashboardPathByRole[role as AppRole] ?? "/dashboard";
}
