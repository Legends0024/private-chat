import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../services/socket';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [room, setRoom] = useState(null);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState({});
    const [isConnected, setIsConnected] = useState(false);

    // Simple Base64 "encryption" for messaging demonstration
    const encodeMessage = React.useCallback((text) => btoa(unescape(encodeURIComponent(text))), []);
    const decodeMessage = React.useCallback((encoded) => {
        try {
            return decodeURIComponent(escape(atob(encoded)));
        } catch (e) {
            return encoded; // Fallback to raw if not encoded
        }
    }, []);


    const value = {
        room,
        setRoom,
        username,
        setUsername,
        messages,
        setMessages,
        userCount,
        setUserCount,
        typingUsers,
        setTypingUsers,
        isConnected,
        setIsConnected,
        encodeMessage,
        decodeMessage,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
