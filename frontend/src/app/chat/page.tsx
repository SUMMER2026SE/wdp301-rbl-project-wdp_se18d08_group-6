"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createChatSocket, disconnectChatSocket } from "@/lib/socket";
import {
  getChatConversations,
  getConversationLockStatus,
  getConversationMessages,
  getMyChatConversation,
  getBookingCardData,
  getProductCardData,
  getBookingTopic,
  markConversationRead,
  type ChatConversation,
  type ChatMessage,
  type ConversationLockStatus,
} from "@/lib/chat";
import { CustomerChatBubble } from "./customer-chat-bubble";
import { StaffChatWorkspace } from "./staff-chat-workspace";
import { useRouter } from "next/navigation";
import { StaffPortalShell } from "@/components/heritage/ui";
export default function ChatPage() {
  const { session, status } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [lockStatus, setLockStatus] = useState<ConversationLockStatus | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [staffCanReply, setStaffCanReply] = useState(false);
  const [staffLockError, setStaffLockError] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"assigned" | "unassigned" | "resolved">("assigned");
  const [notification, setNotification] = useState<string | null>(null);


  const previousConversationIdRef = useRef<string | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedConversationRef = useRef<ChatConversation | null>(null);
  // Track if we've already restored the staff workspace after socket connect.
  const autoOpenedRef = useRef(false); 
  const isAcceptingConversationRef = useRef(false);
  const hasManuallyInteractedRef = useRef(false);
  const isStaff = session?.user.role === "staff";

  const assignedConversations = isStaff
    ? conversations.filter((conversation) => conversation.staffId === session?.user.id && conversation.status !== "resolved")
    : conversations;

  const unassignedConversations = isStaff
    ? conversations.filter((conversation) => conversation.staffId === null && conversation.status === "open" && !conversation.reopenedFromResolved && conversation.lastMessage?.sender_id === conversation.customerId)
    : [];

  const socket = useMemo(() => {
    if (!session?.accessToken) {
      return null;
    }
    return createChatSocket(session.accessToken);
  }, [session?.accessToken]);

  const typingEntries = Object.entries(typingUsers).filter(([, isTyping]) => isTyping).map(([userId]) => userId);

  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Restore the first assigned staff conversation after reload and reclaim send permission.
  useEffect(() => {
    if (!socket || !connected || !isStaff || conversations.length === 0) return;
    if (autoOpenedRef.current) return;     
    if (hasManuallyInteractedRef.current) return;

    const myConv = assignedConversations[0];
    if (myConv && myConv.id !== selectedConversation?.id) {
      autoOpenedRef.current = true; 
      void joinConversation(myConv.id, false);
    }
  }, [socket, connected, isStaff, conversations, assignedConversations, selectedConversation?.id]);

  useEffect(() => {
    if (!socket) return;

    const onMessageReceived = (payload: { conversationId: string; message: ChatMessage; staffId?: string | null; status?: string }) => {
      // Always update messages if this conversation is selected
      if (payload.conversationId === selectedConversation?.id) {
        setMessages((prev) => [...prev, payload.message]);
        // Mark read via REST when receiving message in active conversation
        if (payload.message.sender_id !== session?.user.id) {
          void markConversationRead(payload.conversationId);
        }
      }
      // Refresh lock status when staff sends a message (timeout is renewed by backend)
      if (payload.message.sender_id === session?.user.id) {
        void refreshLockStatus(payload.conversationId);
      }
      // Always update the sidebar conversation's lastMessage
      let updatedTopicFields: Record<string, unknown> | null = null;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== payload.conversationId) return c;
          let topicExtras: Record<string, unknown> = {};
          if (payload.message.sender_id === c.customerId && payload.message.message_type === "product_card") {
            const product = getProductCardData(payload.message);
            if (product) {
              topicExtras = { topic: "product_advice", garmentId: product.id, garmentName: product.name, bookingId: null };
            }
          } else if (payload.message.sender_id === c.customerId && payload.message.message_type === "booking_card") {
            const data = getBookingCardData(payload.message);
            if (data?.booking) {
              topicExtras = { topic: data.topic ?? "booking_support", bookingId: data.booking.id, garmentId: null, garmentName: null };
            }
          }
          const updated = {
            ...c,
            lastMessage: payload.message,
            updatedAt: payload.message.created_at,
            unreadCount: payload.message.sender_id !== session?.user.id ? c.unreadCount + 1 : 0,
            ...(payload.staffId !== undefined ? { staffId: payload.staffId } : {}),
            ...(payload.status !== undefined ? { status: payload.status } : {}),
            ...(payload.message.sender_id === c.customerId ? topicExtras : {}),
          };
          if (payload.conversationId === selectedConversation?.id && Object.keys(topicExtras).length > 0) {
            updatedTopicFields = topicExtras;
          }
          return updated;
        }),
      );

      // Also update selectedConversation for real-time header update
      if (payload.conversationId === selectedConversation?.id) {
        setSelectedConversation((prev) => {
          if (!prev) return prev;
          const updates: Record<string, unknown> = {};
          if (payload.staffId !== undefined) updates.staffId = payload.staffId;
          if (payload.status !== undefined) updates.status = payload.status;
          if (updatedTopicFields) Object.assign(updates, updatedTopicFields);
          return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
        });
      }
    };
    const onMessageDeleted = (payload: { conversationId: string; messageId: string; deletedBy: string; deletedAt: string }) => {
      if (payload.conversationId === selectedConversation?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? { ...m, deleted_at: payload.deletedAt, deleted_by: payload.deletedBy, content: "" }
              : m,
          ),
        );
      }
      // Also update sidebar lastMessage if it was the deleted message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId && c.lastMessage?.id === payload.messageId
            ? { ...c, lastMessage: { ...c.lastMessage, deleted_at: payload.deletedAt, deleted_by: payload.deletedBy, content: "" } }
            : c,
        ),
      );
    };
    const onConversationRead = (payload: { conversationId: string; readerId: string }) => {
      if (payload.conversationId !== selectedConversation?.id) return;
      setTypingUsers((prev) => ({ ...prev, [payload.readerId]: false }));
    };
    const onTyping = (payload: { conversationId: string; isTyping: boolean; userId: string }) => {
      if (payload.conversationId !== selectedConversation?.id) return;
      setTypingUsers((prev) => ({ ...prev, [payload.userId]: payload.isTyping }));
    };
    const onOpenResult = (payload: { conversationId?: string; canReply: boolean; lockedBy?: string; staffId?: string; staffName?: string; status?: string }) => {
      const conversationId = payload.conversationId ?? selectedConversation?.id;
      setStaffCanReply(payload.canReply);
      setStaffLockError(payload.canReply ? null : `Bị khoá bởi ${payload.lockedBy ?? "người khác"}`);

      if (payload.canReply && conversationId && session?.user) {
        const staffName = session.user.fullName ?? session.user.email;
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, staffId: session.user.id, staffName, status: payload.status ?? conversation.status }
              : conversation,
          ),
        );
        setSelectedConversation((prev) =>
          prev?.id === conversationId ? { ...prev, staffId: session.user.id, staffName, status: payload.status ?? prev.status } : prev,
        );
          if (isAcceptingConversationRef.current) {
            setSidebarTab("assigned");
            isAcceptingConversationRef.current = false;
          }
      }

      void refreshLockStatus(conversationId);
    };
    const onChatLocked = (payload: { conversationId: string; staffName: string }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === payload.conversationId ? { ...conversation, staffName: payload.staffName } : conversation,
        ),
      );

      if (payload.conversationId === selectedConversation?.id) {
        void refreshLockStatus();
      }
    };
    const onChatUnlocked = (payload: { conversationId: string; status?: string }) => {
      const isRevertingToResolved = payload.status === "resolved";
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === payload.conversationId
            ? { ...conversation, ...(isRevertingToResolved ? {} : { staffId: null, staffName: null }), status: payload.status ?? conversation.status }
            : conversation,
        ),
      );
      if (payload.conversationId === selectedConversation?.id) {
        setSelectedConversation((prev) => prev ? { ...prev, ...(isRevertingToResolved ? {} : { staffId: null, staffName: null }), status: payload.status ?? prev.status } : prev);
        setStaffCanReply(false);
        setStaffLockError(null);
        void refreshLockStatus();
      }
    };
    const onLockExpired = (payload: { conversationId: string }) => {
      if (payload.conversationId !== selectedConversation?.id) return;
      setStaffCanReply(false);
      setStaffLockError("Phiên trả lời đã hết hạn.");
      void refreshLockStatus();
    };
    const onConversationResolved = (payload: { conversationId: string; status?: string }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === payload.conversationId
            ? { ...conversation, status: payload.status ?? "resolved", topic: "general", garmentId: null, garmentName: null }
            : conversation,
        ),
      );
      if (payload.conversationId === selectedConversation?.id) {
        setSelectedConversation((prev) => prev ? { ...prev, status: payload.status ?? "resolved", topic: "general", garmentId: null, garmentName: null } : prev);
        setStaffCanReply(false);
        setStaffLockError("Cuộc trò chuyện đã được đánh dấu đã tư vấn.");
        void refreshLockStatus();
      }
    };
    const onNewUnassignedMessage = (payload: { conversationId: string; customerName: string; content: string }) => {
      setNotification(`Có tin nhắn mới từ khách hàng ${payload.customerName}`);
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      notificationTimerRef.current = setTimeout(() => setNotification(null), 4000);

      // If we don't already have this conversation in the sidebar, add a lightweight placeholder
      setConversations((prev) => {
        if (prev.some((c) => c.id === payload.conversationId)) return prev;
        const newConv: ChatConversation = {
          id: payload.conversationId,
          customerId: "",
          customerName: payload.customerName,
          staffId: null,
          staffName: null,
          status: "open",
          updatedAt: new Date().toISOString(),
          lastMessage: {
            id: `notif-${Date.now()}`,
            conversation_id: payload.conversationId,
            sender_id: "customer",
            content: payload.content,
            created_at: new Date().toISOString(),
          },
          unreadCount: 1,
          reopenedFromResolved: false,
        };
        return [newConv, ...prev];
      });
    };
    const onSendError = (payload: { conversationId: string; reason: string }) => {
      if (payload.conversationId !== selectedConversation?.id) return;
      setStaffLockError("Không thể gửi tin nhắn: cuộc trò chuyện chưa được mở khóa.");
    };

    socket.on("message_received", onMessageReceived);
    socket.on("new_message", onMessageReceived);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("conversation_read", onConversationRead);
    socket.on("typing", onTyping);
    socket.on("user_typing", onTyping);
    socket.on("open_conversation_result", onOpenResult);
    socket.on("chat_locked", onChatLocked);
    socket.on("chat_unlocked", onChatUnlocked);
    socket.on("lock_expired", onLockExpired);
    socket.on("new_unassigned_message", onNewUnassignedMessage);
    socket.on("send_error", onSendError);
    socket.on("conversation_resolved", onConversationResolved);

    return () => {
      socket.off("message_received", onMessageReceived);
      socket.off("new_message", onMessageReceived);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("conversation_read", onConversationRead);
      socket.off("typing", onTyping);
      socket.off("user_typing", onTyping);
      socket.off("open_conversation_result", onOpenResult);
      socket.off("chat_locked", onChatLocked);
      socket.off("chat_unlocked", onChatUnlocked);
      socket.off("lock_expired", onLockExpired);
      socket.off("new_unassigned_message", onNewUnassignedMessage);
      socket.off("send_error", onSendError);
      socket.off("conversation_resolved", onConversationResolved);
    };
  }, [socket, selectedConversation, isStaff, session]);

  useEffect(() => {
    return () => {
      if (isStaff && socket && previousConversationIdRef.current) {
        // Do NOT emit close_conversation on unmount - lock should persist via timeout
        // This prevents accidental lock release on page navigation
      }
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      disconnectChatSocket();
    };
  }, [socket, isStaff]);

  useEffect(() => {
    if (!session) return;
    void loadConversations();
  }, [session]);

  useEffect(() => {
    if (isHydrated && status !== "loading" && session && !isStaff) {
      router.replace("/"); // hoặc "/dashboard/customer"
    }
  }, [isHydrated, status, session, isStaff]);

    useEffect(() => {
    if (isHydrated && status === "unauthenticated") {
      router.replace("/");
    }
  }, [isHydrated, status]);

  useEffect(() => {
  if (!isHydrated || status === "loading") return;

  if (status === "unauthenticated") {
    router.replace("/");
    return;
  }

  if (session && !isStaff) {
    router.replace("/");
  }
}, [isHydrated, status, session, isStaff]);

  useEffect(() => {
    if (!socket || !selectedConversation) return;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    if (!messageText.trim()) {
      socket.emit("typing", { conversationId: selectedConversation.id, isTyping: false });
      return;
    }

    socket.emit("typing", { conversationId: selectedConversation.id, isTyping: true });
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing", { conversationId: selectedConversation.id, isTyping: false });
    }, 1200);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [messageText, selectedConversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Socket connect/disconnect handler – re-join room for both staff and customers on reconnect
  useEffect(() => {
  if (!socket) return;

  const onConnect = () => {
    setConnected(true);
    const conv = selectedConversationRef.current;
    if (!conv) return;

    // Always re-join the room on (re)connect
    socket.emit("join_room", { conversationId: conv.id });

    if (isStaff && conv.staffId === session?.user.id) {
      socket.emit("open_conversation", { conversationId: conv.id });
    } else if (!isStaff) {
      // Customer re-opens their conversation on reconnect
      socket.emit("open_conversation", { conversationId: conv.id });
    }
  };
  const onDisconnect = () => setConnected(false);

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);

  if (socket.connected) {
    onConnect();
  }

  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
  };
  }, [socket, isStaff, session]);

  async function loadConversations() {
    if (!session) return;
    setLoadingConversations(true);

    if (isStaff) {
      const result = await getChatConversations();
      if (result.success && result.data) {
        setConversations(result.data);
      }
    } else {
      // Customer: POST to create or get existing conversation
      const result = await getMyChatConversation();
      if (result.success && result.data) {
        setConversations([result.data]);
        setSelectedConversation(result.data);
        void joinConversation(result.data.id);
        // Emit open_conversation will be handled by the connect handler
      }
    }

    setLoadingConversations(false);
  }

  async function joinConversation(conversationId: string, isManual = false) {
    if (!socket) return;
    currentConversationIdRef.current = conversationId;
    setLockStatus(null);

    if (isManual) hasManuallyInteractedRef.current = true;

    socket.emit("join_room", { conversationId });
    previousConversationIdRef.current = conversationId;
    const conv = conversations.find((c) => c.id === conversationId) ?? null;
    
    setSelectedConversation(conv);
    setStaffCanReply(false);
    setStaffLockError(null);
    await loadMessages(conversationId);

    // Mark read via REST when assigned staff opens a conversation
    if (conv?.status !== "resolved" && conv?.staffId === session?.user.id) {
      void markConversationRead(conversationId);
    }

    if (conv && conv.staffId === session?.user.id && conv.status !== "resolved") {
      socket.emit("open_conversation", { conversationId });
    } else {
      void refreshLockStatus(conversationId);
    }
  }

  async function loadMessages(conversationId: string) {
    setLoadingMessages(true);
    setHasMoreMessages(false);
    const result = await getConversationMessages(conversationId);
    if (result.success && result.data) {
      setMessages(result.data);
      setHasMoreMessages(result.data.length >= 15);
    }
    setLoadingMessages(false);
  }

  async function loadOlderMessages() {
    if (!selectedConversation || messages.length === 0 || loadingOlderMessages) return;
    const oldestMessage = messages[0];
    setLoadingOlderMessages(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    const result = await getConversationMessages(selectedConversation.id, oldestMessage.id);
    if (result.success && result.data) {
      if (result.data.length < 15) {
        setHasMoreMessages(false);
      }
      setMessages((prev) => [...(result.data ?? []), ...prev]);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    }
    setLoadingOlderMessages(false);
  }

  async function refreshLockStatus(conversationId = selectedConversation?.id) {
    if (!conversationId) return;
    const targetId = conversationId;
    const result = await getConversationLockStatus(conversationId);
    if (result.success && result.data && targetId === currentConversationIdRef.current) {
      setLockStatus(result.data);
    }
  }


  function openConversation() {
    if (!socket || !selectedConversation) return;
    isAcceptingConversationRef.current = true; 
    socket.emit("open_conversation", { conversationId: selectedConversation.id });
  }
  function sendMessage() {
    if (!socket || !selectedConversation || !messageText.trim()) return;
    socket.emit("send_message", { conversationId: selectedConversation.id, content: messageText.trim() });
    setMessageText("");
  }

  function deleteMessage(messageId: string) {
    if (!socket || !selectedConversation) return;
    socket.emit("delete_message", { conversationId: selectedConversation.id, messageId });
  }

  function markRead() {
    if (!socket || !selectedConversation) return;
    if (isStaff) {
      socket.emit("resolve_conversation", { conversationId: selectedConversation.id });
      return;
    }

    socket.emit("read_conversation", { conversationId: selectedConversation.id });
  }

  function setTyping(isTyping: boolean) {
    if (!socket || !selectedConversation) return;
    socket.emit("typing", { conversationId: selectedConversation.id, isTyping });
  }

  function handleSetSidebarTab(tab: "assigned" | "unassigned" | "resolved") {
  hasManuallyInteractedRef.current = true;
  setSidebarTab(tab);
  }
  if (!isHydrated || status === "loading") {
  return <div className="min-h-screen bg-mist" />;
  }

  if (!isStaff) {
    return null; // hoặc loading, vì redirect effect sẽ chạy
  }
return (
  <StaffPortalShell
    active="chat"
    title="Hộp thư CSKH"
    subtitle="Chat 1-1 với khách hàng theo thời gian thực."
  >
    {/* HEADER STATUS (giữ lại nếu muốn) */}
    <div className="mb-4 flex justify-end">
      <div className="rounded-lg bg-white px-5 py-2 text-sm text-stone-700 shadow-sm border border-sand">
        Socket:{" "}
        <span className="font-semibold">
          {connected ? "Đã nối" : "Chưa nối"}
        </span>
      </div>
    </div>

    {/* WORKSPACE */}
    <StaffChatWorkspace
      conversations={conversations}
      selectedConversation={selectedConversation}
      messages={messages}
      messageText={messageText}
      setMessageText={setMessageText}
      typingUsers={typingUsers}
      typingEntries={typingEntries}
      loadingConversations={loadingConversations}
      loadingMessages={loadingMessages}
      lockStatus={lockStatus}
      staffCanReply={staffCanReply}
      staffLockError={staffLockError}
      sidebarTab={sidebarTab}
      setSidebarTab={handleSetSidebarTab}
      notification={notification}
      session={session}
      onJoinConversation={(id) => void joinConversation(id, true)}
      onSendMessage={sendMessage}
      onOpenConversation={openConversation}
      onMarkRead={markRead}
      onTyping={setTyping}
      hasMoreMessages={hasMoreMessages}
      loadingOlderMessages={loadingOlderMessages}
      onLoadOlderMessages={loadOlderMessages} 
      messagesContainerRef={messagesContainerRef}
      onDeleteMessage={deleteMessage}
    />
  </StaffPortalShell>
);
}