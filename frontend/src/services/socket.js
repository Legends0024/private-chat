import { io } from "socket.io-client";

// Part 2.12: Socket connection setup
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"]
});

export default socket;