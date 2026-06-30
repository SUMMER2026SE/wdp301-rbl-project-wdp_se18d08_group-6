const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. "sends a reset link for forgot-password requests" -> "sends a reset OTP for forgot-password requests"
let test1Old = `    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({ id: "user-1", email: "test@example.com" }),
      },
    };`;
let test1New = `    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({ id: "user-1", email: "test@example.com" }),
      },
      emailVerificationCode: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: "code-1" }),
      }
    };`;

content = content.replace(test1Old, test1New);
content = content.replace(
  `it("sends a reset link for forgot-password requests"`, 
  `it("sends a reset OTP for forgot-password requests"`
);
content = content.replace(
  `expect(notificationService.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" }),
    );`,
  `expect(prisma.emailVerificationCode.create).toHaveBeenCalledOnce();
    expect(notificationService.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" }),
    );`
);

// 2. "keeps forgot-password responses generic for unknown emails" message check
content = content.replace(
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu."`,
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP đặt lại mật khẩu."`
);

// 3. "resets the password with a valid reset token" -> "resets the password with a valid OTP"
// Replace the entire block from "resets the password with a valid reset token" up to next it()
let resetSuccessTestOldStr = `it("resets the password with a valid reset token", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
          updatedAt: new Date(Date.now() - 10000),
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        sub: "user-1",
        email: "test@example.com",
        tokenType: "password-reset",
        iat: Math.floor(Date.now() / 1000),
      }),
    };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.resetPassword({
      token: "valid-token",
      password: "NewPassword123",
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token");
    expect(prisma.userAccount.update).toHaveBeenCalledOnce();
    const updateCall = prisma.userAccount.update.mock.calls[0]?.[0];
    expect(updateCall?.where?.id).toBe("user-1");
    expect(updateCall?.data?.passwordHash).toBeDefined();

    expect(result).toEqual({
      success: true,
      data: { email: "test@example.com" },
      message: "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập lại.",
    });
  });`;

let resetSuccessTestNewStr = `it("resets the password with a valid OTP", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
          updatedAt: new Date(Date.now() - 10000),
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      emailVerificationCode: {
        findFirst: vi.fn().mockResolvedValue({
          id: "code-1",
          userId: "user-1",
          code: "123456",
          used: false,
          expiresAt: new Date(Date.now() + 10000),
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockResolvedValue([]),
    };
    const jwtService = {};
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    const result = await service.resetPassword({
      email: "test@example.com",
      otp: "123456",
      password: "NewPassword123",
    });

    expect(prisma.$transaction).toHaveBeenCalledOnce();

    expect(result).toEqual({
      success: true,
      data: { email: "test@example.com" },
      message: "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập lại.",
    });
  });`;

content = content.replace(resetSuccessTestOldStr, resetSuccessTestNewStr);


// 4. "rejects reset tokens issued before the latest account update" -> "rejects invalid or expired OTP"
let resetFailTestOldStr = `it("rejects reset tokens issued before the latest account update", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
          updatedAt: new Date(Date.now()), // Updated now
        }),
      },
    };
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        sub: "user-1",
        email: "test@example.com",
        tokenType: "password-reset",
        iat: Math.floor(Date.now() / 1000) - 3600, // Token issued an hour ago
      }),
    };
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    await expect(
      service.resetPassword({
        token: "old-token",
        password: "NewPassword123",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });`;

let resetFailTestNewStr = `it("rejects invalid or expired OTP", async () => {
    const prisma = {
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
        }),
      },
      emailVerificationCode: {
        findFirst: vi.fn().mockResolvedValue(null), // OTP not found or expired
      },
    };
    const jwtService = {};
    const service = new AuthService(prisma as never, jwtService as never, notificationService as never);

    await expect(
      service.resetPassword({
        email: "test@example.com",
        otp: "wrong-otp",
        password: "NewPassword123",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });`;

content = content.replace(resetFailTestOldStr, resetFailTestNewStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated auth.service.spec.ts");
