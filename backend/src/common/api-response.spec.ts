import { describe, expect, it } from "vitest";
import { ok } from "./api-response";

describe("ok", () => {
  it("wraps data in the standard API response shape", () => {
    expect(ok({ status: "ok" }, "Ready")).toEqual({
      success: true,
      data: { status: "ok" },
      message: "Ready",
    });
  });
});