import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import { toAuthenticatedUser, type UserWithProfile } from "./auth-user";

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type VerifyEmailInput = {
  email: string;
  code: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      // Nếu đã tồn tại nhưng chưa xác thực, cho phép gửi lại OTP
      if (!existingUser.isEmailVerified) {
        await this.sendVerificationCode(existingUser.id, normalizedEmail);
        return ok({ email: normalizedEmail, requiresVerification: true }, "Email đã tồn tại nhưng chưa xác thực. Mã OTP mới đã được gửi.");
      }
      throw new BadRequestException("Email này đã được đăng ký.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.userAccount.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "customer",
        isActive: false,
        isEmailVerified: false,
        profile: {
          create: {
            fullName: input.fullName.trim(),
          },
        },
      },
      include: { profile: true },
    });

    await this.sendVerificationCode(user.id, normalizedEmail);

    return ok(
      { email: user.email, requiresVerification: true },
      "Đăng ký thành công! Vui lòng kiểm tra email (hoặc terminal backend) để lấy mã OTP xác thực.",
    );
  }

  async verifyEmail(input: VerifyEmailInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      throw new BadRequestException("Email không tồn tại trong hệ thống.");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email này đã được xác thực rồi.");
    }

    const record = await this.prisma.emailVerificationCode.findFirst({
      where: {
        userId: user.id,
        code: input.code.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    // Đánh dấu OTP đã dùng và kích hoạt tài khoản
    await this.prisma.$transaction([
      this.prisma.emailVerificationCode.update({ where: { id: record.id }, data: { used: true } }),
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: { isEmailVerified: true, isActive: true },
      }),
    ]);

    return ok({ email: user.email }, "Xác thực email thành công! Bạn có thể đăng nhập ngay.");
  }

  async resendVerificationCode(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      throw new BadRequestException("Email không tồn tại trong hệ thống.");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email này đã được xác thực rồi.");
    }

    await this.sendVerificationCode(user.id, normalizedEmail);
    return ok({ email: normalizedEmail }, "Mã OTP mới đã được gửi. Vui lòng kiểm tra email.");
  }

  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException("EMAIL_NOT_VERIFIED");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return ok({
      accessToken,
      user: this.serializeLoginUser(user),
    });
  }

  async me(userId: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User is inactive or no longer exists.");
    }

    return ok(toAuthenticatedUser(user));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async sendVerificationCode(userId: string, email: string) {
    // Vô hiệu hoá tất cả OTP cũ chưa dùng của user này
    await this.prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Tạo mã OTP 6 số
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await this.prisma.emailVerificationCode.create({
      data: { userId, code, expiresAt },
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const transporter = require("nodemailer").createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Cổ Phục ERP" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Mã xác nhận đăng ký tài khoản Cổ Phục ERP",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1f2933;">
            <h2 style="color: #b91c1c; text-align: center; font-family: serif; font-size: 24px; margin-bottom: 24px;">Cổ Phục ERP</h2>
            <p>Chào bạn,</p>
            <p>Bạn vừa yêu cầu đăng ký tài khoản trên hệ thống Cổ Phục ERP. Đây là mã xác thực (OTP) của bạn:</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f766e;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #64748b;">Mã này sẽ hết hạn sau <strong>10 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.</p>
          </div>
        `,
      });
      this.logger.log(`Đã gửi OTP qua email đến: ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email đến ${email}:`, error);
    }
  }

  private serializeLoginUser(user: UserWithProfile) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
