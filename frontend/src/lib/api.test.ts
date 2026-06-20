import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("builds notification endpoints correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { unreadCount: 0, notifications: [] } }),
      }),
    );

    const result = await apiRequest("/notifications/me?limit=10");

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/notifications/me?limit=10", {
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
});
