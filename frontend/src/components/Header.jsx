import React from 'react';
import { Copy, Hash, Users, LogOut } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function Header() {
    const { room, userCount, setRoom } = useChat();

    const copyRoomId = () => {
        navigator.clipboard.writeText(room);
        // Could add a toast notification here
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="bg-green-600/20 p-2 rounded-lg border border-green-500/30">
                    <Hash className="w-5 h-5 text-green-400" />
                </div>

                <div>
                    <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                        {room}
                        <button 
                            onClick={copyRoomId}
                            className="p-1 hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-white"
                            title="Copy Room ID"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {userCount} {userCount === 1 ? 'user' : 'users'}
                        </span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setRoom(null)}
                className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-gray-400 hover:text-red-400"
                title="Leave Room"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );
}
