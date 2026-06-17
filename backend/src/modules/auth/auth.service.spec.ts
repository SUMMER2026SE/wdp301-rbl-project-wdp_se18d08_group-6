import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  it("registers a customer with a hashed password", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          role: "customer",
          isActive: true,
          profile: {
            fullName: "Nguyen Van A",
            phone: null,
          },
        }),
      },
      emailVerificationCode: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({}),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never);

    const result = await service.register({
      fullName: " Nguyen Van A ",
      email: "Customer@Example.com ",
      password: "password123",
    });

    expect(prisma.userAccount.create).toHaveBeenCalledOnce();
    const createCall = prisma.userAccount.create.mock.calls[0]?.[0];
    expect(createCall.data.email).toBe("customer@example.com");
    expect(createCall.data.role).toBe("customer");
    expect(createCall.data.profile.create.fullName).toBe("Nguyen Van A");
    expect(createCall.data.passwordHash).not.toBe("password123");
    await expect(bcrypt.compare("password123", createCall.data.passwordHash)).resolves.toBe(true);
    expect(result).toEqual({
      success: true,
      data: {
        email: "customer@example.com",
        requiresVerification: true,
      },
      message: expect.any(String),
    });
  });

  it("rejects duplicate registration emails", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({ id: "existing-user", isEmailVerified: true }),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never);

    await expect(
      service.register({
        fullName: "Nguyen Van A",
        email: "customer@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns a JWT payload and minimal login user on login", async () => {
    const passwordHash = await bcrypt.hash("password123", 12);
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          passwordHash,
          role: "customer",
          isActive: true,
          isEmailVerified: true,
          profile: {
            fullName: "Nguyen Van A",
            phone: "0909000000",
          },
        }),
      },
    };
    const jwtService = { signAsync: vi.fn().mockResolvedValue("signed-token") };
    const service = new AuthService(prisma as never, jwtService as never);

    const result = await service.login({
      email: "customer@example.com",
      password: "password123",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "user-1",
      email: "customer@example.com",
      role: "customer",
    });
    expect(result).toEqual({
      success: true,
      data: {
        accessToken: "signed-token",
        user: {
          id: "user-1",
          email: "customer@example.com",
          role: "customer",
        },
      },
    });
  });

  it("blocks inactive users from logging in", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          passwordHash: "irrelevant",
          role: "customer",
          isActive: false,
          isEmailVerified: true,
          profile: null,
        }),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never);

    await expect(
      service.login({
        email: "customer@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns the authenticated user from me()", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          passwordHash: "irrelevant",
          role: "customer",
          isActive: true,
          profile: {
            fullName: "Nguyen Van A",
            phone: null,
          },
        }),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never);

    await expect(service.me("user-1")).resolves.toEqual({
      success: true,
      data: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: null,
      },
    });
  });
});
