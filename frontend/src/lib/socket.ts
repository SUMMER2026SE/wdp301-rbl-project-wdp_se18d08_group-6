import { io, type Socket } from "socket.io-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:4000";
const chatSocketUrl = `${apiBaseUrl}/chat`;

let socket: Socket | null = null;

export function createChatSocket(accessToken: string) {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(chatSocketUrl, {
    auth: {
      token: `Bearer ${accessToken}`,
    },
    transports: ["websocket"],
  });

  return socket;
}

export function getChatSocket() {
  return socket;
}

export function disconnectChatSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
