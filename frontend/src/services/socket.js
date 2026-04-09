import { io } from "socket.io-client";

// Standard separate deployment setup
const URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(URL, {
  transports: ["websocket"]
});

export default socket;