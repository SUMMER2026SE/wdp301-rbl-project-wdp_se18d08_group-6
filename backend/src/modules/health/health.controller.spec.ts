import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns service health status", () => {
    const controller = new HealthController();

    expect(controller.getHealth()).toEqual({
      success: true,
      data: {
        status: "ok",
        service: "co-phuc-rental-erp-backend",
      },
    });
  });
});