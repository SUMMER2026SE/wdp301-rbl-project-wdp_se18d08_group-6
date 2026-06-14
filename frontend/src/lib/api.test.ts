import { afterEach, describe, expect, it, vi } from "vitest";
import { storeAuthSession } from "./auth";
import { apiRequest } from "./api";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("returns parsed payload for successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { status: "ok" } }),
      }),
    );

    const result = await apiRequest<{ status: string }>("/health");

    expect(result).toEqual({ success: true, data: { status: "ok" } });
    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/health", {
      headers: { "content-type": "application/json" },
    });
  });

  it("normalizes failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: "UNAUTHORIZED", message: "Invalid token" }),
      }),
    );

    const result = await apiRequest("/secure");

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED", message: "Invalid token" });
  });

  it("attaches the stored bearer token automatically", async () => {
    storeAuthSession({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: null,
        phone: null,
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      }),
    );

    await apiRequest("/users/me/addresses");

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/users/me/addresses", {
      headers: { authorization: "Bearer jwt-token", "content-type": "application/json" },
    });
  });
});
