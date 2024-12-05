import React, { useState, useEffect } from 'react';
import { fetchConversation, appendToConversation } from '../api/chatApi';
import './ChatWindow.css';

const ChatWindow = ({ chatId }) => {
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
    <div className="chat-window">
      {chatId && <h3 className="chat-id">Chat Title: {firstPrompt}</h3>}


      <ul>
        {chat?.history.map((entry, index) => (
          <li key={index}>
            <div className="prompt">{entry.prompt}</div>
            <div className="response">{entry.response}</div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt"
        />
        <input
          type="file"
          onChange={handleFileChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
