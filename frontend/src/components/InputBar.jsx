import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

export default function InputBar() {
    const [msg, setMsg] = useState("");
    const { sendMessage, sendTyping } = useSocket();
    const typingTimeoutRef = useRef(null);

    const handleSend = (e) => {
        e.preventDefault();
        if (msg.trim()) {
            sendMessage(msg);
            setMsg("");
            sendTyping(false);
        }
    };

    const handleInputChange = (e) => {
        setMsg(e.target.value);
        
        // Handle typing indicator
        sendTyping(true);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(false);
        }, 3000);
    };

    return (
        <form 
            onSubmit={handleSend}
            className="p-4 bg-[#0f172a] border-t border-white/10"
        >
            <div className="flex items-center gap-2 max-w-5xl mx-auto relative">
                <div className="flex gap-1">
                    <button type="button" className="p-2 text-gray-500 hover:text-green-400 transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-gray-500 hover:text-green-400 transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                </div>

                <input
                    value={msg}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 glass-input py-2 text-sm"
                />

                <button 
                    disabled={!msg.trim()}
                    type="submit"
                    className="bg-green-600 p-2.5 rounded-xl text-white hover:bg-green-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-green-500/20"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>

    );
}
