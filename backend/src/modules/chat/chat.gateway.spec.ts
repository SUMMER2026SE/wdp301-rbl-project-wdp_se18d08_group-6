import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatGateway } from "./chat.gateway";

describe("ChatGateway (unit)", () => {
  let gateway: ChatGateway;
  const mockChatService = {
    getConversationById: vi.fn(),
    assignStaffToConversationIfEmpty: vi.fn(),
    releaseStaffAssignment: vi.fn(),
  } as any;

  const mockJwtService = {} as any;
  const mockPrisma = {} as any;

  beforeEach(() => {
    vi.useFakeTimers();
    gateway = new ChatGateway(mockChatService, mockJwtService, mockPrisma);
    mockChatService.getConversationById.mockReset();
    mockChatService.assignStaffToConversationIfEmpty.mockReset();
    mockChatService.releaseStaffAssignment.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks conversation when a staff opens it", async () => {
    mockChatService.getConversationById.mockResolvedValue({ id: "conv-1", staff_id: null, status: "open" });
    mockChatService.assignStaffToConversationIfEmpty.mockResolvedValue({ id: "conv-1", staff_id: "staff-1", status: "open" });
    const client = {
      id: "sock-1",
      data: { user: { userId: "staff-1", role: "staff", fullName: "Staff One" } },
      emit: vi.fn(),
      broadcast: { to: () => ({ emit: vi.fn() }) },
      join: vi.fn(),
    } as any;

    await gateway.handleOpenConversation({ conversationId: "conv-1" }, client);

    const status = gateway.getLockStatus("conv-1");
    expect(status.isLocked).toBe(true);
    expect(status.lockedBy?.name).toBe("Staff One");
  });

  it("releases lock on timeout", async () => {
    mockChatService.getConversationById.mockResolvedValue({ id: "conv-2", staff_id: null, status: "open" });
    mockChatService.assignStaffToConversationIfEmpty.mockResolvedValue({ id: "conv-2", staff_id: "staff-2", status: "open" });
    const client = {
      id: "sock-2",
      data: { user: { userId: "staff-2", role: "staff", fullName: "Staff Two" } },
      emit: vi.fn(),
      broadcast: { to: () => ({ emit: vi.fn() }) },
      join: vi.fn(),
    } as any;

    await gateway.handleOpenConversation({ conversationId: "conv-2" }, client);
    expect(gateway.getLockStatus("conv-2").isLocked).toBe(true);

    // advance time by 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(gateway.getLockStatus("conv-2").isLocked).toBe(false);
  });

  describe("handleSendMessage validations", () => {
    function makeClient(userId: string, role = "customer", fullName = "Test User") {
      const server = { to: vi.fn().mockReturnThis(), emit: vi.fn() };
      gateway.server = server as any;
      return {
        id: "sock-3",
        data: { user: { userId, role, fullName } },
        emit: vi.fn(),
        broadcast: { to: () => ({ emit: vi.fn() }) },
        join: vi.fn(),
      } as any;
    }

    it("rejects message over 2000 characters", async () => {
      const client = makeClient("user-1");
      const longContent = "x".repeat(2001);

      await gateway.handleSendMessage(
        { conversationId: "conv-3", content: longContent },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith("send_error", {
        conversationId: "conv-3",
        reason: "message_too_long",
      });
    });

    it("allows message of exactly 2000 characters", async () => {
      const client = makeClient("user-1");
      mockChatService.getConversationById.mockResolvedValue({ id: "conv-3", customer_id: "user-1", staff_id: null, status: "open" });
      mockChatService.sendMessage = vi.fn().mockResolvedValue({ id: "msg-1", content: "x".repeat(2000) });

      await gateway.handleSendMessage(
        { conversationId: "conv-3", content: "x".repeat(2000) },
        client,
      );

      expect(client.emit).not.toHaveBeenCalledWith("send_error", expect.objectContaining({ reason: "message_too_long" }));
    });

    it("rejects product_card payload from client", async () => {
      const client = makeClient("user-2");
      const productCard = JSON.stringify({ type: "product_card", productId: "prod-1" });

      await gateway.handleSendMessage(
        { conversationId: "conv-4", content: productCard },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith("send_error", {
        conversationId: "conv-4",
        reason: "forbidden_payload",
      });
    });

    it("rejects rate-limited user after 5 messages in 10 seconds", async () => {
      const client = makeClient("user-3");
      mockChatService.getConversationById.mockResolvedValue({ id: "conv-5", customer_id: "user-3", staff_id: null, status: "open" });
      mockChatService.sendMessage = vi.fn().mockResolvedValue({ id: "msg-1" });

      // Send 5 valid messages
      for (let i = 0; i < 5; i++) {
        await gateway.handleSendMessage(
          { conversationId: "conv-5", content: `Message ${i + 1}` },
          client,
        );
      }

      // 6th message should be rate limited
      await gateway.handleSendMessage(
        { conversationId: "conv-5", content: "Message 6" },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith("send_error", {
        conversationId: "conv-5",
        reason: "rate_limited",
      });
    });

    it("allows messages again after rate limit window expires", async () => {
      const client = makeClient("user-4");
      mockChatService.getConversationById.mockResolvedValue({ id: "conv-6", customer_id: "user-4", staff_id: null, status: "open" });
      mockChatService.sendMessage = vi.fn().mockResolvedValue({ id: "msg-1" });
      client.emit.mockClear();

      // Send 5 messages
      for (let i = 0; i < 5; i++) {
        await gateway.handleSendMessage(
          { conversationId: "conv-6", content: `Message ${i + 1}` },
          client,
        );
      }

      // Advance time by 10 seconds
      vi.advanceTimersByTime(10_000);

      // 6th message should now be allowed
      client.emit.mockClear();
      await gateway.handleSendMessage(
        { conversationId: "conv-6", content: "Message 6 after window" },
        client,
      );

      expect(client.emit).not.toHaveBeenCalledWith("send_error", expect.objectContaining({ reason: "rate_limited" }));
    });

    it("returns early when user is not authenticated", async () => {
      const client = {
        id: "sock-anon",
        data: {},
        emit: vi.fn(),
        broadcast: { to: () => ({ emit: vi.fn() }) },
        join: vi.fn(),
      } as any;

      await gateway.handleSendMessage(
        { conversationId: "conv-7", content: "Hello" },
        client,
      );

      expect(client.emit).not.toHaveBeenCalled();
    });
  });
});