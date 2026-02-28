import io from "socket.io-client";

const SOCKET_URL ="https://ikkahin-hra.onrender.com";

console.log("🔗 Connecting to Socket.io server at:", SOCKET_URL);

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Socket CONNECTED! ID:", socket.id);
});

socket.on("connecting", () => {
  console.log("⏳ Socket connecting...");
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket DISCONNECTED. Reason:", reason);
});

socket.on("reconnect", () => {
  console.log("🔄 Socket RECONNECTED!");
});

socket.on("error", (error) => {
  console.error("⚠️ Socket ERROR:", error);
});

// Log all incoming events for debugging
socket.onAny((eventName, ...args) => {
  if (eventName !== "ping") {
    console.log(`📨 Socket Event: ${eventName}`, args);
  }
});

export default socket;
