import { afterEach, describe, expect, it } from "vitest";
import {
  AUTH_SESSION_STORAGE_KEY,
  clearAuthSession,
  normalizeNullableText,
  readStoredSession,
  resolveDashboardPath,
  storeAuthSession,
} from "./auth";

describe("auth storage helpers", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores and reads the normalized auth session", () => {
    storeAuthSession({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: "0909000000",
      },
    });

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("jwt-token");
    expect(readStoredSession()?.user.fullName).toBe("Nguyen Van A");

    clearAuthSession();
    expect(readStoredSession()).toBeNull();
  });

  it("falls back to legacy token storage used by the first auth MVP", () => {
    window.localStorage.setItem("access_token", "legacy-token");
    window.localStorage.setItem("user_role", "staff");

    expect(readStoredSession()).toEqual({
      accessToken: "legacy-token",
      user: {
        id: "",
        email: "",
        role: "staff",
        isActive: true,
        fullName: null,
        phone: null,
      },
    });
  });

  it("maps roles to dashboard routes and normalizes optional text", () => {
    expect(resolveDashboardPath("manager_owner")).toBe("/dashboard/manager");
    expect(normalizeNullableText("  ")).toBeNull();
    expect(normalizeNullableText("  M  ")).toBe("M");
  });
});
