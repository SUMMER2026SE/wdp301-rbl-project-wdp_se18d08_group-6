import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import type { AppRole } from "@prisma/client";
import type { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { PrismaService } from "../../prisma/prisma.service";

interface JwtPayload {
  sub?: string;
  role?: AppRole;
}

interface AuthSocket extends Socket {
  data: {
    user?: {
      userId: string;
      role: AppRole;
      fullName: string;
    };
  };
}

interface ActiveReplier {
  staffId: string;
  name: string;
  socketId: string;
  lockedAt: Date;
}

@WebSocketGateway({
  namespace: "/chat",
  cors: {
    origin: true,
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly onlineUsers = new Map<string, string>();
  private readonly activeReplier = new Map<string, ActiveReplier>();
  private readonly lockTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly disconnectReleaseTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly messageRateLimits = new Map<string, number[]>();
  private static readonly MAX_MESSAGE_LENGTH = 2000;
  private static readonly RATE_LIMIT_MAX = 5;
  private static readonly RATE_LIMIT_WINDOW_MS = 10_000;

  private isProductCardPayload(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      return parsed?.type === "product_card";
    } catch {
      return false;
    }
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.messageRateLimits.get(userId) ?? [];
    const recent = timestamps.filter((ts) => now - ts < ChatGateway.RATE_LIMIT_WINDOW_MS);
    if (recent.length >= ChatGateway.RATE_LIMIT_MAX) {
      return false;
    }
    recent.push(now);
    this.messageRateLimits.set(userId, recent);
    return true;
  }

  private cleanupRateLimits() {
    const now = Date.now();
    for (const [userId, timestamps] of this.messageRateLimits) {
      const recent = timestamps.filter((ts) => now - ts < ChatGateway.RATE_LIMIT_WINDOW_MS);
      if (recent.length === 0) {
        this.messageRateLimits.delete(userId);
      } else {
        this.messageRateLimits.set(userId, recent);
      }
    }
  }

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthSocket) {
    const token = this.getTokenFromHandshake(client);
    if (!token) {
      client.disconnect();
      return;
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      client.disconnect();
      return;
    }

    if (!payload?.sub || !payload?.role) {
      client.disconnect();
      return;
    }

    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      client.disconnect();
      return;
    }

    const fullName = user.profile?.fullName ?? user.email;
    const dbRole = user.role;
    client.data.user = {
      userId: user.id,
      role: dbRole,
      fullName,
    };

    this.onlineUsers.set(user.id, client.id);
    if (dbRole === "staff") {
      client.join("staff");
    } else {
      client.join("customers");
    }
  }

  handleDisconnect(client: AuthSocket) {
    const user = client.data.user;
    if (!user) {
      return;
    }

    const currentSocket = this.onlineUsers.get(user.userId);
    if (currentSocket === client.id) {
      this.onlineUsers.delete(user.userId);
    }

    if (user.role === "staff") {
      this.scheduleStaffDisconnectRelease(client.id);
    }
  }

  @SubscribeMessage("join_room")
  async handleJoinRoom(@MessageBody() body: { conversationId: string }, @ConnectedSocket() client: AuthSocket) {
    if (!body?.conversationId) {
      return;
    }

    const user = client.data.user;
    if (!user) {
      return;
    }

    try {
      await this.chatService.ensureCustomerOrStaffParticipant({
        id: user.userId,
        email: "",
        role: user.role,
        isActive: true,
        fullName: user.fullName,
        phone: null,
      }, body.conversationId);
    } catch {
      return;
    }

    client.join(body.conversationId);
  }

  @SubscribeMessage("open_conversation")
  async handleOpenConversation(@MessageBody() body: { conversationId: string }, @ConnectedSocket() client: AuthSocket) {
    const user = client.data.user;
    if (!user || user.role !== "staff" || !body?.conversationId) {
      client.emit("open_conversation_result", { conversationId: body?.conversationId, canReply: false, reason: "unauthorized" });
      return;
    }

    let conversation;
    try {
      conversation = await this.chatService.getConversationById(body.conversationId);
    } catch {
      client.emit("open_conversation_result", { conversationId: body.conversationId, canReply: false, reason: "not_found" });
      return;
    }

    if (conversation.staff_id && conversation.staff_id !== user.userId) {
      client.emit("open_conversation_result", { conversationId: body.conversationId, canReply: false, lockedBy: "nhân viên khác" });
      return;
    }

    if (!conversation.staff_id) {
      conversation = await this.chatService.assignStaffToConversationIfEmpty(body.conversationId, user.userId);
      if (conversation.staff_id !== user.userId) {
        client.emit("open_conversation_result", { conversationId: body.conversationId, canReply: false, lockedBy: "nhân viên khác" });
        return;
      }
    }

    const existingLock = this.activeReplier.get(body.conversationId);
    if (existingLock?.staffId === user.userId) {
      this.clearDisconnectReleaseForSocket(existingLock.socketId);
    }
    this.clearDisconnectReleaseForSocket(client.id);

    const lockInfo: ActiveReplier = {
      staffId: user.userId,
      name: user.fullName,
      socketId: client.id,
      lockedAt: existingLock?.staffId === user.userId ? existingLock.lockedAt : new Date(),
    };

    this.activeReplier.set(body.conversationId, lockInfo);
    if (!existingLock || existingLock.staffId !== user.userId) {
      this.scheduleLockExpiration(body.conversationId);
    }

    client.emit("open_conversation_result", {
      conversationId: body.conversationId,
      canReply: true,
      staffId: user.userId,
      staffName: user.fullName,
      status: conversation.status,
    });
    client.broadcast.to("staff").emit("chat_locked", {
      conversationId: body.conversationId,
      staffName: user.fullName,
    });
  }

  @SubscribeMessage("delete_message")
  async handleDeleteMessage(
    @MessageBody() body: { conversationId: string; messageId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const user = client.data.user;
    if (!user || !body?.conversationId || !body?.messageId) {
      return;
    }

    try {
      await this.chatService.deleteMessage(user.userId, user.role, body.messageId);
      this.server.to(body.conversationId).emit("message_deleted", {
        conversationId: body.conversationId,
        messageId: body.messageId,
        deletedBy: user.userId,
      });
    } catch {
      client.emit("delete_error", { conversationId: body.conversationId, messageId: body.messageId, reason: "cannot_delete" });
    }
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @MessageBody() body: { conversationId: string; content: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const user = client.data.user;
    if (!user || !body?.conversationId || !body?.content?.trim()) {
      return;
    }

    const content = body.content.trim();

    // Validate message length (max 2000 characters)
    if (content.length > ChatGateway.MAX_MESSAGE_LENGTH) {
      client.emit("send_error", {
        conversationId: body.conversationId,
        reason: "message_too_long",
      });
      return;
    }

    // Reject direct client attempts to send product_card payloads
    if (this.isProductCardPayload(content)) {
      client.emit("send_error", {
        conversationId: body.conversationId,
        reason: "forbidden_payload",
      });
      return;
    }

    // Rate limiting: max 5 messages per 10 seconds per user
    if (!this.checkRateLimit(user.userId)) {
      client.emit("send_error", {
        conversationId: body.conversationId,
        reason: "rate_limited",
      });
      return;
    }

    if (user.role === "staff") {
      const conversation = await this.chatService.getConversationById(body.conversationId);
      if (conversation.staff_id !== user.userId) {
        client.emit("send_error", { conversationId: body.conversationId, reason: "conversation_locked" });
        return;
      }

      this.activeReplier.set(body.conversationId, {
        staffId: user.userId,
        name: user.fullName,
        socketId: client.id,
        lockedAt: new Date(),
      });
      this.scheduleLockExpiration(body.conversationId);
    }

    const message = await this.chatService.sendMessage(user.userId, user.role, body.conversationId, body.content);
    this.server.to(body.conversationId).emit("message_received", {
      conversationId: body.conversationId,
      message,
    });

    if (user.role === "customer") {
      const conversation = await this.chatService.getConversationById(body.conversationId);
      if (!conversation.staff_id && conversation.status === "open") {
        this.server.to("staff").emit("new_unassigned_message", {
          conversationId: body.conversationId,
          customerName: user.fullName,
          content: body.content,
        });
      }
    }
  }

  @SubscribeMessage("resolve_conversation")
  async handleResolveConversation(@MessageBody() body: { conversationId: string }, @ConnectedSocket() client: AuthSocket) {
    const user = client.data.user;
    if (!user || user.role !== "staff" || !body?.conversationId) {
      return;
    }

    try {
      const conversation = await this.chatService.resolveConversation(body.conversationId, user.userId);
      this.clearActiveLock(body.conversationId);
      this.server.to(body.conversationId).emit("conversation_resolved", {
        conversationId: body.conversationId,
        status: conversation.status,
      });
      this.server.to("staff").emit("chat_unlocked", { conversationId: body.conversationId });
    } catch {
      client.emit("resolve_error", { conversationId: body.conversationId, reason: "cannot_resolve" });
    }
  }

  @SubscribeMessage("read_conversation")
  async handleReadConversation(
    @MessageBody() body: { conversationId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const user = client.data.user;
    if (!user || !body?.conversationId) {
      return;
    }

    await this.chatService.markConversationRead(user.userId, user.role, body.conversationId);
    this.server.to(body.conversationId).emit("conversation_read", {
      conversationId: body.conversationId,
      readerId: user.userId,
    });
  }

  @SubscribeMessage("typing")
  async handleTyping(
    @MessageBody() body: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthSocket,
  ) {
    const user = client.data.user;
    if (!user || !body?.conversationId || typeof body.isTyping !== "boolean") {
      return;
    }

    this.server.to(body.conversationId).emit("typing", {
      conversationId: body.conversationId,
      isTyping: body.isTyping,
      userId: user.userId,
    });
  }

  getLockStatus(conversationId: string) {
    const activeLock = this.activeReplier.get(conversationId);
    if (!activeLock) {
      return {
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        expiresAt: null,
      };
    }

    const expiresAt = new Date(activeLock.lockedAt.getTime() + 20 * 60 * 1000);
    return {
      isLocked: true,
      lockedBy: { staffId: activeLock.staffId, name: activeLock.name },
      lockedAt: activeLock.lockedAt,
      expiresAt,
    };
  }

  private scheduleStaffDisconnectRelease(socketId: string) {
    const existing = this.disconnectReleaseTimeouts.get(socketId);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      this.disconnectReleaseTimeouts.delete(socketId);
      this.releaseStaffLocksBySocket(socketId);
    }, 30 * 1000);
    this.disconnectReleaseTimeouts.set(socketId, timeout);
  }

  private clearDisconnectReleaseForSocket(socketId: string) {
    const timeout = this.disconnectReleaseTimeouts.get(socketId);
    if (!timeout) {
      return;
    }

    clearTimeout(timeout);
    this.disconnectReleaseTimeouts.delete(socketId);
  }

  private releaseStaffLocksBySocket(socketId: string) {
    const locksToRelease = Array.from(this.activeReplier.entries())
      .filter(([, lock]) => lock.socketId === socketId)
      .map(([conversationId]) => conversationId);

    locksToRelease.forEach((conversationId) => this.releaseLock(conversationId));
  }

  private clearActiveLock(conversationId: string) {
    this.activeReplier.delete(conversationId);
    const timeout = this.lockTimeouts.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.lockTimeouts.delete(conversationId);
    }
  }

  private releaseLock(conversationId: string) {
    const lock = this.activeReplier.get(conversationId);
    if (!lock) {
      return;
    }

    this.clearActiveLock(conversationId);
    void this.chatService.releaseStaffAssignment(conversationId, lock.staffId);
    this.server?.to("staff").emit("chat_unlocked", { conversationId });
  }

  private scheduleLockExpiration(conversationId: string) {
    const existingTimeout = this.lockTimeouts.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      const lock = this.activeReplier.get(conversationId);
      if (!lock) {
        return;
      }

      this.releaseLock(conversationId);
      if (this.server) {
        const holdingSocket = this.server.sockets?.sockets?.get?.(lock.socketId) ?? null;
        if (holdingSocket) {
          holdingSocket.emit("lock_expired", { conversationId });
        }
      }
    }, 20 * 60 * 1000);

    this.lockTimeouts.set(conversationId, timeout);
  }

  private getTokenFromHandshake(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim().length > 0) {
      return authToken.replace(/^Bearer\s+/i, "").trim();
    }

    const authorizationHeader = client.handshake.headers?.authorization as string | undefined;
    if (!authorizationHeader) {
      return undefined;
    }

    const [scheme, token] = authorizationHeader.trim().split(" ");
    if (scheme !== "Bearer" || !token) {
      return undefined;
    }

    return token;
  }
}