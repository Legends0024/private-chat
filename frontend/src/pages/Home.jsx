import React, { useState } from "react";
import { useChat } from "../context/ChatContext";

export default function Home() {
  const [usernameInput, setUsernameInput] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const { setUsername, setRoom } = useChat();

  const handleJoin = (e) => {
    e.preventDefault();
    if (usernameInput && roomInput) {
      setUsername(usernameInput);
      setRoom(roomInput);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Private Room</h1>
          <p className="text-gray-400 text-sm">Create or join any room — share the key with friends</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="glass-input w-full"
              style={{ backgroundColor: "#1e293b", color: "white" }}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Room Key</label>
            <input
              type="text"
              placeholder="e.g. ALPHA-123"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="glass-input w-full uppercase font-mono"
              style={{ backgroundColor: "#1e293b", color: "white" }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}