import { UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { JwtAuthGuard } from "./jwt-auth.guard";

function createContext(request: { headers?: { authorization?: string }; user?: unknown }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe("JwtAuthGuard", () => {
  it("rejects missing authorization headers", async () => {
    const guard = new JwtAuthGuard({ verifyAsync: vi.fn() } as never, {
      userAccount: { findUnique: vi.fn() },
    } as never);

    await expect(guard.canActivate(createContext({ headers: {} }))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects invalid or expired tokens", async () => {
    const guard = new JwtAuthGuard(
      {
        verifyAsync: vi.fn().mockRejectedValue(new Error("invalid")),
      } as never,
      { userAccount: { findUnique: vi.fn() } } as never,
    );

    await expect(
      guard.canActivate(createContext({ headers: { authorization: "Bearer bad-token" } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects inactive users even with a valid token", async () => {
    const guard = new JwtAuthGuard(
      {
        verifyAsync: vi.fn().mockResolvedValue({ sub: "user-1" }),
      } as never,
      {
        userAccount: {
          findUnique: vi.fn().mockResolvedValue({
            id: "user-1",
            email: "customer@example.com",
            role: "customer",
            isActive: false,
            profile: null,
          }),
        },
      } as never,
    );

    await expect(
      guard.canActivate(createContext({ headers: { authorization: "Bearer good-token" } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("attaches the authenticated user to the request", async () => {
    const request: { headers: { authorization: string }; user?: unknown } = {
      headers: { authorization: "Bearer good-token" },
    };
    const guard = new JwtAuthGuard(
      {
        verifyAsync: vi.fn().mockResolvedValue({ sub: "user-1" }),
      } as never,
      {
        userAccount: {
          findUnique: vi.fn().mockResolvedValue({
            id: "user-1",
            email: "customer@example.com",
            role: "customer",
            isActive: true,
            profile: {
              fullName: "Nguyen Van A",
              phone: "0909000000",
            },
          }),
        },
      } as never,
    );

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: "user-1",
      email: "customer@example.com",
      role: "customer",
      isActive: true,
      fullName: "Nguyen Van A",
      phone: "0909000000",
    });
  });
});
