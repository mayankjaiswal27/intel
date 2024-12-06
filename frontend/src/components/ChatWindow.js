import React, { useState, useEffect } from 'react';
import { fetchConversation, appendToConversation } from '../api/chatApi';
import { FaPaperPlane } from 'react-icons/fa';

const ChatWindow = ({ chatId, isSidebarVisible }) => {
  const [chat, setChat] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        const data = await fetchConversation(chatId);
        setChat(data);
      }
    };
    loadChat();
  }, [chatId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('prompt', prompt);
    if (file) {
      formData.append('file', file);
    }
    const dummyResponse = 'This is a dummy response';
    const updatedChat = await appendToConversation(chatId, prompt, dummyResponse, formData);
    setPrompt('');
    setFile(null);
    setChat(updatedChat);
  };

  const firstPrompt = chat?.history && chat.history[0] ? chat.history[0].prompt : 'Untitled Chat';

  return (
    <div
      className={`flex flex-col h-screen bg-gray-800 transition-all duration-300 ${
        isSidebarVisible ? 'ml-22' : 'ml-0'
      }`}
    >
      {/* Header */}
      <header className="p-4 bg-gray-900 text-white shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-semibold">{firstPrompt || 'Chat'}</h1>
      </header>

      {/* Chat History */}
      <div className="flex-grow overflow-y-auto px-20">
        {chat?.history.map((entry, index) => (
          <div key={index} className="flex flex-col w-full">
            {/* User's message - Right aligned */}
            <div className="font-medium p-4 m-4 rounded-lg shadow-md text-gray-100 self-end bg-green-700 text-justify max-w-xl break-words">
              {entry.prompt}
            </div>

            {/* Bot's message - Center aligned */}
            <div className="font-medium text-sm text-gray-100 p-4 m-4 rounded-lg shadow-md self-start bg-gray-700 text-left">
              {entry.response}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="p-4 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 w-full max-w-xl mx-auto">
          {/* Prompt Input */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt"
            className="w-full px-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md max-w-md"
            required
          />
          {/* File Input */}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 cursor-pointer shadow-md"
          >
            📎
          </label>
          {/* Submit Button */}
          <button
            type="submit"
            className={`px-4 py-3 rounded-full flex items-center justify-center shadow-md ${
              prompt ? 'bg-green-600 hover:bg-blue-500' : 'bg-green-300 cursor-not-allowed'
            }`}
            disabled={!prompt}
          >
            <FaPaperPlane className="w-5 h-5 mr-2" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
