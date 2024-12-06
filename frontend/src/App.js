import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { createConversation } from './api/chatApi';
import Login from './components/Login'; 
import Signup from './components/Signup'; 

const App = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [username, setUsername] = useState('');

  // Handle new chat creation
  const handleNewChat = async () => {
    const newChat = await createConversation(`Chat ${Date.now()}`);
    setCurrentChatId(newChat._id);
  };

  // Handle user login
  const handleLogin = (username) => {
    setUsername(username);
    setIsLoggedIn(true); 
  };

  // Handle user signup
  const handleSignup = (username) => {
    setUsername(username);
    setIsLoggedIn(true); 
  };

  return (
    <Router>
      <div className="app flex w-full min-h-screen">
        {/* Routes for Login and Signup */}
        {!isLoggedIn ? (
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
          </Routes>
        ) : (
          <>
            {/* Sidebar */}
            <div className={`transition-all duration-300 ${sidebarVisible ? 'w-72' : 'w-16'}`}>
              <Sidebar
                onSelectChat={setCurrentChatId}
                onNewChat={handleNewChat}
                toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
              />
            </div>

            {/* Chat Window */}
            <div className={`flex-grow transition-all duration-300 ${sidebarVisible ? 'ml-22' : 'ml-0'}`}>
              <ChatWindow chatId={currentChatId} isSidebarVisible={sidebarVisible} />
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
