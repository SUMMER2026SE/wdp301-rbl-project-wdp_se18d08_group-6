import { describe, expect, it } from "vitest";
import { getDashboardPathByRole } from "./auth";

describe("getDashboardPathByRole", () => {
  it("maps known roles to the correct dashboard path", () => {
    expect(getDashboardPathByRole("customer")).toBe("/dashboard/customer");
    expect(getDashboardPathByRole("staff")).toBe("/dashboard/staff");
    expect(getDashboardPathByRole("manager_owner")).toBe("/dashboard/manager");
    expect(getDashboardPathByRole("admin")).toBe("/dashboard/admin");
  });

  it("falls back to the shared dashboard for unknown roles", () => {
    expect(getDashboardPathByRole(undefined)).toBe("/dashboard");
    expect(getDashboardPathByRole("guest")).toBe("/dashboard");
  });
});
