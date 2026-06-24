"use client";

import { useRef, useEffect, useState, type RefObject } from "react";
import type { ChatConversation, ChatMessage, ConversationLockStatus } from "@/lib/chat";
import { isProductCardContent, parseProductCard } from "@/lib/chat";
import type { AuthSession } from "@/lib/auth";
import { ProductCard } from "@/components/chat/product-card";

interface StaffChatWorkspaceProps {
  conversations: ChatConversation[];
  selectedConversation: ChatConversation | null;
  messages: ChatMessage[];
  messageText: string;
  setMessageText: (text: string) => void;
  typingUsers: Record<string, boolean>;
  typingEntries: string[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  lockStatus: ConversationLockStatus | null;
  staffCanReply: boolean;
  staffLockError: string | null;
  sidebarTab: "assigned" | "unassigned";
  setSidebarTab: (tab: "assigned" | "unassigned") => void;
  notification: string | null;
  session: AuthSession | null;
  onJoinConversation: (conversationId: string) => void;
  onSendMessage: () => void;
  onOpenConversation: () => void;
  onMarkRead: () => void;
  onTyping: (isTyping: boolean) => void;
  hasMoreMessages: boolean;
  loadingOlderMessages: boolean;
  onLoadOlderMessages: () => void;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  onDeleteMessage: (messageId: string) => void;
}

export function StaffChatWorkspace({
  conversations,
  selectedConversation,
  messages,
  messageText,
  setMessageText,
  typingUsers,
  typingEntries,
  loadingConversations,
  loadingMessages,
  lockStatus,
  staffCanReply,
  staffLockError,
  sidebarTab,
  setSidebarTab,
  notification,
  session,
  onJoinConversation,
  onSendMessage,
  onOpenConversation,
  onMarkRead,
  onTyping,
  hasMoreMessages,
  loadingOlderMessages,
  onLoadOlderMessages,
  messagesContainerRef,
  onDeleteMessage,
}: StaffChatWorkspaceProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const assignedConversations = conversations.filter((c) => c.staffId === session?.user.id);
  const unassignedConversations = conversations.filter((c) => c.staffId === null && c.status === "open" && c.lastMessage?.sender_id === c.customerId);
  const displayedConversations = sidebarTab === "assigned" ? assignedConversations : unassignedConversations;

  // Determine the viewing mode
  const isUnassignedPreview = selectedConversation && selectedConversation.staffId === null;
  const isAssignedToOther = selectedConversation && selectedConversation.staffId !== null && selectedConversation.staffId !== session?.user.id;

  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [messages]);

  // Handle scroll to top to load older messages
  function handleMessagesScroll() {
    const container = messagesContainerRef.current;
    if (!container || !hasMoreMessages || loadingOlderMessages) return;

    // If scrolled near the top (within 50px), load older messages
    if (container.scrollTop <= 50) {
      onLoadOlderMessages();
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-ink">Cuộc trò chuyện</h2>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-3xl bg-[#fff7f2] p-3 text-sm text-stone-700">
          <button
            type="button"
            onClick={() => setSidebarTab("assigned")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
              sidebarTab === "assigned" ? "bg-oxblood text-white" : "bg-white text-stone-700 hover:bg-sand"
            }`}
          >
            Đang hỗ trợ
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-bold leading-none ${
                sidebarTab === "assigned"
                  ? "bg-white/20 text-white"
                  : "bg-lotus/10 text-lotus"
              }`}
            >
              {assignedConversations.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("unassigned")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
              sidebarTab === "unassigned" ? "bg-oxblood text-white" : "bg-white text-stone-700 hover:bg-sand"
            }`}
          >
            Chờ tiếp nhận
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-bold leading-none ${
                sidebarTab === "unassigned"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {unassignedConversations.length}
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {loadingConversations ? (
            <div className="text-sm text-stone-500">Đang tải cuộc trò chuyện...</div>
          ) : displayedConversations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sand/70 bg-[#fffbf7] p-4 text-sm text-stone-500">
              Không có cuộc trò chuyện nào.
            </div>
          ) : (
            displayedConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => void onJoinConversation(conversation.id)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${conversation.id === selectedConversation?.id ? "border-lotus bg-[#fff1ef]" : "border-sand bg-white hover:border-lotus/80"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Khách hàng: {conversation.customerName}</p>
                    <p className="mt-1 text-xs text-stone-500">Nhân viên: {conversation.staffName ?? "Chưa có"}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="rounded-full bg-sand/80 px-2 py-1 text-[11px] uppercase text-stone-600">{conversation.unreadCount} mới</span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="mt-3 text-sm text-stone-600 line-clamp-2">{conversation.lastMessage.content}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mt-4 rounded-3xl bg-lotus/10 border border-lotus px-4 py-3 text-sm font-semibold text-lotus animate-pulse">
            {notification}
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <section className="rounded-3xl border border-sand bg-white p-6 shadow-sm flex flex-col">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div>
            <h2 className="font-semibold text-lg text-ink">{selectedConversation ? `Chat với ${selectedConversation.customerName}` : "Chọn cuộc trò chuyện"}</h2>
            {selectedConversation && <p className="mt-1 text-sm text-stone-500">ID: {selectedConversation.id}</p>}
          </div>

          {selectedConversation && (
            <div className="flex gap-2">
              {isUnassignedPreview ? (
                <button
                  type="button"
                  onClick={onOpenConversation}
                  className="rounded-full bg-lotus px-5 py-2 text-sm font-semibold text-white transition hover:bg-oxblood"
                >
                  Tiếp nhận hỗ trợ
                </button>
              ) : isAssignedToOther ? (
                <div className="rounded-full px-5 py-2 text-sm font-semibold text-stone-600">
                  Đang xử lý bởi {selectedConversation.staffName}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {selectedConversation ? (
          <>
            {/* Preview Banner for unassigned conversations */}
            {isUnassignedPreview && (
              <div className="mb-5 rounded-3xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 shrink-0">
                🔍 Chế độ xem trước — Bạn đang xem tin nhắn. Nhấn <strong>"Tiếp nhận hỗ trợ"</strong> để nhận cuộc trò chuyện này.
              </div>
            )}

            <div className="mb-5 grid gap-3 sm:grid-cols-2 shrink-0">
              <div className="rounded-3xl bg-[#fff7f2] p-4 text-sm text-stone-700">
                <div className="font-semibold text-stone-900">Tình trạng</div>
                <div className="mt-2">
                  {isUnassignedPreview ? (
                    <p className="text-sm text-amber-700">Chưa có nhân viên tiếp nhận</p>
                  ) : lockStatus?.isLocked ? (
                    <>
                      <p className="text-sm">Khoá bởi: {lockStatus.lockedBy?.name}</p>
                      <p className="text-sm">Hết hạn: {lockStatus.expiresAt ? new Date(lockStatus.expiresAt).toLocaleTimeString("vi-VN") : "-"}</p>
                    </>
                  ) : (
                    <p className="text-sm">Hiện chưa khoá</p>
                  )}
                </div>
              </div>
              <div className="rounded-3xl bg-[#fff7f2] p-4 text-sm text-stone-700">
                <div className="font-semibold text-stone-900">Quyền gửi</div>
                <div className="mt-2">
                  {isUnassignedPreview ? (
                    <p className="text-sm text-amber-700">Xem trước — chưa có quyền trả lời</p>
                  ) : staffCanReply ? (
                    <p className="text-sm text-emerald-700">Bạn hiện có quyền trả lời</p>
                  ) : (
                    <p className="text-sm text-rose-700">{staffLockError ?? "Chưa mở khóa"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container - fixed height, scrollable */}
            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="mb-5 flex-1 min-h-0 overflow-y-auto rounded-3xl border border-sand/70 bg-[#fff7f2] p-4"
              style={{ maxHeight: "400px" }}
            >
              {/* Loading older indicator */}
              {loadingOlderMessages && (
                <div className="text-center text-sm text-stone-500 py-2">Đang tải tin nhắn cũ hơn...</div>
              )}
              {hasMoreMessages && !loadingOlderMessages && messages.length > 0 && (
                <div className="text-center text-xs text-stone-400 py-2">Cuộn lên để xem tin nhắn cũ</div>
              )}

              {loadingMessages ? (
                <div className="text-sm text-stone-500">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-stone-500">Chưa có tin nhắn nào trong cuộc trò chuyện này.</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMine = message.sender_id === session?.user.id;
                    return (
                      <div
                        key={message.id}
                        className={`group relative ${isMine ? "ml-auto" : "mr-auto"} max-w-[85%]`}
                        onMouseEnter={() => setHoveredMessageId(message.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className={`${isMine ? "bg-lotus/10 text-ink" : "bg-white text-stone-900"} rounded-3xl border border-sand/70 px-4 py-3 shadow-sm`}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-stone-400">
                            <span>{isMine ? "Bạn" : message.user_accounts?.profile?.fullName ?? message.user_accounts?.email ?? message.sender_id}</span>
                            <span>{new Date(message.created_at).toLocaleTimeString("vi-VN")}</span>
                          </div>
                          {isProductCardContent(message.content) ? (
                            (() => {
                              const product = parseProductCard(message.content);
                              return product ? (
                                <ProductCard product={product} />
                              ) : (
                                <p className="text-sm text-stone-500">Không thể hiển thị sản phẩm</p>
                              );
                            })()
                          ) : (
                            <p className="text-sm leading-6">{message.content}</p>
                          )}
                        </div>
                        {/* Delete button - only show for own messages on hover */}
                        {isMine && hoveredMessageId === message.id && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(message.id)}
                            className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs shadow-sm hover:bg-red-600 transition"
                            title="Xoá tin nhắn"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <textarea
                rows={4}
                value={messageText}
                onChange={(event) => {
                  if (!isUnassignedPreview) {
                    setMessageText(event.currentTarget.value);
                  }
                }}
                onFocus={() => {
                  if (!isUnassignedPreview) onTyping(true);
                }}
                onBlur={() => {
                  if (!isUnassignedPreview) onTyping(false);
                }}
                disabled={isUnassignedPreview || !staffCanReply}
                className="min-h-[140px] rounded-3xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-lotus disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                placeholder={isUnassignedPreview ? "Tiếp nhận cuộc trò chuyện để trả lời..." : "Nhập tin nhắn..."}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onSendMessage}
                  disabled={isUnassignedPreview || !staffCanReply}
                  className={`inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${
                    isUnassignedPreview || !staffCanReply ? "bg-sand/70 cursor-not-allowed" : "bg-oxblood hover:bg-red-950"
                  }`}
                >
                  Gửi tin nhắn
                </button>
                <button
                  type="button"
                  onClick={onMarkRead}
                  className="inline-flex items-center justify-center rounded-3xl border border-lotus px-5 py-3 text-sm font-semibold text-lotus hover:bg-lotus/10"
                >
                  Đánh dấu đã tư vấn
                </button>
              </div>
            </div>

            {typingEntries.length > 0 && (
              <div className="mt-4 rounded-3xl bg-[#fffaf4] px-4 py-3 text-sm text-stone-600 shrink-0">
                {typingEntries.some((id) => id !== session?.user.id) ? "... Khách hàng đang nhập..." : "Bạn đang nhập..."}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-sand/70 bg-[#fffdfb] p-8 text-center text-sm text-stone-600">
            Chọn một cuộc trò chuyện để xem tin nhắn và khóa chat.
          </div>
        )}
      </section>
    </div>
  );
}