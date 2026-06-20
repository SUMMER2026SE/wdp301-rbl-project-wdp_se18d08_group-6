import { afterEach, describe, expect, it } from "vitest";
import { AUTH_SESSION_STORAGE_KEY, clearAuthSession, readStoredSession, resolveDashboardPath, storeAuthSession } from "./auth";

describe("resolveDashboardPath", () => {
  it("maps known roles to the correct dashboard path", () => {
    expect(resolveDashboardPath("customer")).toBe("/dashboard/customer");
    expect(resolveDashboardPath("staff")).toBe("/dashboard/staff");
    expect(resolveDashboardPath("manager_owner")).toBe("/dashboard/manager");
    expect(resolveDashboardPath("admin")).toBe("/dashboard/admin");
  });
});

describe("auth session storage", () => {
  afterEach(() => {
    clearAuthSession();
  });

  it("stores temporary sessions in sessionStorage when remember me is off", () => {
    storeAuthSession({
      accessToken: "session-token",
      persist: false,
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: null,
      },
    });

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("session-token");
    expect(readStoredSession()).toEqual({
      accessToken: "session-token",
      persist: false,
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: null,
      },
    });
  });

  it("stores persistent sessions in localStorage by default", () => {
    storeAuthSession({
      accessToken: "jwt-token",
      user: {
        id: "user-2",
        email: "staff@example.com",
        role: "staff",
        isActive: true,
        fullName: "Tran Staff",
        phone: "0909000000",
      },
    });

    expect(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("jwt-token");
    expect(readStoredSession()).toEqual({
      accessToken: "jwt-token",
      persist: true,
      user: {
        id: "user-2",
        email: "staff@example.com",
        role: "staff",
        isActive: true,
        fullName: "Tran Staff",
        phone: "0909000000",
      },
    });
  });
});