import "./styles/main.css";
import { ChatProvider, useChat } from "./context/ChatContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

function AppContent() {
    const { room } = useChat();
    return room ? <Chat /> : <Home />;
}

function App() {
    return (
        <ChatProvider>
            <AppContent />
        </ChatProvider>
    );
}

export default App;