import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";
import { UpdateNotificationSettingsDto } from "./dto/update-notification-settings.dto";
import { SendTestNotificationDto } from "./dto/send-test-notification.dto";
import { UpdateNotificationTemplatesDto } from "./dto/update-notification-templates.dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser, @Query("limit") limit?: string) {
    const parsedLimit = Number(limit);
    return this.notificationsService.getMyNotifications(
      user.id,
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50,
    );
  }

  @Patch("me/read-all")
  @UseGuards(JwtAuthGuard)
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch("me/:id/read")
  @UseGuards(JwtAuthGuard)
  markRead(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Get("me/preferences")
  @UseGuards(JwtAuthGuard)
  preferences(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Put("me/preferences")
  @UseGuards(JwtAuthGuard)
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateNotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(user.id, body);
  }

  @Get("admin/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  getSettings() {
    return this.notificationsService.getSettings();
  }

  @Put("admin/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  updateSettings(@Body() body: UpdateNotificationSettingsDto) {
    return this.notificationsService.updateSettings(body);
  }

  @Get("admin/templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Put("admin/templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  updateTemplates(@Body() body: UpdateNotificationTemplatesDto) {
    return this.notificationsService.updateTemplates(body.templates);
  }

  @Get("admin/logs")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  getLogs(@Query("limit") limit?: string) {
    const parsedLimit = Number(limit);
    return this.notificationsService.getLogs(Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50);
  }

  @Post("admin/test-email")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  sendTest(@Body() body: SendTestNotificationDto) {
    return this.notificationsService.sendTestEmail({
      email: body.email,
      templateKey: body.templateKey,
      data: body.data ?? {
        recipientName: body.recipientName,
        sentAt: new Date().toISOString(),
      },
    });
  }
}
