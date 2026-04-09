import React, { useState, useEffect, useRef } from "react";
import socket from "../services/socket";
import { useChat } from "../context/ChatContext";
import { Copy, LogOut, Send, ChevronDown, CheckCircle2, Smile } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function Chat() {
  const { username, room, setRoom } = useChat();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showUserList, setShowUserList] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [copied, setCopied] = useState(false);
  
  const scrollRef = useRef(null);
  const userListRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  // SOCKET LOGIC
  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("join", { username, room });

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    const onReceiveMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, type: "message", id: Date.now() + Math.random() }]);
      if (data.username !== username) {
        audioRef.current.play().catch(() => {});
      }
    };
    
    const onUserJoined = (data) => {
      setMessages((prev) => [...prev, { ...data, type: "system", id: Date.now() + Math.random() }]);
    };
    
    const onUserLeft = (data) => {
      setMessages((prev) => [...prev, { ...data, type: "system", id: Date.now() + Math.random() }]);
    };
    
    const onRoomUsers = (data) => {
      setOnlineUsers(data.users);
    };

    const onTyping = (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.username]: data.is_typing
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("room_users", onRoomUsers);
    socket.on("display_typing", onTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("room_users", onRoomUsers);
      socket.off("display_typing", onTyping);
    };
  }, [username, room]);

  // AUTO-SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userListRef.current && !userListRef.current.contains(event.target)) {
        setShowUserList(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HANDLERS
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { room, username, is_typing: e.target.value.length > 0 });
  };

  const onEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
    // Keep focus on input
    inputRef.current?.focus();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      socket.emit("send_message", { room, username, msg: message });
      socket.emit("typing", { room, username, is_typing: false });
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const copyRoomKey = () => {
    navigator.clipboard.writeText(room);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const anyoneTyping = Object.entries(typingUsers)
    .filter(([user, isTyping]) => isTyping && user !== username)
    .map(([user]) => user);

  return (
    <div className="flex flex-col h-screen bg-galaxy-dark text-galaxy-text font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="bg-galaxy-surface/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/10 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Private Space</span>
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 shadow-lg shadow-black/20">
                <span className="font-mono text-indigo-400 font-black text-sm">{room}</span>
                <button onClick={copyRoomKey} className="text-gray-500 hover:text-white transition-colors">
                  {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            
            <div className="relative" ref={userListRef}>
              <button onClick={() => setShowUserList(!showUserList)} className="flex items-center gap-1.5 mt-1 group">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[10px] text-gray-400 font-bold group-hover:text-white transition-colors flex items-center gap-1">
                  {onlineUsers.length} online <ChevronDown size={10} className={showUserList ? "rotate-180" : ""} />
                </span>
              </button>

              <AnimatePresence>
                {showUserList && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-galaxy-surface border border-white/20 rounded-2xl shadow-2xl p-2 z-[60]"
                  >
                    <div className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 mb-1">Active Members</div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {onlineUsers.map((user, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className={`text-xs font-bold ${user === username ? "text-indigo-400" : "text-gray-200"}`}>
                            {user} {user === username && "(Me)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button onClick={() => setRoom(null)} className="p-2.5 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-2xl border border-white/20 transition-all active:scale-95 group shadow-lg">
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar relative">
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
                {m.type === "system" ? (
                  <div className="flex justify-center my-2 text-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-1 rounded-full border border-white/10">
                      {m.msg}
                    </span>
                  </div>
                ) : (
                  <div className={`flex flex-col ${m.username === username ? "items-end" : "items-start"}`}>
                    {m.username !== username && <span className="text-[10px] font-black text-gray-500 mb-1.5 ml-2 uppercase tracking-widest">{m.username}</span>}
                    <div className={`max-w-[85%] md:max-w-[70%] px-5 py-3 shadow-2xl relative group ${m.username === username ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[22px] rounded-br-none border-t border-white/20" : "bg-galaxy-surface border border-white/10 text-galaxy-text rounded-[22px] rounded-bl-none shadow-black/40"}`}>
                      <p className="text-sm leading-relaxed font-bold selection:bg-white/20 whitespace-pre-wrap break-words">{m.msg}</p>
                      {m.username === username && <div className="absolute inset-0 bg-indigo-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[22px]" />}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1.5 mx-2 font-black opacity-60">{m.timestamp}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>

        {anyoneTyping.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col items-start">
            <div className="bg-galaxy-surface/50 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
              <div className="flex gap-1">
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{anyoneTyping.length === 1 ? `${anyoneTyping[0]} is typing...` : "Multiple people typing..."}</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} className="h-4" />
      </main>

      {/* INPUT BAR */}
      <footer className="bg-galaxy-surface/80 backdrop-blur-xl p-4 md:p-6 border-t border-white/10 relative">
        {/* Emoji Picker */}
        <div className="absolute bottom-full left-4 md:left-8 mb-4 z-[100]" ref={emojiPickerRef}>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}>
                <Picker data={data} onEmojiSelect={onEmojiSelect} theme="dark" set="native" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative group">
          <div className="flex-1 relative flex items-center">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`absolute left-4 p-1.5 rounded-full transition-all ${showEmojiPicker ? "bg-indigo-500 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
              <Smile size={20} />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder={isConnected ? "Message room..." : "Lost connection..."}
              value={message}
              onChange={handleTyping}
              disabled={!isConnected}
              className="glass-input w-full pl-12"
              style={{ backgroundColor: "#1e293b", color: "white" }}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-gray-700 text-white px-6 rounded-2xl transition-all active:scale-95 shadow-glow-indigo flex items-center justify-center border border-white/20"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}