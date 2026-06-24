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
    vi.useFakeTimers();
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
});
