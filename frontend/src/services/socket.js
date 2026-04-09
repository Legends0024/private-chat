import { io } from "socket.io-client";

// In Unified mode, the frontend is served by the backend, 
// so we can connect to the same host using an empty string or window.location.origin.
const URL = window.location.origin;

const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;