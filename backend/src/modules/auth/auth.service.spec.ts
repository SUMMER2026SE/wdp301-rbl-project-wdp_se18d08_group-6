import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { createSign, generateKeyPairSync } from "node:crypto";
import * as bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { AuthService } from "./auth.service";

const originalSmtpEmail = process.env.SMTP_EMAIL;
const originalSmtpPassword = process.env.SMTP_PASSWORD;
const originalFrontendUrl = process.env.FRONTEND_URL;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;

const notificationService = {
  sendAuthVerificationEmail: vi.fn(async () => {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return { status: "skipped" as const, provider: "smtp" as const };
    }

    return { status: "sent" as const, provider: "smtp" as const };
  }),
  sendPasswordResetEmail: vi.fn(async () => {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return { status: "skipped" as const, provider: "smtp" as const };
    }

    return { status: "sent" as const, provider: "smtp" as const };
  }),
  sendBookingNotification: vi.fn(),
};

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createGoogleToken(options: {
  email: string;
  name: string;
  aud: string;
  sub?: string;
  kid?: string;
  emailVerified?: boolean;
}) {
  // @ts-expect-error Node crypto overloads in the backend tsconfig are narrower than the runtime API.
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { format: "jwk" },
    privateKeyEncoding: { format: "pem", type: "pkcs8" },
  });
  const kid = options.kid ?? "google-key-1";
  const header = { alg: "RS256", kid, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://accounts.google.com",
    aud: options.aud,
    sub: options.sub ?? "google-sub-1",
    email: options.email,
    email_verified: options.emailVerified ?? true,
    name: options.name,
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(privateKey).toString("base64url");
  const publicJwk = publicKey as unknown as Record<string, unknown>;

  return {
    token: `${signingInput}.${signature}`,
    jwk: { ...publicJwk, kid, use: "sig", alg: "RS256" },
  };
}

function mockGoogleJwks(jwk: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [jwk] }),
    }),
  );
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalSmtpEmail === undefined) {
      delete process.env.SMTP_EMAIL;
    } else {
      process.env.SMTP_EMAIL = originalSmtpEmail;
    }
    if (originalSmtpPassword === undefined) {
      delete process.env.SMTP_PASSWORD;
    } else {
      process.env.SMTP_PASSWORD = originalSmtpPassword;
    }
    if (originalFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = originalFrontendUrl;
    }
    if (originalGoogleClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
    }
    vi.unstubAllGlobals();
  });

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
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);
    (service as unknown as {
      logger: {
        log: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
      };
    }).logger = logger;

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
    expect(logger.log).toHaveBeenCalledWith(expect.stringMatching(/DEV OTP for customer@example\.com: \d{6}/));
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
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

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
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.login({
      email: "customer@example.com",
      password: "password123",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "user-1",
      email: "customer@example.com",
      role: "customer",
      tokenType: "access",
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

  it("logs in with a valid Google credential and creates a customer account on first sign-in", async () => {
    const google = createGoogleToken({
      email: "google.customer@example.com",
      name: "Google Customer",
      aud: "google-client-id",
    });
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    mockGoogleJwks(google.jwk);

    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "user-google-1",
          email: "google.customer@example.com",
          role: "customer",
          isActive: true,
          isEmailVerified: true,
          profile: {
            fullName: "Google Customer",
            phone: null,
          },
        }),
      },
    };
    const jwtService = { signAsync: vi.fn().mockResolvedValue("google-access-token") };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.loginWithGoogle({ idToken: google.token });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(prisma.userAccount.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: "google.customer@example.com",
        role: "customer",
        isActive: true,
        isEmailVerified: true,
      }),
      include: { profile: true },
    }));
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "user-google-1",
      email: "google.customer@example.com",
      role: "customer",
      tokenType: "access",
    });
    expect(result).toEqual({
      success: true,
      data: {
        accessToken: "google-access-token",
        user: {
          id: "user-google-1",
          email: "google.customer@example.com",
          role: "customer",
        },
      },
    });
  });

  it("links an existing account and syncs verification on Google login", async () => {
    const google = createGoogleToken({
      email: "customer@example.com",
      name: "Google Customer",
      aud: "google-client-id",
    });
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    mockGoogleJwks(google.jwk);

    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-2",
          email: "customer@example.com",
          passwordHash: "hash",
          role: "customer",
          isActive: true,
          isEmailVerified: false,
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          profile: {
            fullName: null,
            phone: null,
          },
        }),
        update: vi.fn().mockResolvedValue({
          id: "user-2",
          email: "customer@example.com",
          role: "customer",
          isActive: true,
          isEmailVerified: true,
          profile: {
            fullName: "Google Customer",
            phone: null,
          },
        }),
      },
    };
    const jwtService = { signAsync: vi.fn().mockResolvedValue("google-access-token") };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.loginWithGoogle({ idToken: google.token });

    expect(prisma.userAccount.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "user-2" },
      data: expect.objectContaining({
        isEmailVerified: true,
        isActive: true,
        updatedAt: expect.any(Date),
        profile: expect.objectContaining({
          upsert: expect.objectContaining({
            create: { fullName: "Google Customer" },
            update: { fullName: "Google Customer" },
          }),
        }),
      }),
      include: { profile: true },
    }));
    expect(result).toEqual({
      success: true,
      data: {
        accessToken: "google-access-token",
        user: {
          id: "user-2",
          email: "customer@example.com",
          role: "customer",
        },
      },
    });
  });

  it("rejects Google credentials with the wrong audience", async () => {
    const google = createGoogleToken({
      email: "customer@example.com",
      name: "Google Customer",
      aud: "wrong-client-id",
    });
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    mockGoogleJwks(google.jwk);

    const prisma = {
      userAccount: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    await expect(service.loginWithGoogle({ idToken: google.token })).rejects.toBeInstanceOf(UnauthorizedException);
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
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    await expect(
      service.login({
        email: "customer@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("sends a reset OTP for forgot-password requests", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
        }),
      },
      emailVerificationCode: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: "code-1" }),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);
    (service as unknown as {
      logger: {
        log: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
      };
    }).logger = logger;

    const result = await service.forgotPassword({
      email: "Customer@Example.com",
    });

    expect(prisma.emailVerificationCode.create).toHaveBeenCalledOnce();
    expect(result).toEqual({
      success: true,
      data: { email: "customer@example.com" },
      message: "N\u1ebfu email t\u1ed3n t\u1ea1i trong h\u1ec7 th\u1ed1ng, ch\u00fang t\u00f4i \u0111\u00e3 g\u1eedi m\u00e3 OTP \u0111\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u.",
    });
  });

  it("keeps forgot-password responses generic for unknown emails", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    const jwtService = { signAsync: vi.fn() };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.forgotPassword({
      email: "missing@example.com",
    });

    expect(result).toEqual({
      success: true,
      data: { email: "missing@example.com" },
      message: "N\u1ebfu email t\u1ed3n t\u1ea1i trong h\u1ec7 th\u1ed1ng, ch\u00fang t\u00f4i \u0111\u00e3 g\u1eedi m\u00e3 OTP \u0111\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u.",
    });
  });

  it("resets the password with a valid reset OTP", async () => {
    const oldUpdatedAt = new Date("2024-01-01T00:00:00.000Z");
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          passwordHash: "old-password-hash",
          updatedAt: oldUpdatedAt,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      emailVerificationCode: {
        findFirst: vi.fn().mockResolvedValue({
          id: "code-1",
          userId: "user-1",
          code: "123456",
          used: false,
          expiresAt: new Date(Date.now() + 100000),
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation(async (queries) => {
        // simulate transaction
        return Promise.all(queries);
      }),
    };
    const jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.resetPassword({
      email: "customer@example.com",
      otp: "123456",
      password: "NewPassword123",
    });

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(result).toEqual({
      success: true,
      data: { email: "customer@example.com" },
      message: "M\u1eadt kh\u1ea9u \u0111\u00e3 \u0111\u01b0\u1ee3c \u0111\u1eb7t l\u1ea1i th\u00e0nh c\u00f4ng. B\u1ea1n c\u00f3 th\u1ec3 \u0111\u0103ng nh\u1eadp l\u1ea1i.",
    });
  });

  it("rejects invalid reset OTPs", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
        }),
      },
      emailVerificationCode: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };
    const jwtService = {
      signAsync: vi.fn(),
    };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    await expect(
      service.resetPassword({
        email: "customer@example.com",
        otp: "wrong-otp",
        password: "NewPassword123",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
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
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

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

