import React from 'react';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
    const { username: currentUsername } = useChat();
    
    if (message.isStatus) {
        return (
            <div className="flex justify-center my-4">
                <span className="bg-white/5 border border-white/10 text-gray-100/40 text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                    {message.msg}
                </span>
            </div>
        );
    }

    const isSelf = message.username === currentUsername;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex w-full mb-4 ${isSelf ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex flex-col space-y-1 ${isSelf ? 'items-end' : 'items-start'} max-w-[80%]`}>
                {!isSelf && (
                    <span className="text-[10px] text-gray-500 ml-2 font-bold uppercase tracking-tight">
                        {message.username}
                    </span>
                )}
                <div className={isSelf ? 'chat-bubble-sender' : 'chat-bubble-receiver'}>
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.msg}</p>
                    <div className={`text-[9px] mt-1 flex ${isSelf ? 'justify-end text-green-100/60' : 'justify-start text-gray-500'}`}>
                        {message.timestamp}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

