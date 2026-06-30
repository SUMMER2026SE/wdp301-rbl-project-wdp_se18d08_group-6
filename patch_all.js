const fs = require('fs');
const path = require('path');

// ── 1. Patch auth.service.spec.ts: add isNewUser to Google tests ──────────────
const specPath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.spec.ts');
let spec = fs.readFileSync(specPath, 'utf8').replace(/\r\n/g, '\n');

// Test 1: new user (isNewUser: true)
spec = spec.replace(
  `    expect(result).toEqual({\n      success: true,\n      data: {\n        accessToken: "google-access-token",\n        user: {\n          id: "user-google-1",\n          email: "google.customer@example.com",\n          role: "customer",\n        },\n      },\n    });\n  });\n\n  it("links an existing account`,
  `    expect(result).toEqual({\n      success: true,\n      data: {\n        accessToken: "google-access-token",\n        isNewUser: true,\n        user: {\n          id: "user-google-1",\n          email: "google.customer@example.com",\n          role: "customer",\n        },\n      },\n    });\n  });\n\n  it("links an existing account`
);

// Test 2: existing user (isNewUser: false)
spec = spec.replace(
  `    expect(result).toEqual({\n      success: true,\n      data: {\n        accessToken: "google-access-token",\n        user: {\n          id: "user-2",\n          email: "customer@example.com",\n          role: "customer",\n        },\n      },\n    });\n  });\n\n  it("rejects Google credentials`,
  `    expect(result).toEqual({\n      success: true,\n      data: {\n        accessToken: "google-access-token",\n        isNewUser: false,\n        user: {\n          id: "user-2",\n          email: "customer@example.com",\n          role: "customer",\n        },\n      },\n    });\n  });\n\n  it("rejects Google credentials`
);

spec = spec.replace(/\n/g, '\r\n');
fs.writeFileSync(specPath, spec, 'utf8');
console.log('auth.service.spec.ts patched with isNewUser assertions');

// ── 2. Patch auth.service.ts: apply all OTP + isNewUser changes ───────────────
const servicePath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.ts');
let service = fs.readFileSync(servicePath, 'utf8').replace(/\r\n/g, '\n');

// 2a. ResetPasswordInput type
service = service.replace(
  `type ResetPasswordInput = {\n  token: string;\n  password: string;\n};`,
  `type ResetPasswordInput = {\n  email: string;\n  otp: string;\n  password: string;\n};`
);

// 2b. Remove ResetPasswordTokenPayload
service = service.replace(
  `\ntype ResetPasswordTokenPayload = {\n  sub?: string;\n  email?: string;\n  tokenType?: "access" | "password-reset";\n  iat?: number;\n};\n`,
  '\n'
);

// 2c. ForgotPassword - use OTP method
service = service.replace(
  `await this.sendPasswordResetLink(user.id, normalizedEmail);`,
  `await this.sendPasswordResetOtp(user.id, normalizedEmail);`
);
service = service.replace(
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.",`,
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP đặt lại mật khẩu.",`
);

// 2d. Replace resetPassword body
const oldReset = `  async resetPassword(input: ResetPasswordInput) {
    const payload = await this.verifyPasswordResetToken(input.token);

    if (!payload.sub || !payload.email || payload.tokenType !== "password-reset") {
      throw new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }

    const user = await this.prisma.userAccount.findUnique({ where: { id: payload.sub } });

    if (!user || user.email !== payload.email) {
      throw new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }

    if (typeof payload.iat !== "number" || payload.iat * 1000 < user.updatedAt.getTime()) {
      throw new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return ok({ email: user.email }, "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập lại.");
  }`;

const newReset = `  async resetPassword(input: ResetPasswordInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    const record = await this.prisma.emailVerificationCode.findFirst({
      where: {
        userId: user.id,
        code: input.otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await this.prisma.$transaction([
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      }),
      this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return ok({ email: user.email }, "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập lại.");
  }`;

if (service.includes(oldReset)) {
  service = service.replace(oldReset, newReset);
  console.log('resetPassword patched');
} else {
  console.log('resetPassword already patched or not found, skipping');
}

// 2e. Replace sendPasswordResetLink + verifyPasswordResetToken
const oldSendLink = `  private async sendPasswordResetLink(userId: string, email: string) {
    const resetToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        tokenType: "password-reset",
      },
      { expiresIn: "1h" },
    );

    const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\\/$/, "");
    const resetUrl = \`\${frontendUrl}/reset-password?token=\${encodeURIComponent(resetToken)}\`;

    if (process.env.NODE_ENV !== "production") {
      this.logger.log(\`DEV password reset link for \${email}: \${resetUrl}\`);
    }

    const result = await this.notificationsService.sendPasswordResetEmail({
      email,
      resetUrl,
    });

    if (result.status === "skipped") {
      this.logger.warn(
        \`SMTP not configured. Skipping email delivery for \${email}. Use the backend terminal reset link above.\`,
      );
      return;
    }

    if (result.status === "sent") {
      this.logger.log(\`Đã gửi email đặt lại mật khẩu đến: \${email}\`);
      return;
    }

    this.logger.error(\`Lỗi khi gửi email đặt lại mật khẩu đến \${email}:\`, result.reason ?? "unknown error");
  }

  private async verifyPasswordResetToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<ResetPasswordTokenPayload>(token);
    } catch {
      throw new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }
  }`;

const newSendOtp = `  private async sendPasswordResetOtp(userId: string, email: string) {
    await this.prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    const code = Math.floor(100_000 + Math.random() * 900_000).toString();

    if (process.env.NODE_ENV !== "production") {
      this.logger.log(\`DEV password reset OTP for \${email}: \${code}\`);
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.emailVerificationCode.create({
      data: { userId, code, expiresAt },
    });

    const result = await this.notificationsService.sendPasswordResetEmail({
      email,
      code,
      expiresIn: 10,
    });

    if (result.status === "skipped") {
      this.logger.warn(
        \`SMTP not configured. Skipping email delivery for \${email}. Use the backend terminal OTP above.\`,
      );
      return;
    }

    if (result.status === "sent") {
      this.logger.log(\`Đã gửi email OTP đặt lại mật khẩu đến: \${email}\`);
      return;
    }

    this.logger.error(\`Lỗi khi gửi email OTP đặt lại mật khẩu đến \${email}:\`, result.reason ?? "unknown error");
  }`;

if (service.includes(oldSendLink)) {
  service = service.replace(oldSendLink, newSendOtp);
  console.log('sendPasswordResetLink → sendPasswordResetOtp patched');
} else {
  console.log('sendPasswordResetLink not found, possibly already patched');
}

// 2f. loginWithGoogle - add isNewUser
service = service.replace(
  `  async loginWithGoogle(input: GoogleLoginInput) {\n    const googleToken = await this.verifyGoogleIdToken(input.idToken);\n    const normalizedEmail = googleToken.email!.trim().toLowerCase();\n    const user = await this.findOrProvisionGoogleUser(googleToken, normalizedEmail);\n\n    return ok(await this.buildLoginSession(user));\n  }`,
  `  async loginWithGoogle(input: GoogleLoginInput) {\n    const googleToken = await this.verifyGoogleIdToken(input.idToken);\n    const normalizedEmail = googleToken.email!.trim().toLowerCase();\n    const { user, isNewUser } = await this.findOrProvisionGoogleUser(googleToken, normalizedEmail);\n\n    return ok({ ...(await this.buildLoginSession(user)), isNewUser });\n  }`
);

// 2g. findOrProvisionGoogleUser - new user branch
service = service.replace(
  `      return this.prisma.userAccount.create({\n        data: {\n          email,\n          passwordHash,\n          role: "customer",\n          isActive: true,\n          isEmailVerified: true,\n          profile: {\n            create: {\n              fullName: displayName,\n            },\n          },\n        },\n        include: { profile: true },\n      });\n    }`,
  `      const user = await this.prisma.userAccount.create({\n        data: {\n          email,\n          passwordHash,\n          role: "customer",\n          isActive: true,\n          isEmailVerified: true,\n          profile: {\n            create: {\n              fullName: displayName,\n            },\n          },\n        },\n        include: { profile: true },\n      });\n      return { user, isNewUser: true };\n    }`
);

// 2h. no-update path
service = service.replace(
  `    if (!shouldVerifyEmail && !shouldSyncProfile) {\n      return existingUser;\n    }`,
  `    if (!shouldVerifyEmail && !shouldSyncProfile) {\n      return { user: existingUser, isNewUser: false };\n    }`
);

// 2i. update path
service = service.replace(
  `    return this.prisma.userAccount.update({\n      where: { id: existingUser.id },\n      data: {\n        ...(shouldVerifyEmail\n          ? {\n              isEmailVerified: true,\n              isActive: true,\n              updatedAt: new Date(),\n            }\n          : {}),\n        ...(shouldSyncProfile\n          ? {\n              profile: {\n                upsert: {\n                  create: {\n                    fullName: displayName,\n                  },\n                  update: {\n                    fullName: displayName,\n                  },\n                },\n              },\n            }\n          : {}),\n      },\n      include: { profile: true },\n    });\n  }`,
  `    const updatedUser = await this.prisma.userAccount.update({\n      where: { id: existingUser.id },\n      data: {\n        ...(shouldVerifyEmail\n          ? {\n              isEmailVerified: true,\n              isActive: true,\n              updatedAt: new Date(),\n            }\n          : {}),\n        ...(shouldSyncProfile\n          ? {\n              profile: {\n                upsert: {\n                  create: {\n                    fullName: displayName,\n                  },\n                  update: {\n                    fullName: displayName,\n                  },\n                },\n              },\n            }\n          : {}),\n      },\n      include: { profile: true },\n    });\n    return { user: updatedUser, isNewUser: false };\n  }`
);

service = service.replace(/\n/g, '\r\n');
fs.writeFileSync(servicePath, service, 'utf8');
console.log('auth.service.ts patched with all changes');
