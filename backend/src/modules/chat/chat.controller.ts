import { Body, Controller, DefaultValuePipe, ForbiddenException, Get, ParseIntPipe, ParseUUIDPipe, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/auth-user";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { ok } from "../../common/api-response";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get("conversations")
  async listConversations(@CurrentUser() user: AuthenticatedUser) {
    return ok(await this.chatService.listConversations(user));
  }

  @Get("conversations/me")
  async getMyConversation(@CurrentUser() user: AuthenticatedUser) {
    if (user.role !== "customer") {
      throw new ForbiddenException("Only customers can access their own chat conversation this way.");
    }

    return ok(await this.chatService.getOrCreateConversationForCustomer(user.id));
  }

  @Get("conversations/:id/messages")
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) conversationId: string,
    @Query("before") before?: string,
    @Query("limit", new DefaultValuePipe(15), ParseIntPipe) limit = 15,
  ) {
    return ok(await this.chatService.getMessages(user, conversationId, before, limit));
  }

  @Get("conversations/:id/lock-status")
  async getLockStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) conversationId: string,
  ) {
    const conversation = await this.chatService.getConversationById(conversationId);
    if (user.role === "customer") {
      if (conversation.customer_id !== user.id) {
        throw new ForbiddenException("You do not have permission to view lock status for this conversation.");
      }
    }

    return ok(this.chatGateway.getLockStatus(conversationId));
  }

  @Patch("conversations/:id/read")
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) conversationId: string,
  ) {
    return ok(await this.chatService.markConversationRead(user.id, user.role, conversationId));
  }

  @Post("conversations/:id/product-card")
  async sendProductCard(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) conversationId: string,
    @Body() body: { garmentId: string },
  ) {
    if (!body?.garmentId) {
      throw new ForbiddenException("garmentId is required.");
    }

    const message = await this.chatService.sendProductCardMessage(
      user.id,
      user.role,
      conversationId,
      body.garmentId,
    );

    // Broadcast the message to the conversation room via gateway
    this.chatGateway.server?.to(conversationId).emit("message_received", {
      conversationId,
      message,
    });

    if (user.role === "customer") {
      const conversation = await this.chatService.getConversationById(conversationId);
      if (!conversation.staff_id && conversation.status === "open") {
        this.chatGateway.server?.to("staff").emit("new_unassigned_message", {
          conversationId,
          customerName: user.fullName,
          content: message?.content ?? "",
        });
      }
    }

    return ok(message);
  }
}

