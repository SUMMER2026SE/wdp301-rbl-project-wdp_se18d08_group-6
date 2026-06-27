import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AppRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedUser } from "../auth/auth-user";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) { }

  async sendProductCardMessage(
    userId: string,
    role: AppRole,
    conversationId: string,
    garmentId: string,
  ) {
    // Validate user is a participant - use the same approach as sendMessage
    let conversation;
    if (role === "customer") {
      conversation = await this.prisma.conversations.findFirst({
        where: {
          id: conversationId,
          customer_id: userId, // ← kết hợp cả 2 điều kiện vào query
        },
      });

      if (!conversation) {
        throw new ForbiddenException("You are not part of this conversation.");
      }
    } else {
      // Staff: chỉ cần conversation tồn tại, không bắt buộc phải là assigned staff
      // vì product card gửi từ catalog là hành động tư vấn, không phải reply trong chat
      conversation = await this.prisma.conversations.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException("Conversation not found.");
      }
    }

    // Query garment from DB with images and sizes
    const garment = await this.prisma.garment.findUnique({
      where: { id: garmentId },
      include: {
        images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        garment_sizes: { take: 1 },
      },
    });

    if (!garment) {
      throw new NotFoundException("Garment not found.");
    }

    const DEFAULT_IMAGE = "https://dep.com.vn/wp-content/uploads/2020/11/ao-dai-9.jpg";
    const imageUrl = garment.images[0]?.imageUrl || DEFAULT_IMAGE;
    const sizeLabel = garment.garment_sizes[0]?.size_label ?? null;
    const dailyPrice = garment.garment_sizes[0]?.daily_price ?? 0;
    const detailUrl = `/catalog/${garment.garment_sizes[0]?.id ?? garment.id}`;

    const productCard = {
      type: "product_card",
      product: {
        id: garment.id,
        name: garment.name,
        image: imageUrl,
        size: sizeLabel,
        price: Number(dailyPrice),
        detailUrl,
      },
    };

    const content = JSON.stringify(productCard);

    // Validate length and product card rules (already checked, but keep defense-in-depth)
    const trimmed = content?.trim() ?? "";
    if (trimmed.length > 2000) {
      throw new ForbiddenException("Message content exceeds maximum length of 2000 characters.");
    }

    const now = new Date();
    const message = await this.prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        content,
      },
    });

    // Update conversation timestamps
    const updateData = role === "customer"
      ? {
          customer_last_read_at: now,
          ...(conversation.status === "resolved" ? { status: "open" } : {}),
        }
      : { staff_last_read_at: now };

    await this.prisma.conversations.update({
      where: { id: conversationId },
      data: { ...updateData, updated_at: now },
    });

    // Return with user_accounts for real-time display
    if (typeof this.prisma.messages.findUnique === "function") {
      return this.prisma.messages.findUnique({
        where: { id: message.id },
        include: {
          user_accounts: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });
    }

    return message;
  }

  async getOrCreateConversationForCustomer(customerId: string) {
    const existingConversation = await this.prisma.conversations.findFirst({
      where: { customer_id: customerId },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return this.prisma.conversations.create({
      data: {
        customer_id: customerId,
      },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });
  }

  async sendMessage(userId: string, role: AppRole, conversationId: string, content: string) {
    const trimmed = content?.trim() ?? "";
    if (trimmed.length === 0) {
      throw new ForbiddenException("Message content cannot be empty.");
    }

    if (trimmed.length > 2000) {
      throw new ForbiddenException("Message content exceeds maximum length of 2000 characters.");
    }

    if (this.isProductCardPayload(trimmed)) {
      throw new ForbiddenException("Product cards must be created by server.");
    }

    let conversation;

    if (role === "customer") {
      conversation = await this.findConversationForParticipant(userId, conversationId);
      if (!conversation) {
        throw new ForbiddenException("You are not part of this conversation.");
      }
    } else {
      // some tests/mocks provide findFirst instead of findUnique – tolerate both
      if (typeof this.prisma.conversations.findUnique === "function") {
        conversation = await this.prisma.conversations.findUnique({ where: { id: conversationId } });
      } else {
        conversation = await this.prisma.conversations.findFirst({ where: { id: conversationId } });
      }

      if (!conversation) {
        throw new NotFoundException("Conversation not found.");
      }

      if (conversation.staff_id !== userId) {
        throw new ForbiddenException("Only the assigned staff can send messages in this conversation.");
      }
    }

    const now = new Date();
    const message = await this.prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        content,
      },
    });

    const updateData = role === "customer"
      ? {
          customer_last_read_at: now,
          ...(conversation.status === "resolved" ? { status: "open" } : {}),
        }
      : { staff_last_read_at: now };

    await this.prisma.conversations.update({
      where: { id: conversationId },
      data: {
        ...updateData,
        updated_at: now,
      },
    });

    // Return message with user_accounts for real-time display
    // some tests/mocks provide findFirst instead of findUnique – tolerate both
    if (typeof this.prisma.messages.findUnique === "function") {
      return this.prisma.messages.findUnique({
        where: { id: message.id },
        include: {
          user_accounts: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
      });
    }

    // Fallback for tests: just return the created message  
    return message;
  }

  async deleteMessage(userId: string, role: AppRole, messageId: string) {
    const message = await this.prisma.messages.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException("Message not found.");
    }

    // Only the sender can delete their own message
    if (message.sender_id !== userId) {
      throw new ForbiddenException("You can only delete your own messages.");
    }

    await this.prisma.messages.delete({
      where: { id: messageId },
    });

    return { id: messageId, conversation_id: message.conversation_id };
  }

  async assignStaffToConversationIfEmpty(conversationId: string, staffId: string) {
    await this.prisma.conversations.updateMany({
      where: { id: conversationId, staff_id: null, status: "open" },
      data: { staff_id: staffId, updated_at: new Date() },
    });

    return this.getConversationById(conversationId);
  }

  async releaseStaffAssignment(conversationId: string, staffId?: string) {
    await this.prisma.conversations.updateMany({
      where: {
        id: conversationId,
        ...(staffId ? { staff_id: staffId } : {}),
      },
      data: { staff_id: null, staff_last_read_at: null, updated_at: new Date() },
    });

    return this.getConversationById(conversationId);
  }

  async resolveConversation(conversationId: string, staffId: string) {
    const conversation = await this.findConversationForParticipant(staffId, conversationId);
    if (!conversation || conversation.staff_id !== staffId) {
      throw new ForbiddenException("Only the assigned staff can resolve this conversation.");
    }

    return this.prisma.conversations.update({
      where: { id: conversationId },
      data: {
        staff_id: null,
        staff_last_read_at: new Date(),
        status: "resolved",
        updated_at: new Date(),
      },
    });
  }

  async markConversationRead(userId: string, role: AppRole, conversationId: string) {
    const conversation = await this.findConversationForParticipant(userId, conversationId);
    if (!conversation) {
      throw new ForbiddenException("You are not part of this conversation.");
    }

    const updateData = role === "customer"
      ? { customer_last_read_at: new Date() }
      : { staff_last_read_at: new Date() };

    return this.prisma.conversations.update({
      where: { id: conversationId },
      data: updateData,
    });
  }

  async getMessages(user: AuthenticatedUser, conversationId: string, before?: string, limit = 15) {
    await this.ensureCustomerOrStaffParticipant(user, conversationId);

    // Default: load the most recent `limit` messages (newest last for display)
    if (!before) {
      const messages = await this.prisma.messages.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: "desc" },
        take: limit,
        include: {
          user_accounts: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
      });
      // Reverse so newest is last (ASC order for frontend display)
      return messages.reverse();
    }

    // Load messages OLDER than the `before` message
    const beforeMessage = typeof this.prisma.messages.findUnique === "function"
      ? await this.prisma.messages.findUnique({
          where: { id: before },
          select: { created_at: true },
        })
      : await this.prisma.messages.findFirst({
          where: { id: before },
          select: { created_at: true },
        });

    if (!beforeMessage) {
      throw new NotFoundException("Cursor message not found.");
    }

    const messages = await this.prisma.messages.findMany({
      where: {
        conversation_id: conversationId,
        created_at: { lt: beforeMessage.created_at },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      include: {
        user_accounts: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: { fullName: true },
            },
          },
        },
      },
    });
    // Reverse so newest is last (ASC order for frontend display)
    return messages.reverse();
  }

  async listConversations(user: AuthenticatedUser) {
    const isCustomer = user.role === "customer";

    const conversations = await this.prisma.conversations.findMany({
      where: isCustomer ? { customer_id: user.id } : undefined,
      orderBy: { updated_at: "desc" },
      include: {
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            sender_id: true,
            created_at: true,
          },
        },
        user_accounts_conversations_customer_idTouser_accounts: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        user_accounts_conversations_staff_idTouser_accounts: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    return Promise.all(conversations.map(async (conversation) => {
      const lastMessage = conversation.messages[0] ?? null;

      // After
      let unreadCount: number;

      if (user.role === "customer") {
        // Customer: staff messages since customer last read
        const lastReadAt = conversation.customer_last_read_at;
        unreadCount = await this.prisma.messages.count({
          where: {
            conversation_id: conversation.id,
            sender_id: { not: user.id },
            created_at: { gt: lastReadAt ?? new Date(0) },
          },
        });
      } else {
        // Staff: customer messages since the LATER of
        //   (a) staff_last_read_at  — explicit read/resolve action
        //   (b) last message sent BY staff — implicit "we replied" marker
        const lastStaffMessage = await this.prisma.messages.findFirst({
          where: {
            conversation_id: conversation.id,
            sender_id: { not: conversation.customer_id }, // sent by any staff
          },
          orderBy: { created_at: "desc" },
          select: { created_at: true },
        });

        const readAt = conversation.staff_last_read_at;
        const repliedAt = lastStaffMessage?.created_at ?? null;

        // Pick the more recent of the two timestamps
        let baseline: Date | null = null;
        if (readAt && repliedAt) {
          baseline = readAt > repliedAt ? readAt : repliedAt;
        } else {
          baseline = readAt ?? repliedAt;
        }

        unreadCount = await this.prisma.messages.count({
          where: {
            conversation_id: conversation.id,
            sender_id: conversation.customer_id, // only customer messages
            ...(baseline ? { created_at: { gt: baseline } } : {}),
          },
        });
      }

      return {
        id: conversation.id,
        customerId: conversation.customer_id,
        customerName:
          conversation.user_accounts_conversations_customer_idTouser_accounts
            ?.profile?.fullName ??
          conversation.user_accounts_conversations_customer_idTouser_accounts
            ?.email ??
          null,
        staffId: conversation.staff_id,
        staffName:
          conversation.user_accounts_conversations_staff_idTouser_accounts
            ?.profile?.fullName ??
          conversation.user_accounts_conversations_staff_idTouser_accounts
            ?.email ??
          null,
        status: conversation.status,
        updatedAt: conversation.updated_at,
        lastMessage,
        unreadCount,
      };
    })
    );
  }

  async getConversationById(conversationId: string) {
    const conversation = typeof this.prisma.conversations.findUnique === "function"
      ? await this.prisma.conversations.findUnique({ where: { id: conversationId } })
      : await this.prisma.conversations.findFirst({ where: { id: conversationId } });

    if (!conversation) {
      throw new NotFoundException("Conversation not found.");
    }

    return conversation;
  }

  async ensureCustomerOrStaffParticipant(user: AuthenticatedUser, conversationId: string) {
    const conversation = typeof this.prisma.conversations.findUnique === "function"
      ? await this.prisma.conversations.findUnique({ where: { id: conversationId } })
      : await this.prisma.conversations.findFirst({ where: { id: conversationId } });

    if (!conversation) {
      throw new NotFoundException("Conversation not found.");
    }

    if (user.role === "customer" && conversation.customer_id !== user.id) {
      throw new ForbiddenException("You are not part of this conversation.");
    }

    return conversation;
  }

  private async findConversationForParticipant(userId: string, conversationId: string) {
    return this.prisma.conversations.findFirst({
      where: {
        id: conversationId,
        OR: [
          { customer_id: userId },
          { staff_id: userId },
        ],
      },
    });
  }

  private isProductCardPayload(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      return parsed?.type === "product_card";
    } catch {
      return false;
    }
  }
}
