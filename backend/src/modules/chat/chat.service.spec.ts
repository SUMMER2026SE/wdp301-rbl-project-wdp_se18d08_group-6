import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ChatService } from "./chat.service";

describe("ChatService", () => {
  let service: ChatService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      conversations: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      messages: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    service = new ChatService(prisma as never);
  });

  describe("sendProductCardMessage", () => {
    it("rejects when user is not a conversation participant", async () => {
      // findFirst returns null (conversation not found) → ForbiddenException
      prisma.conversations.findFirst.mockResolvedValue(null);

      await expect(
        service.sendProductCardMessage("user-1", "customer", "conv-1", "garment-1"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("rejects when garment does not exist", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.garment = {
        findUnique: vi.fn().mockResolvedValue(null),
      };

      await expect(
        service.sendProductCardMessage("user-1", "customer", "conv-1", "garment-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("creates a product card message with garment data from DB and updates conversation context", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.garment = {
        findUnique: vi.fn().mockResolvedValue({
          id: "garment-1",
          name: "Ao dai sen",
          images: [{ imageUrl: "https://example.com/img.jpg" }],
          garment_sizes: [{ id: "size-1", size_label: "M", daily_price: 350000 }],
        }),
      };
      prisma.messages.create.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: '{"type":"product_card","product":{"id":"garment-1","name":"Ao dai sen","image":"https://example.com/img.jpg","size":"M","price":350000,"detailUrl":"/catalog/size-1"}}',
        created_at: new Date(),
      });
      prisma.messages.findUnique.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: '{"type":"product_card","product":{"id":"garment-1","name":"Ao dai sen","image":"https://example.com/img.jpg","size":"M","price":350000,"detailUrl":"/catalog/size-1"}}',
        created_at: new Date(),
      });
      prisma.conversations.update.mockResolvedValue({});

      const result = await service.sendProductCardMessage("user-1", "customer", "conv-1", "garment-1");

      expect(result).toBeDefined();
      // Verify the garment query was called with the right garmentId
      expect(prisma.garment.findUnique).toHaveBeenCalledWith({
        where: { id: "garment-1" },
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          garment_sizes: { take: 1 },
        },
      });
      // Verify conversation update includes topic context
      const updateCall = prisma.conversations.update.mock.calls[0]?.[0];
      expect(updateCall.data).toMatchObject({
        topic: "product_advice",
        garment_id: "garment-1",
      });
    });
  });

  describe("sendMessage validations", () => {
    it("rejects empty content", async () => {
      await expect(
        service.sendMessage("user-1", "customer", "conv-1", ""),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.sendMessage("user-1", "customer", "conv-1", "   "),
      ).rejects.toThrow(ForbiddenException);
    });

    it("rejects content over 2000 characters", async () => {
      await expect(
        service.sendMessage("user-1", "customer", "conv-1", "x".repeat(2001)),
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows content of exactly 2000 characters", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.messages.create.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: "x".repeat(2000),
        created_at: new Date(),
      });
      prisma.messages.findUnique.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: "x".repeat(2000),
        created_at: new Date(),
      });
      prisma.conversations.update.mockResolvedValue({});

      const result = await service.sendMessage("user-1", "customer", "conv-1", "x".repeat(2000));
      expect(result).toBeDefined();
    });

    it("rejects product_card JSON payload", async () => {
      await expect(
        service.sendMessage("user-1", "customer", "conv-1", JSON.stringify({ type: "product_card", productId: "p-1" })),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.sendMessage("user-1", "customer", "conv-1", JSON.stringify({ type: "product_card" })),
      ).rejects.toThrow("Product cards must be created by server");
    });

    it("allows regular JSON that is not a product_card", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.messages.create.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: '{"type":"custom"}',
        created_at: new Date(),
      });
      prisma.messages.findUnique.mockResolvedValue({
        id: "msg-1",
        conversation_id: "conv-1",
        sender_id: "user-1",
        content: '{"type":"custom"}',
        created_at: new Date(),
      });
      prisma.conversations.update.mockResolvedValue({});

      const result = await service.sendMessage("user-1", "customer", "conv-1", '{"type":"custom"}');
      expect(result).toBeDefined();
    });
  });

  it("creates a message and updates the sender's last read timestamp", async () => {
    const now = new Date();
    prisma.conversations.findUnique.mockResolvedValue({
      id: "conversation-1",
      customer_id: "customer-1",
      staff_id: "staff-1",
      customer_last_read_at: null,
      staff_last_read_at: null,
    });
    prisma.messages.create.mockResolvedValue({
      id: "message-1",
      conversation_id: "conversation-1",
      sender_id: "staff-1",
      content: "Hello",
      created_at: now,
    });
    prisma.messages.findUnique.mockResolvedValue({
      id: "message-1",
      conversation_id: "conversation-1",
      sender_id: "staff-1",
      content: "Hello",
      created_at: now,
    });
    prisma.conversations.update.mockResolvedValue({});

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

  it("resolves a conversation and clears topic context", async () => {
    const prisma = {
      conversations: {
        findFirst: vi.fn().mockResolvedValue({
          id: "conv-resolve",
          customer_id: "customer-1",
          staff_id: "staff-1",
          status: "open",
          topic: "product_advice",
          garment_id: "garment-1",
          booking_id: null,
        }),
        update: vi.fn().mockResolvedValue({ id: "conv-resolve", status: "resolved" }),
      },
    };

    const service = new ChatService(prisma as never);
    await service.resolveConversation("conv-resolve", "staff-1");

    expect(prisma.conversations.update).toHaveBeenCalledOnce();
    const updateCall = prisma.conversations.update.mock.calls[0]?.[0];
    expect(updateCall.data).toMatchObject({
      status: "resolved",
      topic: "general",
      garment_id: null,
      booking_id: null,
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

  describe("sendBookingCardMessage", () => {
    it("rejects when user is not a conversation participant", async () => {
      prisma.conversations.findFirst.mockResolvedValue(null);

      await expect(
        service.sendBookingCardMessage("user-1", "customer", "conv-1", "booking-1", "booking_support"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("rejects when booking does not exist", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.booking = { findUnique: vi.fn().mockResolvedValue(null) };

      await expect(
        service.sendBookingCardMessage("user-1", "customer", "conv-1", "booking-1", "booking_support"),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects when booking does not belong to the conversation's customer", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
      });
      prisma.booking = {
        findUnique: vi.fn().mockResolvedValue({
          id: "booking-1",
          customerId: "other-user",
        }),
      };

      await expect(
        service.sendBookingCardMessage("user-1", "customer", "conv-1", "booking-1", "booking_support"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("creates a booking card message and updates conversation context", async () => {
      prisma.conversations.findFirst.mockResolvedValue({
        id: "conv-1",
        customer_id: "user-1",
        staff_id: null,
        status: "open",
        customer_last_read_at: null,
        staff_last_read_at: null,
      });
      prisma.booking = {
        findUnique: vi.fn().mockResolvedValue({
          id: "booking-1",
          customerId: "user-1",
          status: "pending_confirmation",
          rentalStartDate: new Date("2026-06-28"),
          rentalEndDate: new Date("2026-06-29"),
          rentalTotal: 640000,
          depositTotal: 900000,
          items: [{ id: "item-1" }],
        }),
      };
      prisma.messages = {
        create: vi.fn().mockResolvedValue({
          id: "msg-booking-1",
          conversation_id: "conv-1",
          sender_id: "user-1",
          content: JSON.stringify({
            type: "booking_card",
            booking: {
              id: "booking-1",
              code: "BOOKING-",
              status: "pending_confirmation",
              statusLabel: "Chờ xác nhận",
              rentalStartDate: new Date("2026-06-28"),
              rentalEndDate: new Date("2026-06-29"),
              days: 2,
              itemCount: 1,
              rentalTotal: 640000,
              depositTotal: 900000,
            },
          }),
          created_at: new Date(),
        }),
        findUnique: vi.fn().mockResolvedValue({
          id: "msg-booking-1",
          conversation_id: "conv-1",
          sender_id: "user-1",
          content: "{\"type\":\"booking_card\",\"booking\":{}}",
          created_at: new Date(),
        }),
      };
      prisma.conversations.update.mockResolvedValue({});

      const result = await service.sendBookingCardMessage("user-1", "customer", "conv-1", "booking-1", "complaint");

      expect(result).toBeDefined();
      const updateCall = prisma.conversations.update.mock.calls[0]?.[0];
      expect(updateCall.data).toMatchObject({
        topic: "complaint",
        booking_id: "booking-1",
        garment_id: null,
      });
    });
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
            topic: "product_advice",
            garment_id: "garment-1",
            booking_id: null,
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
      garment: {
        findUnique: vi.fn().mockResolvedValue({ name: "Ao dai sen" }),
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
      topic: "product_advice",
      garmentId: "garment-1",
      garmentName: "Ao dai sen",
    });
  });
});
