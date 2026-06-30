const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace types safely using a regex matching the old types precisely.
const typeRegex = /type ForgotPasswordInput = \{[\s\S]*?type GoogleJwtHeader = \{/m;
const newTypes = `type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  email: string;
  otp: string;
  password: string;
};

type GoogleJwtHeader = {`;
content = content.replace(typeRegex, newTypes);

// 2. Update forgotPassword
content = content.replace(
  `await this.sendPasswordResetLink(user.id, normalizedEmail);`,
  `await this.sendPasswordResetOtp(user.id, normalizedEmail);`
);

// Update forgotPassword message to say OTP instead of link
content = content.replace(
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.",`,
  `"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP đặt lại mật khẩu.",`
);

// 3. Replace resetPassword completely
const resetPasswordStart = content.indexOf('  async resetPassword(input: ResetPasswordInput) {');
const resetPasswordEnd = content.indexOf('  async login(input: LoginInput) {');
if (resetPasswordStart !== -1 && resetPasswordEnd !== -1) {
  const newResetPassword = `  async resetPassword(input: ResetPasswordInput) {
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
  }

`;
  content = content.slice(0, resetPasswordStart) + newResetPassword + content.slice(resetPasswordEnd);
}

// 4. Replace sendPasswordResetLink and verifyPasswordResetToken with sendPasswordResetOtp
const sendLinkStart = content.indexOf('  private async sendPasswordResetLink(userId: string, email: string) {');
const verifyGoogleStart = content.indexOf('  private async verifyGoogleIdToken(idToken: string) {');

if (sendLinkStart !== -1 && verifyGoogleStart !== -1) {
  const newSendOtp = `  private async sendPasswordResetOtp(userId: string, email: string) {
    await this.prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    const code = Math.floor(100_000 + Math.random() * 900_000).toString();

    if (process.env.NODE_ENV !== "production") {
      this.logger.log(\`DEV password reset OTP for \${email}: \${code}\`);
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
  }

`;
  content = content.slice(0, sendLinkStart) + newSendOtp + content.slice(verifyGoogleStart);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated auth.service.ts via Node.js script.");
