import { describe, expect, it } from "vitest";
import { resolveDashboardPath } from "./auth";

describe("resolveDashboardPath", () => {
  it("maps known roles to the correct dashboard path", () => {
    expect(resolveDashboardPath("customer")).toBe("/dashboard/customer");
    expect(resolveDashboardPath("staff")).toBe("/dashboard/staff");
    expect(resolveDashboardPath("manager_owner")).toBe("/dashboard/manager");
    expect(resolveDashboardPath("admin")).toBe("/dashboard/admin");
  });
});
