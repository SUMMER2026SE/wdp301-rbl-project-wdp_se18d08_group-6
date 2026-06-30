const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The whole block from `it("sends a reset OTP for forgot-password requests",` to `it("returns the authenticated user from me()",`
const startStr = '  it("sends a reset OTP for forgot-password requests",';
const endStr = '  it("returns the authenticated user from me()",';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newTests = `  it("sends a reset OTP for forgot-password requests", async () => {
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
      message: "N\\u1ebfu email t\\u1ed3n t\\u1ea1i trong h\\u1ec7 th\\u1ed1ng, ch\\u00fang t\\u00f4i \\u0111\\u00e3 g\\u1eedi m\\u00e3 OTP \\u0111\\u1eb7t l\\u1ea1i m\\u1eadt kh\\u1ea9u.",
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
      message: "N\\u1ebfu email t\\u1ed3n t\\u1ea1i trong h\\u1ec7 th\\u1ed1ng, ch\\u00fang t\\u00f4i \\u0111\\u00e3 g\\u1eedi m\\u00e3 OTP \\u0111\\u1eb7t l\\u1ea1i m\\u1eadt kh\\u1ea9u.",
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
      message: "M\\u1eadt kh\\u1ea9u \\u0111\\u00e3 \\u0111\\u01b0\\u1ee3c \\u0111\\u1eb7t l\\u1ea1i th\\u00e0nh c\\u00f4ng. B\\u1ea1n c\\u00f3 th\\u1ec3 \\u0111\\u0103ng nh\\u1eadp l\\u1ea1i.",
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

`;

  content = content.slice(0, startIdx) + newTests + content.slice(endIdx);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated auth.service.spec.ts correctly");
} else {
  console.error("Could not find start or end block");
}
