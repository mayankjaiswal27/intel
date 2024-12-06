import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { createConversation } from './api/chatApi';

const App = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleNewChat = async () => {
    const newChat = await createConversation(`Chat ${Date.now()}`);
    setCurrentChatId(newChat._id); 
  };

  return (
    <div className="app flex w-full">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${sidebarVisible ? 'w-72' : 'w-16'}`}
      >
        <Sidebar
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
      </div>

      {/* Chat Window */}
      <div className={`flex-grow transition-all duration-300 ${sidebarVisible ? 'ml-42' : 'ml-0'}`}>
        <ChatWindow chatId={currentChatId} isSidebarVisible={sidebarVisible}/>
      </div>
    </div>
  );
};

export default App;
