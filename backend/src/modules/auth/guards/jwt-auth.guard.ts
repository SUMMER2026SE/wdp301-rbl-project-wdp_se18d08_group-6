import { CanActivate, Injectable, UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AppRole } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { toAuthenticatedUser, type AuthenticatedUser } from "../auth-user";

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: AppRole;
  tokenType?: "access" | "password-reset";
  iat?: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const token = this.extractBearerToken(request.headers.authorization);

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token.");
    }

    if (payload.tokenType && payload.tokenType !== "access") {
      throw new UnauthorizedException("Invalid token type.");
    }

    if (typeof payload.iat !== "number") {
      throw new UnauthorizedException("Token payload is missing issued-at time.");
    }

    if (!payload.sub) {
      throw new UnauthorizedException("Token payload is missing subject.");
    }

    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User is inactive or no longer exists.");
    }

    if (payload.iat * 1000 < user.updatedAt.getTime()) {
      throw new UnauthorizedException("Token has been invalidated.");
    }

    request.user = toAuthenticatedUser(user);
    return true;
  }

  private extractBearerToken(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Missing authorization token.");
    }

    const [scheme, token] = authorizationHeader.trim().split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization header.");
    }

    return token;
  }
}
