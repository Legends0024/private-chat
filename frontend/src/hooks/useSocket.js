import { useEffect, useCallback, useRef } from 'react';
import socket from '../services/socket';
import { useChat } from '../context/ChatContext';

export const useSocket = () => {
    const { 
        room, 
        username, 
        setMessages, 
        setUserCount, 
        setTypingUsers, 
        setIsConnected,
        isConnected,
        encodeMessage,
        decodeMessage 
    } = useChat();

    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    const connect = useCallback(() => {
        if (!socket.connected) {
            socket.connect();
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socket.connected) {
            socket.disconnect();
        }
    }, []);

    const sendMessage = useCallback((msg) => {
        if (room && msg.trim()) {
            // Encode message before sending
            const encoded = encodeMessage ? encodeMessage(msg) : msg;
            socket.emit('message', { room, msg: encoded, username });
        }
    }, [room, username, encodeMessage]);

    const sendTyping = useCallback((isTyping) => {
        if (room && username) {
            socket.emit('typing', { room, username, isTyping });
        }
    }, [room, username]);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onStatus = (data) => {
            if (data.user_count !== undefined) setUserCount(data.user_count);
            setMessages((prev) => [...prev, {
                ...data,
                isStatus: true
            }]);
        };

        const onMessage = (data) => {
            if (data.username !== username) {
                audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
            }
            setMessages((prev) => [...prev, {
                ...data,
                msg: decodeMessage ? decodeMessage(data.msg) : data.msg
            }]);
        };

        const onTyping = (data) => {
            setTypingUsers((prev) => ({
                ...prev,
                [data.sid]: data.isTyping ? data.username : null
            }));
        };

        // Attach listeners once
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('status', onStatus);
        socket.on('message', onMessage);
        socket.on('display_typing', onTyping);

        // Cleanup: Remove listeners to prevent memory leaks and duplicates
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('status', onStatus);
            socket.off('message', onMessage);
            socket.off('display_typing', onTyping);
        };
    }, [setMessages, setUserCount, setTypingUsers, setIsConnected, decodeMessage, username]);

    // Handle room join when room changes or connection is established
    useEffect(() => {
        if (room && username && isConnected) {
            socket.emit('join', { room, username });
        }
    }, [room, username, isConnected]);

    return {
        connect,
        disconnect,
        sendMessage,
        sendTyping
    };
};

