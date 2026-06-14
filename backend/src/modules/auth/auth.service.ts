import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new BadRequestException("Email is already registered.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.userAccount.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "customer",
        profile: {
          create: {
            fullName: input.fullName.trim(),
          },
        },
      },
      include: { profile: true },
    });

    return ok({
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName ?? null,
      role: user.role,
    });
  }

  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.prisma.userAccount.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
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

  private serializeLoginUser(user: UserWithProfile) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
