import { io } from "socket.io-client";

const socket = io("https://ikkahin-hra.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;