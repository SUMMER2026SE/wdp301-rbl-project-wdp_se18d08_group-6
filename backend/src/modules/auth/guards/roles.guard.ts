import { CanActivate, ForbiddenException, Injectable, UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import type { AppRole } from "@prisma/client";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedUser } from "../auth-user";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!request.user) {
      throw new UnauthorizedException("Authentication is required.");
    }

    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException("You do not have permission to access this resource.");
    }

    return true;
  }
}
