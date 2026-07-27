import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

// Lightweight in-memory fake Prisma to support chat service operations
function createFakePrisma() {
  const conversations: any[] = [];
  const messages: any[] = [];

  return {
    conversations: {
      findFirst: vi.fn(async (opts: any) => {
        return conversations.find((c) => c.customer_id === opts.where.customer_id || c.id === opts.where.id) ?? null;
      }),
      findMany: vi.fn(async () => {
        return conversations.slice().sort((a, b) => b.updated_at - a.updated_at);
      }),
      findUnique: vi.fn(async (opts: any) => {
        return conversations.find((c) => c.id === opts.where.id) ?? null;
      }),
      create: vi.fn(async (opts: any) => {
        const conv = { id: `conv-${conversations.length + 1}`, ...opts.data, messages: [], created_at: new Date(), updated_at: new Date() };
        conversations.push(conv);
        return conv;
      }),
      update: vi.fn(async (opts: any) => {
        const conv = conversations.find((c) => c.id === opts.where.id);
        if (!conv) throw new Error("not found");
        Object.assign(conv, opts.data);
        conv.updated_at = new Date();
        return conv;
      }),
      updateMany: vi.fn(async (opts: any) => {
        let count = 0;
        conversations.forEach((c) => {
          if (c.id === opts.where.id && c.staff_id == null) {
            c.staff_id = opts.data.staff_id;
            count++;
          }
        });
        return { count };
      }),
    },
    messages: {
      create: vi.fn(async (opts: any) => {
        const msg = { id: `msg-${messages.length + 1}`, ...opts.data, created_at: new Date() };
        messages.push(msg);
        return msg;
      }),
      findMany: vi.fn(async () => messages.slice()),
      findFirst: vi.fn(async ({ where }: any) => {
        const sorted = [...messages].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sorted.find((m) => m.conversation_id === where.conversation_id) ?? null;
      }),
      count: vi.fn(async () => messages.length),
    },
  } as any;
}

describe("Chat E2E - in-memory simulation", () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let fakePrisma: any;
  let fakeServer: any;

  beforeEach(() => {
    fakePrisma = createFakePrisma();
    chatService = new ChatService(fakePrisma as any, { productAdvisor: vi.fn() } as any);
    gateway = new ChatGateway(chatService as any, {} as any, fakePrisma as any);

    // Fake server that records emits by room
    const emits: any[] = [];
    fakeServer = {
      to: (room: string) => ({ emit: (event: string, payload: any) => emits.push({ room, event, payload }) }),
      _emits: emits,
      sockets: { sockets: new Map() },
    };

    gateway.server = fakeServer as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs customer->staff claim->send->lock/expire flow", async () => {
    // Use fake timers so lock timeout is deterministic
    vi.useFakeTimers();

    // Create customer and conversation
    const customerId = "cust-1";
    const conv = await chatService.getOrCreateConversationForCustomer(customerId);

    // Simulate customer socket joining
    const customerSocket = { id: "s-cust", data: { user: { userId: customerId, role: "customer", fullName: "Cust One" } }, join: vi.fn(), emit: vi.fn(), rooms: new Set<string>() } as any;
    await gateway.handleJoinRoom({ conversationId: conv.id }, customerSocket);

    // Staff connects and claims conversation
    const staffSocket = { id: "s-staff", data: { user: { userId: "staff-1", role: "staff", fullName: "Staff One" } }, emit: vi.fn(), broadcast: { to: () => ({ emit: vi.fn() }) }, join: vi.fn(), rooms: new Set<string>() } as any;
    await gateway.handleOpenConversation({ conversationId: conv.id }, staffSocket);

    // staff should have lock
    const lockStatus = gateway.getLockStatus(conv.id);
    expect(lockStatus.isLocked).toBe(true);
    expect(lockStatus.lockedBy?.name).toBe("Staff One");

    // staff sends message
    const sendResult = await gateway.handleSendMessage({ conversationId: conv.id, content: "Hello customer" }, staffSocket);
    expect(sendResult).toEqual({ success: true });

    // check that message was emitted to room
    const found = fakeServer._emits.find((e: any) => e.room === conv.id && e.event === "message_received");
    expect(found).toBeTruthy();
    expect(found.payload.message.content).toBe("Hello customer");

    // simulate lock expiry by invoking releaseLock directly (deterministic)
    (gateway as any).releaseLock(conv.id);

    // ensure lock cleared after release
    expect(gateway.getLockStatus(conv.id).isLocked).toBe(false);
  });
});
