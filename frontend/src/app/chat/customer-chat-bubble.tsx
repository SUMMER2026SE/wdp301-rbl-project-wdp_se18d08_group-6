"use client";

import { useRef, useEffect, useState, type RefObject } from "react";
import type { ChatConversation, ChatMessage } from "@/lib/chat";
import { getBookingCardData, getProductCardData, uploadChatFile } from "@/lib/chat";
import type { AuthSession } from "@/lib/auth";
import { BookingCard } from "@/components/chat/booking-card";
import { ProductCard } from "@/components/chat/product-card";
import { Paperclip } from "lucide-react";

const CHAT_BUBBLE_OPEN_KEY = "co_phuc_chat_bubble_open";

interface CustomerChatBubbleProps {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  messageText: string;
  setMessageText: (text: string) => void;
  typingUsers: Record<string, boolean>;
  loadingMessages: boolean;
  session: AuthSession | null;
  onSendMessage: () => void;
  onTyping: (isTyping: boolean) => void;
  hasMoreMessages: boolean;
  loadingOlderMessages: boolean;
  onLoadOlderMessages: () => void;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  onDeleteMessage: (messageId: string) => void;
}

export function CustomerChatBubble({
  conversation,
  messages,
  messageText,
  setMessageText,
  typingUsers,
  loadingMessages,
  session,
  onSendMessage,
  onTyping,
  hasMoreMessages,
  loadingOlderMessages,
  onLoadOlderMessages,
  messagesContainerRef,
  onDeleteMessage,
}: CustomerChatBubbleProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // const [isOpen, setIsOpen] = useState(() => {
  //   // Restore open state from localStorage on page load
  //   if (typeof window === "undefined") return false;
  //   return window.localStorage.getItem(CHAT_BUBBLE_OPEN_KEY) === "true";
  // });
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;
    setUploading(true);
    try {
      await uploadChatFile(conversation.id, file);
    } catch {
      const maxMB = 50;
      showToast(`Không thể tải file lên. File phải là hình ảnh hoặc video, dung lượng tối đa ${maxMB}MB.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  const typingEntries = Object.entries(typingUsers)
    .filter(([, isTyping]) => isTyping)
    .map(([userId]) => userId);

  // Persist open state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CHAT_BUBBLE_OPEN_KEY, isOpen ? "true" : "false");
  }, [isOpen]);

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

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col">
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-3 w-80 flex flex-col h-[600px] rounded-3xl border border-sand bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-oxblood to-red-800 px-4 py-4 shrink-0">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Hộp thư CSKH</h3>
              <p className="text-xs text-red-100">Nhân viên hỗ trợ 24/7</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-full w-6 h-6 hover:bg-red-950 transition text-white"
              aria-label="Đóng chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container - fixed height, scrollable */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#fff7f2]"
          >
            {/* Loading older indicator */}
            {loadingOlderMessages && (
              <div className="text-center text-xs text-stone-500 py-1">Đang tải tin nhắn cũ hơn...</div>
            )}
            {hasMoreMessages && !loadingOlderMessages && messages.length > 0 && (
              <div className="text-center text-[10px] text-stone-400 py-1">Cuộn lên để xem tin nhắn cũ</div>
            )}

            {!conversation ? (
              <div className="text-xs text-stone-500">Đang kết nối...</div>
            ) : loadingMessages ? (
              <div className="text-xs text-stone-500">Đang tải tin nhắn...</div>
            ) : messages.length === 0 ? (
              <div className="text-xs text-stone-500">Chào bạn! 👋 Đây là hộp chat với đội hỗ trợ của chúng tôi. Hãy bắt đầu cuộc trò chuyện.</div>
            ) : (
              <>
                {messages.map((message) => {
                  const isMine = message.sender_id === session?.user.id;
                  return (
                    <div
                      key={message.id}
                      className={`group relative flex ${isMine ? "justify-end" : "justify-start"}`}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div className={`${isMine ? "" : ""} max-w-[90%]`}>
                        {message.deleted_at ? (
                          <div className="italic text-stone-400 text-xs px-3 py-2">Tin nhắn đã bị xóa</div>
                        ) : message.message_type === "booking_card" ? (
                          (() => {
                            const data = getBookingCardData(message);
                            return data?.booking ? (
                              <BookingCard booking={data.booking} />
                            ) : (
                              <div className="text-xs text-stone-500">Không thể hiển thị đơn hàng</div>
                            );
                          })()
                        ) : message.message_type === "image" && message.metadata?.url ? (
                          <div className={`${isMine ? "" : ""} max-w-[240px]`}>
                            <img
                              src={message.metadata.url as string}
                              alt=""
                              className="rounded-2xl border border-sand/70 shadow-sm w-full h-auto object-cover"
                              loading="lazy"
                            />
                            <span className="block text-[10px] mt-1 opacity-70 text-right">
                              {new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ) : message.message_type === "video" && message.metadata?.url ? (
                          <div className={`${isMine ? "" : ""} max-w-[240px]`}>
                            <video
                              src={message.metadata.url as string}
                              controls
                              className="rounded-2xl border border-sand/70 shadow-sm w-full h-auto max-h-[320px] object-contain bg-black"
                              preload="metadata"
                            />
                            <span className="block text-[10px] mt-1 opacity-70 text-right">
                              {new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ) : message.message_type === "product_card" ? (
                          (() => {
                            const product = getProductCardData(message);
                            return product ? (
                              <ProductCard product={product} />
                            ) : (
                              <div className="text-xs text-stone-500">Không thể hiển thị sản phẩm</div>
                            );
                          })()
                        ) : (
                          <div
                            className={`${
                              isMine ? "bg-lotus text-white" : "bg-white border border-sand/70 text-stone-900"
                            } rounded-2xl px-3 py-2 text-xs shadow-sm`}
                          >
                            <p className="leading-5">{message.content}</p>
                            <span className="block text-[10px] mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Delete button - only show for own messages on hover, not for already-deleted */}
                      {isMine && !message.deleted_at && hoveredMessageId === message.id && (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(message.id)}
                          className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] shadow-sm hover:bg-red-600 transition"
                          title="Xoá tin nhắn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}

            {typingEntries.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-sand/70 rounded-2xl px-3 py-2 text-xs text-stone-600">
                  <span className="inline-block">Nhân viên đang nhập</span>
                  <span className="ml-1 inline-block">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      ·
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                      ·
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-sand/70 bg-white p-3 shrink-0">
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleUploadFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !conversation}
                className="inline-flex items-center justify-center rounded-full w-9 h-9 border border-sand bg-white text-stone-500 transition hover:bg-sand/50 hover:text-stone-700 disabled:opacity-50 shrink-0 relative"
                aria-label="Đính kèm file"
              >
                {uploading ? <span className="text-xs">⏳</span> : <Paperclip className="w-4 h-4" />}
              </button>
              <textarea
                rows={2}
                value={messageText}
                onChange={(event) => setMessageText(event.currentTarget.value)}
                onFocus={() => onTyping(true)}
                onBlur={() => onTyping(false)}
                className="flex-1 rounded-2xl border border-sand bg-white px-3 py-2 text-xs outline-none focus:border-lotus resize-none"
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={onSendMessage}
                className="inline-flex items-center justify-center rounded-full w-9 h-9 bg-oxblood text-white transition hover:bg-red-950 shrink-0"
                aria-label="Gửi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="mb-2 rounded-xl bg-rose-600 px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Toggle Button - always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg font-semibold text-white transition ${
          isOpen
            ? "bg-stone-400 hover:bg-stone-500"
            : "bg-oxblood hover:bg-red-950"
        }`}
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? (
          <span className="text-lg">−</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
    </div>
  );
}