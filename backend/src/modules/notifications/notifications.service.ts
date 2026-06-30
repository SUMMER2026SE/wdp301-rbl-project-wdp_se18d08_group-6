import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Notification as NotificationRow, Prisma } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";
import type { UpdateNotificationSettingsDto } from "./dto/update-notification-settings.dto";

export type NotificationChannel = "email" | "inApp";

export type NotificationTemplate = {
  subject: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  enabled: boolean;
};

export type NotificationTemplateMap = Record<string, NotificationTemplate>;

export type NotificationSettings = {
  provider: "mock" | "smtp";
  smtp: {
    service: string | null;
    host: string | null;
    port: number | null;
    secure: boolean;
    user: string | null;
    password: string | null;
    fromEmail: string | null;
    fromName: string | null;
    replyTo: string | null;
  };
};

export type NotificationPreferences = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  bookingUpdatesEnabled: boolean;
  paymentUpdatesEnabled: boolean;
  reminderEnabled: boolean;
  marketingEnabled: boolean;
};

export type NotificationSendStatus = {
  status: "sent" | "skipped" | "failed";
  provider: "smtp" | "mock";
  reason?: string;
};

const SETTINGS_KEY = "notification:settings";
const TEMPLATES_KEY = "notification:templates";
const DEFAULT_CHANNELS: NotificationChannel[] = ["inApp", "email"];

const DEFAULT_TEMPLATES: NotificationTemplateMap = {
  "auth.verification_code": {
    subject: "Mã xác nhận tài khoản Cổ Phục ERP",
    title: "Xác thực tài khoản",
    body: "Xin chào {{recipientName}},\nMã OTP của bạn là {{code}}. Mã này hết hạn sau {{expiresIn}} phút.",
    channels: ["email"],
    enabled: true,
  },
  "auth.password_reset": {
    subject: "Đặt lại mật khẩu Cổ Phục ERP",
    title: "Đặt lại mật khẩu",
    body: "Xin chào {{recipientName}},\nMã OTP đặt lại mật khẩu của bạn là {{code}}. Mã này hết hạn sau {{expiresIn}} phút.",
    channels: ["email"],
    enabled: true,
  },
  "booking.created": {
    subject: "Đơn thuê mới đã được tạo",
    title: "Đơn thuê mới",
    body: "Đơn thuê {{bookingId}} đã được tạo cho {{garmentName}} từ {{startDate}} đến {{endDate}}.",
    channels: ["inApp", "email"],
    enabled: true,
  },
  "booking.status_changed": {
    subject: "Trạng thái đơn thuê đã thay đổi",
    title: "Cập nhật đơn thuê",
    body: "Đơn thuê {{bookingId}} đã chuyển sang trạng thái {{statusLabel}}. Ghi chú: {{note}}",
    channels: ["inApp", "email"],
    enabled: true,
  },
  "booking.payment_received": {
    subject: "Đã ghi nhận thanh toán",
    title: "Thanh toán thành công",
    body: "Đơn thuê {{bookingId}} đã được ghi nhận thanh toán với tổng số tiền {{amount}}.",
    channels: ["inApp", "email"],
    enabled: true,
  },
  "booking.cancelled": {
    subject: "Đơn thuê đã bị hủy",
    title: "Đơn thuê bị hủy",
    body: "Đơn thuê {{bookingId}} đã bị hủy. {{note}}",
    channels: ["inApp", "email"],
    enabled: true,
  },
  "notification.test": {
    subject: "Kiểm tra Notification Service",
    title: "Thông báo kiểm tra",
    body: "Đây là bản gửi thử từ Notification Service tại {{sentAt}}.",
    channels: ["email"],
    enabled: true,
  },
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  bookingUpdatesEnabled: true,
  paymentUpdatesEnabled: true,
  reminderEnabled: true,
  marketingEnabled: false,
};

@Injectable()
export class NotificationsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getMyNotifications(userId: string, limit = 50) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { OR: [{ userId }, { userId: null }] },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return ok({
      unreadCount,
      notifications: items.map((item) => this.serializeNotification(item)),
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found.");
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt ?? new Date() },
    });

    return ok(this.serializeNotification(updated));
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return ok({ updatedCount: result.count });
  }

  async getPreferences(userId: string) {
    return ok(await this.loadPreferences(userId));
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const current = await this.loadPreferences(userId);
    const next: NotificationPreferences = {
      emailEnabled: dto.emailEnabled ?? current.emailEnabled,
      inAppEnabled: dto.inAppEnabled ?? current.inAppEnabled,
      bookingUpdatesEnabled: dto.bookingUpdatesEnabled ?? current.bookingUpdatesEnabled,
      paymentUpdatesEnabled: dto.paymentUpdatesEnabled ?? current.paymentUpdatesEnabled,
      reminderEnabled: dto.reminderEnabled ?? current.reminderEnabled,
      marketingEnabled: dto.marketingEnabled ?? current.marketingEnabled,
    };

    await this.saveSetting(this.preferenceKey(userId), next);
    return ok(next, "Notification preferences updated.");
  }

  async getSettings() {
    return ok(this.sanitizeSettings(await this.loadSettings()));
  }

  async updateSettings(dto: UpdateNotificationSettingsDto) {
    const current = await this.loadSettings();
    const next: NotificationSettings = {
      provider: dto.provider ?? current.provider,
      smtp: {
        service: dto.smtpService ?? current.smtp.service,
        host: dto.smtpHost ?? current.smtp.host,
        port: dto.smtpPort ?? current.smtp.port,
        secure: dto.smtpSecure ?? current.smtp.secure,
        user: dto.smtpUser ?? current.smtp.user,
        password: dto.smtpPassword ?? current.smtp.password,
        fromEmail: dto.fromEmail ?? current.smtp.fromEmail,
        fromName: dto.fromName ?? current.smtp.fromName,
        replyTo: dto.replyTo ?? current.smtp.replyTo,
      },
    };

    await this.saveSetting(SETTINGS_KEY, next);
    await this.recordLog("notification.settings.updated", "system_setting", null, {
      provider: next.provider,
    });

    return ok(this.sanitizeSettings(next), "Notification settings updated.");
  }

  async getTemplates() {
    return ok(await this.loadTemplates());
  }

  async updateTemplates(templates: Record<string, unknown>) {
    const current = await this.loadTemplates();
    const next: NotificationTemplateMap = { ...current };

    for (const [key, value] of Object.entries(templates)) {
      next[key] = this.normalizeTemplate(key, value, current[key]);
    }

    await this.saveSetting(TEMPLATES_KEY, next);
    await this.recordLog("notification.templates.updated", "system_setting", null, {
      templateCount: Object.keys(next).length,
    });

    return ok(next, "Notification templates updated.");
  }

  async getLogs(limit = 50) {
    const logs = await this.prisma.auditLog.findMany({
      where: { action: { startsWith: "notification." } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return ok(
      logs.map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        metadata: item.metadata,
        createdAt: item.createdAt.toISOString(),
        actorId: item.actorId,
      })),
    );
  }

  async sendTemplateEmail(input: {
    email: string;
    templateKey: string;
    data?: Record<string, unknown>;
  }): Promise<NotificationSendStatus> {
    const templates = await this.loadTemplates();
    const template = templates[input.templateKey] ?? this.fallbackTemplate(input.templateKey);
    return this.sendEmail(template, input.email, {
      ...(input.data ?? {}),
      recipientEmail: input.email,
      sentAt: new Date().toISOString(),
    }, input.templateKey);
  }

  async notifyUser(input: {
    userId?: string;
    email?: string;
    templateKey: string;
    data?: Record<string, unknown>;
    persistInApp?: boolean;
    channels?: NotificationChannel[];
  }) {
    const templates = await this.loadTemplates();
    const template = templates[input.templateKey] ?? this.fallbackTemplate(input.templateKey);
    const user = input.userId
      ? await this.prisma.userAccount.findUnique({
          where: { id: input.userId },
          select: { id: true, email: true, profile: { select: { fullName: true } } },
        })
      : null;
    const data = this.composeTemplateData(user, input.templateKey, input.data ?? {});
    const preferences = input.userId ? await this.loadPreferences(input.userId) : DEFAULT_PREFERENCES;
    const requestedChannels = input.channels ?? template.channels ?? DEFAULT_CHANNELS;
    const activeChannels = requestedChannels.filter((channel) => {
      if (channel === "email") return preferences.emailEnabled;
      if (channel === "inApp") return preferences.inAppEnabled && input.persistInApp !== false;
      return true;
    });
    const email = input.email ?? user?.email ?? null;

    let notificationRow: NotificationRow | null = null;
    if (activeChannels.includes("inApp") && input.userId) {
      notificationRow = await this.prisma.notification.create({
        data: {
          userId: input.userId,
          title: this.render(template.title, data),
          body: this.render(template.body, data),
        },
      });
    }

    let emailStatus: NotificationSendStatus | null = null;
    if (activeChannels.includes("email") && email) {
      emailStatus = await this.sendEmail(template, email, data, input.templateKey);
    }

    await this.recordLog(
      emailStatus?.status === "failed" ? "notification.failed" : "notification.sent",
      "notification",
      notificationRow?.id ?? null,
      {
        templateKey: input.templateKey,
        userId: input.userId ?? null,
        email,
        channels: activeChannels,
        emailStatus,
      },
    );

    return ok({
      templateKey: input.templateKey,
      channels: activeChannels,
      notificationId: notificationRow?.id ?? null,
      emailStatus,
    });
  }

  async sendBookingNotification(input: {
    userId: string;
    templateKey: "booking.created" | "booking.status_changed" | "booking.payment_received" | "booking.cancelled";
    bookingId: string;
    garmentName?: string | null;
    startDate?: string;
    endDate?: string;
    statusLabel?: string;
    note?: string | null;
    amount?: string | number;
  }) {
    return this.notifyUser({
      userId: input.userId,
      templateKey: input.templateKey,
      data: {
        bookingId: input.bookingId,
        garmentName: input.garmentName ?? "trang phục",
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        statusLabel: input.statusLabel ?? null,
        note: input.note ?? null,
        amount: input.amount ?? null,
      },
    });
  }

  async sendAuthVerificationEmail(input: { email: string; recipientName?: string | null; code: string; expiresIn: number; }) {
    return this.sendTemplateEmail({
      email: input.email,
      templateKey: "auth.verification_code",
      data: {
        recipientName: input.recipientName ?? input.email,
        code: input.code,
        expiresIn: input.expiresIn,
      },
    });
  }

  async sendPasswordResetEmail(input: { email: string; recipientName?: string | null; code: string; expiresIn: number; }) {
    return this.sendTemplateEmail({
      email: input.email,
      templateKey: "auth.password_reset",
      data: {
        recipientName: input.recipientName ?? input.email,
        code: input.code,
        expiresIn: input.expiresIn,
      },
    });
  }

  async sendTestEmail(input: { email: string; templateKey: string; data?: Record<string, unknown> }) {
    return this.sendTemplateEmail(input);
  }

  private async sendEmail(
    template: NotificationTemplate,
    email: string,
    data: Record<string, unknown>,
    templateKey: string,
  ): Promise<NotificationSendStatus> {
    const settings = await this.loadSettings();

    if (settings.provider !== "smtp") {
      return { status: "skipped", provider: "mock", reason: "provider-mock" };
    }

    const username = settings.smtp.user ?? this.configService.get<string>("SMTP_EMAIL") ?? "";
    const password = settings.smtp.password ?? this.configService.get<string>("SMTP_PASSWORD") ?? "";
    if (!username || !password) {
      return { status: "skipped", provider: "smtp", reason: "smtp-not-configured" };
    }

    const transporter = nodemailer.createTransport(
      settings.smtp.service
        ? {
            service: settings.smtp.service,
            auth: { user: username, pass: password },
          }
        : {
            host: settings.smtp.host ?? "smtp.gmail.com",
            port: settings.smtp.port ?? 587,
            secure: settings.smtp.secure,
            auth: { user: username, pass: password },
          },
    );

    try {
      await transporter.sendMail({
        from: `"${settings.smtp.fromName ?? "Cổ Phục ERP"}" <${settings.smtp.fromEmail ?? username}>`,
        to: email,
        subject: this.render(template.subject, data),
        html: this.wrapEmailHtml(template.title, this.render(template.body, data).replace(/\n/g, "<br />")),
        replyTo: settings.smtp.replyTo ?? undefined,
      });

      return { status: "sent", provider: "smtp" };
    } catch (error) {
      await this.recordLog("notification.failed", "notification", null, {
        templateKey,
        email,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        status: "failed",
        provider: "smtp",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async loadSettings(): Promise<NotificationSettings> {
    const stored = await this.loadSetting<Partial<NotificationSettings>>(SETTINGS_KEY);
    return {
      provider: stored?.provider ?? (this.hasSmtpEnv() ? "smtp" : "mock"),
      smtp: {
        service: stored?.smtp?.service ?? null,
        host: stored?.smtp?.host ?? null,
        port: stored?.smtp?.port ?? null,
        secure: stored?.smtp?.secure ?? false,
        user: stored?.smtp?.user ?? this.configService.get<string>("SMTP_EMAIL") ?? null,
        password: stored?.smtp?.password ?? this.configService.get<string>("SMTP_PASSWORD") ?? null,
        fromEmail: stored?.smtp?.fromEmail ?? this.configService.get<string>("SMTP_EMAIL") ?? null,
        fromName: stored?.smtp?.fromName ?? "Cổ Phục ERP",
        replyTo: stored?.smtp?.replyTo ?? null,
      },
    };
  }

  private sanitizeSettings(settings: NotificationSettings) {
    return {
      provider: settings.provider,
      smtp: {
        service: settings.smtp.service,
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: settings.smtp.secure,
        user: settings.smtp.user,
        fromEmail: settings.smtp.fromEmail,
        fromName: settings.smtp.fromName,
        replyTo: settings.smtp.replyTo,
        passwordConfigured: Boolean(settings.smtp.password),
      },
    };
  }

  private async loadTemplates(): Promise<NotificationTemplateMap> {
    const stored = await this.loadSetting<Record<string, NotificationTemplate>>(TEMPLATES_KEY);
    return { ...DEFAULT_TEMPLATES, ...(stored ?? {}) };
  }

  private async loadPreferences(userId: string): Promise<NotificationPreferences> {
    const stored = await this.loadSetting<Partial<NotificationPreferences>>(this.preferenceKey(userId));
    return {
      emailEnabled: stored?.emailEnabled ?? DEFAULT_PREFERENCES.emailEnabled,
      inAppEnabled: stored?.inAppEnabled ?? DEFAULT_PREFERENCES.inAppEnabled,
      bookingUpdatesEnabled: stored?.bookingUpdatesEnabled ?? DEFAULT_PREFERENCES.bookingUpdatesEnabled,
      paymentUpdatesEnabled: stored?.paymentUpdatesEnabled ?? DEFAULT_PREFERENCES.paymentUpdatesEnabled,
      reminderEnabled: stored?.reminderEnabled ?? DEFAULT_PREFERENCES.reminderEnabled,
      marketingEnabled: stored?.marketingEnabled ?? DEFAULT_PREFERENCES.marketingEnabled,
    };
  }

  private async loadSetting<T>(key: string): Promise<T | null> {
    const record = await this.prisma.systemSetting.findUnique({ where: { key } });
    return (record?.value as T | null) ?? null;
  }

  private async saveSetting(key: string, value: unknown) {
    await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue, updatedAt: new Date() },
      update: { value: value as Prisma.InputJsonValue, updatedAt: new Date() },
    });
  }

  private async recordLog(action: string, entityType: string, entityId: string | null, metadata: Prisma.InputJsonValue) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  }

  private serializeNotification(notification: NotificationRow) {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      isRead: Boolean(notification.readAt),
    };
  }

  private normalizeTemplate(
    key: string,
    value: unknown,
    current?: NotificationTemplate,
  ): NotificationTemplate {
    const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
    const channels = Array.isArray(source.channels)
      ? source.channels.filter((item): item is NotificationChannel => item === "email" || item === "inApp")
      : current?.channels ?? DEFAULT_CHANNELS;

    return {
      subject: typeof source.subject === "string" ? source.subject : current?.subject ?? key,
      title: typeof source.title === "string" ? source.title : current?.title ?? key,
      body: typeof source.body === "string" ? source.body : current?.body ?? "",
      channels,
      enabled: typeof source.enabled === "boolean" ? source.enabled : current?.enabled ?? true,
    };
  }

  private fallbackTemplate(key: string): NotificationTemplate {
    return {
      subject: key,
      title: key,
      body: "{{message}}",
      channels: DEFAULT_CHANNELS,
      enabled: true,
    };
  }

  private composeTemplateData(
    user: { id: string; email: string; profile: { fullName: string | null } | null } | null,
    templateKey: string,
    data: Record<string, unknown>,
  ) {
    return {
      ...data,
      templateKey,
      recipientName: data.recipientName ?? user?.profile?.fullName ?? user?.email ?? data.recipientEmail ?? "bạn",
      recipientEmail: data.recipientEmail ?? user?.email ?? null,
    };
  }

  private render(input: string, data: Record<string, unknown>) {
    return input.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, rawKey: string) => {
      const value = rawKey.split(".").reduce<unknown>((current, part) => {
        if (current && typeof current === "object") {
          return (current as Record<string, unknown>)[part];
        }
        return undefined;
      }, data);

      return value === undefined || value === null ? "" : String(value);
    });
  }

  private wrapEmailHtml(title: string, body: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1f2937; background: #fff;">
        <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b0000; font-weight: 700; margin-bottom: 12px;">Cổ Phục ERP</div>
        <h1 style="font-size: 22px; margin: 0 0 16px; color: #111827;">${title}</h1>
        <div style="font-size: 14px; line-height: 1.7; color: #374151;">${body}</div>
      </div>
    `;
  }

  private hasSmtpEnv() {
    return Boolean(this.configService.get<string>("SMTP_EMAIL") && this.configService.get<string>("SMTP_PASSWORD"));
  }

  private preferenceKey(userId: string) {
    return `notification:preferences:${userId}`;
  }
}

