import { io, type Socket } from "socket.io-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:4000";
const chatSocketUrl = `${apiBaseUrl}/chat`;

let socket: Socket | null = null;

export function createChatSocket(accessToken: string) {
  const token = `Bearer ${accessToken}`;

  if (socket) {
    if (socket.connected) {
      const currentAuth = socket.auth;
      if (
        currentAuth &&
        typeof currentAuth === "object" &&
        currentAuth.token !== token
      ) {
        socket.auth = { token };
        socket.disconnect().connect();
      }
    } else {
      socket.auth = { token };
      socket.connect();
    }
    return socket;
  }

  socket = io(chatSocketUrl, {
    auth: { token },
    reconnectionDelayMax: 30000,
    timeout: 30000,
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
