import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { createConversation } from './api/chatApi';
import './App.css';

const App = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleNewChat = async () => {
    const newChat = await createConversation(`Chat ${Date.now()}`);
    setCurrentChatId(newChat._id);
  };

  return (
    <div className="app">
      {sidebarVisible && (
        <Sidebar
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
      )}
      <ChatWindow chatId={currentChatId} />
      {!sidebarVisible && (
        <button className="toggle-sidebar-btn" onClick={() => setSidebarVisible(true)}>
          Show Chat History
        </button>
      )}
    </div>
  );
};

export default App;
