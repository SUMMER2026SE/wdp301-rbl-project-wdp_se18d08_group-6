import { describe, expect, it, vi } from "vitest";
import { ChatService } from "./chat.service";

describe("ChatService", () => {
  it("creates a message and updates the sender's last read timestamp", async () => {
    const now = new Date();
    const prisma = {
      conversations: {
        findFirst: vi.fn().mockResolvedValue({
          id: "conversation-1",
          customer_id: "customer-1",
          staff_id: "staff-1",
          customer_last_read_at: null,
          staff_last_read_at: null,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      messages: {
        create: vi.fn().mockResolvedValue({
          id: "message-1",
          conversation_id: "conversation-1",
          sender_id: "staff-1",
          content: "Hello",
          created_at: now,
        }),
      },
    };

    const service = new ChatService(prisma as never);
    const result = await service.sendMessage("staff-1", "staff", "conversation-1", "Hello");

    expect(prisma.messages.create).toHaveBeenCalledOnce();
    expect(prisma.conversations.update).toHaveBeenCalledOnce();
    expect(result).toEqual({
      id: "message-1",
      conversation_id: "conversation-1",
      sender_id: "staff-1",
      content: "Hello",
      created_at: now,
    });
  });

  it("marks a conversation as read for the current user", async () => {
    const prisma = {
      conversations: {
        findFirst: vi.fn().mockResolvedValue({
          id: "conversation-2",
          customer_id: "customer-2",
          staff_id: "staff-2",
          customer_last_read_at: null,
          staff_last_read_at: null,
        }),
        update: vi.fn().mockResolvedValue({ id: "conversation-2" }),
      },
    };

    const service = new ChatService(prisma as never);
    await service.markConversationRead("customer-2", "customer", "conversation-2");

    expect(prisma.conversations.update).toHaveBeenCalledOnce();
    const updateCall = prisma.conversations.update.mock.calls[0]?.[0];
    expect(updateCall.where).toEqual({ id: "conversation-2" });
    expect(updateCall.data.customer_last_read_at).toBeInstanceOf(Date);
  });

  it("loads conversation messages with cursor-based pagination", async () => {
    const prisma = {
      conversations: {
        findFirst: vi.fn().mockResolvedValue({ id: "conversation-3", customer_id: "customer-3", staff_id: "staff-3" }),
      },
      messages: {
        findFirst: vi.fn().mockResolvedValue({ id: "message-1", created_at: new Date("2025-01-01T00:00:00.000Z") }),
        findMany: vi.fn().mockResolvedValue([
          { id: "message-2", content: "Second", sender_id: "staff-3", conversation_id: "conversation-3", created_at: new Date(), user_accounts: { id: "staff-3", email: "staff@example.com", role: "staff" } },
        ]),
      },
    };

    const service = new ChatService(prisma as never);
    const messages = await service.getMessages(
      {
        id: "customer-3",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Customer 3",
        phone: null,
      },
      "conversation-3",
      "message-1",
      20,
    );

    expect(prisma.messages.findMany).toHaveBeenCalledOnce();
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("message-2");
  });

  it("lists conversations and computes unread message counts", async () => {
    const prisma = {
      conversations: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "conversation-4",
            customer_id: "customer-4",
            staff_id: "staff-4",
            status: "open",
            updated_at: new Date("2025-01-01T00:00:00.000Z"),
            customer_last_read_at: new Date("2024-12-01T00:00:00.000Z"),
            staff_last_read_at: null,
            messages: [
              {
                id: "message-3",
                content: "A new question",
                sender_id: "staff-4",
                created_at: new Date("2025-01-01T00:00:00.000Z"),
              },
            ],
          },
        ]),
      },
      messages: {
        count: vi.fn().mockResolvedValue(1),
      },
    };

    const service = new ChatService(prisma as never);
    const conversations = await service.listConversations({
      id: "customer-4",
      email: "customer4@example.com",
      role: "customer",
      isActive: true,
      fullName: "Customer 4",
      phone: null,
    });

    expect(prisma.conversations.findMany).toHaveBeenCalledOnce();
    expect(prisma.messages.count).toHaveBeenCalledOnce();
    expect(conversations[0]).toMatchObject({
      id: "conversation-4",
      unreadCount: 1,
      lastMessage: {
        id: "message-3",
        content: "A new question",
      },
    });
  });
});
