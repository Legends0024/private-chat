import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useChat } from '../context/ChatContext';

export default function ChatBox() {
    const { messages, typingUsers } = useChat();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingUsers]);

    const typingList = Object.values(typingUsers).filter(Boolean);

    return (
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 relative scroll-smooth bg-pattern"
        >
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                    <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                </div>
            )}
            
            {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
            ))}

            {typingList.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic ml-2 animate-pulse mt-2 bg-white/5 py-1 px-2 rounded-full w-fit">
                    <div className="flex gap-1">
                        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                    </div>
                    {typingList.join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing...
                </div>
            )}
        </div>
    );
}