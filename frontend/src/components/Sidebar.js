import React, { useEffect, useState } from 'react';
import { fetchConversations, deleteConversation } from '../api/chatApi'; 
import './Sidebar.css';

const Sidebar = ({ onSelectChat, onNewChat, toggleSidebar }) => {
  const [conversations, setConversations] = useState([]);

  const loadConversations = async () => {
    const data = await fetchConversations();
    setConversations(data);
  };

  useEffect(() => {
    loadConversations();


    const interval = setInterval(() => {
      loadConversations();
    }, 1000);


    return () => clearInterval(interval);
  }, []);

  const handleNewChat = async () => {
    await onNewChat();
    loadConversations();
  };


  const handleDeleteChat = async (chatId) => {
    await deleteConversation(chatId);
    loadConversations();
  };

  return (
    <div className="sidebar">
      <button className="close-sidebar-btn" onClick={toggleSidebar}>
        Hide Chat History
      </button>
      <button onClick={handleNewChat}>New Chat</button>
      <ul>
        {conversations.map((chat) => {

          const firstPrompt = chat.history && chat.history[0] ? chat.history[0].prompt : 'Untitled Chat';

          return (
            <li key={chat._id} onClick={() => onSelectChat(chat._id)}>
              <span>{firstPrompt}</span>
              <button onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat._id);
              }}>
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
