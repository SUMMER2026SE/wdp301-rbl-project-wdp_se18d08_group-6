import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminAuditLogQueryDto } from "./dto/admin-audit-log-query.dto";
import { AdminUserQueryDto } from "./dto/admin-user-query.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";
import { UpdateSystemSettingDto } from "./dto/update-system-setting.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("users")
  listUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch("users/:id")
  updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(id, actor, dto);
  }

  @Get("audit-logs")
  listAuditLogs(@Query() query: AdminAuditLogQueryDto) {
    return this.adminService.listAuditLogs(query);
  }

  @Get("settings")
  listSettings() {
    return this.adminService.listSettings();
  }

  @Patch("settings/:key")
  updateSetting(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("key") key: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    return this.adminService.updateSetting(key, actor, dto);
  }
}
