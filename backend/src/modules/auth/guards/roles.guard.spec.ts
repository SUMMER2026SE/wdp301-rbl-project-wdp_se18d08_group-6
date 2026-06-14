import { ForbiddenException, UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { RolesGuard } from "./roles.guard";

function createContext(user?: { role: string }): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe("RolesGuard", () => {
  it("allows access when no role metadata is present", () => {
    const guard = new RolesGuard({ getAllAndOverride: vi.fn().mockReturnValue(undefined) } as never);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it("rejects unauthenticated requests for role-protected routes", () => {
    const guard = new RolesGuard({ getAllAndOverride: vi.fn().mockReturnValue(["admin"]) } as never);

    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException);
  });

  it("rejects authenticated users with the wrong role", () => {
    const guard = new RolesGuard({ getAllAndOverride: vi.fn().mockReturnValue(["admin"]) } as never);

    expect(() => guard.canActivate(createContext({ role: "customer" }))).toThrow(ForbiddenException);
  });

  it("allows authenticated users with a matching role", () => {
    const guard = new RolesGuard({ getAllAndOverride: vi.fn().mockReturnValue(["staff", "admin"]) } as never);

    expect(guard.canActivate(createContext({ role: "staff" }))).toBe(true);
  });
});
