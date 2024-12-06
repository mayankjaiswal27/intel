import { FaTrashAlt } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { fetchConversations, deleteConversation } from '../api/chatApi';

const Sidebar = ({ onSelectChat, onNewChat, toggleSidebar }) => {
  const [conversations, setConversations] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    toggleSidebar(); 
  };

  return (
    <div
      className={`h-screen transition-all duration-300 bg-gray-900 text-white flex flex-col shadow-lg ${
        isSidebarVisible ? 'w-72' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        {/* Hamburger Icon */}
        <button
          className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
          onClick={handleToggleSidebar}
        >
          <div className="space-y-1">
            <div className="w-6 h-1 bg-white"></div>
            <div className="w-6 h-1 bg-white"></div>
            <div className="w-6 h-1 bg-white"></div>
          </div>
        </button>
      </div>

      {/* Only show when sidebar is visible */}
      {isSidebarVisible && (
        <>
          {/* New Chat Button */}
          <div className="px-4 py-2">
            <button
              className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 transition"
              onClick={handleNewChat}
            >
              + New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-grow overflow-y-auto p-4">
            <ul className="space-y-3">
              {conversations.map((chat) => {
                const firstPrompt =
                  chat.history && chat.history[0] ? chat.history[0].prompt : 'Untitled Chat';

                return (
                  <li
                    key={chat._id}
                    onClick={() => onSelectChat(chat._id)}
                    className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition"
                  >
                    {/* Chat Title */}
                    <span className="truncate text-sm font-medium">{firstPrompt}</span>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat._id);
                      }}
                      className="text-red-500 hover:text-red-400 transition text-sm"
                    >
                      <FaTrashAlt className="w-5 h-5" /> 
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
