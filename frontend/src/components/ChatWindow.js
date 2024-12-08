import React, { useState, useEffect } from "react";
import { fetchConversation, appendToConversation } from "../api/chatApi"; // Assuming you have an API to fetch chat history
import { FaPaperPlane } from "react-icons/fa";

const ChatWindow = ({ chatId, isSidebarVisible }) => {
  const [chat, setChat] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Summariser"); // Default option
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    if (selectedFile) {
      console.log("Selected file:", selectedFile.name); // Debugging log
      setPrompt((prevPrompt) => {
        const updatedPrompt = `${prevPrompt}\n\nAttached file: ${selectedFile.name}`;
        console.log("Updated prompt:", updatedPrompt); // Debugging log
        return updatedPrompt;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the prompt has the correct file name appended
    console.log("Final prompt before submit:", prompt); // Debugging log

    // Read the file content if a file is attached
    let promptWithFile = prompt;

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        // Append file content to the prompt
        promptWithFile += `\n\nFile Content: ${reader.result}`;

        // Form data with the new prompt and file
        const formData = new FormData();
        formData.append("prompt", promptWithFile);
        formData.append("selectedOption", selectedOption);
        formData.append("file", file);

        // Dynamically set the endpoint based on the selected option
        let endpoint = "";
        switch (selectedOption) {
          case "Summariser":
            endpoint = "/summariser";
            break;
          case "QnA":
            endpoint = "/qna";
            break;
          case "Recommendation":
            endpoint = "/recommendation";
            break;
          default:
            break;
        }

        try {
          const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to fetch response from the server");
          }

          const data = await response.json();
          console.log("Data:", data); // Debugging log
          let updatedChat;
          // Update the chat depending on the selected option
          if (selectedOption === "QnA") {
            updatedChat = await appendToConversation(
              chatId,
              promptWithFile,
              data.answer,
              formData
            );
          } else if (selectedOption === "Summariser") {
            updatedChat = await appendToConversation(
              chatId,
              promptWithFile,
              {
                summary: data.summary,
                red_flags: data.red_flags,
              },
              formData
            );
          } else if (selectedOption === "Recommendation") {
            // Assuming the recommendation data contains an array of insurance plans
            updatedChat = await appendToConversation(
              chatId,
              promptWithFile,
              data,
              formData
            );
          }

          setChat(updatedChat);
          setPrompt(""); // Clear prompt after submission
          setFile(null); // Clear file after submission
        } catch (error) {
          console.error("Error fetching the response:", error);
        }
      };

      reader.readAsText(file); // Read the file content as text
    } else {
      // If no file is attached, proceed with the original prompt
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("selectedOption", selectedOption);

      // Dynamically set the endpoint based on the selected option
      let endpoint = "";
      switch (selectedOption) {
        case "Summariser":
          endpoint = "/summariser";
          break;
        case "QnA":
          endpoint = "/qna";
          break;
        case "Recommendation":
          endpoint = "/recommendation";
          break;
        default:
          break;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response from the server");
        }

        const data = await response.json();
        console.log("Data:", data); // Debugging log
        let updatedChat;
        // Update the chat depending on the selected option
        if (selectedOption === "QnA") {
          updatedChat = await appendToConversation(
            chatId,
            prompt,
            data.answer,
            formData
          );
        } else if (selectedOption === "Summariser") {
          updatedChat = await appendToConversation(
            chatId,
            prompt,
            {
              summary: data.summary,
              red_flags: data.red_flags,
            },
            formData
          );
        } else if (selectedOption === "Recommendation") {
          // Assuming the recommendation data contains an array of insurance plans

          updatedChat = await appendToConversation(
            chatId,
            prompt,
            data,
            formData
          );
        }

        setChat(updatedChat);
        setPrompt(""); // Clear prompt after submission
        setFile(null); // Clear file after submission
      } catch (error) {
        console.error("Error fetching the response:", error);
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-800 transition-all duration-300 ${
        isSidebarVisible ? "ml-22" : "ml-0"
      }`}
    >
      {/* Header */}
      <header className="p-4 bg-gray-900 text-white shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-semibold">{selectedOption || "Chat"}</h1>
      </header>

      {/* Chat History */}
      <div className="flex-grow overflow-y-auto px-20">
        {chat?.history.map((entry, index) => (
          <div key={index} className="flex flex-col w-full">
            <div className="font-medium p-4 m-4 rounded-lg shadow-md text-gray-100 self-end bg-green-700 text-justify max-w-xl break-words">
              {entry.prompt}
            </div>

            <div className="font-medium text-sm text-gray-100 p-4 m-4 rounded-lg shadow-md self-start bg-gray-700 text-left">
              {/* Check if entry.response is an object and contains a summary */}
              {entry.response &&
              typeof entry.response === "object" &&
              entry.response.summary ? (
                // If it's the Summariser, display the summary
                <>{entry.response.summary.toString()}</>
              ) : (
                // Otherwise, display the response directly
                <>{entry.response}</>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="p-4 bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 w-full max-w-xl mx-auto"
        >
          {/* Prompt Input */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt"
            className="w-full px-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md max-w-md"
            required
          />

          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 shadow-md focus:outline-none flex items-center"
            >
              {selectedOption}
              <span className="ml-2">{isDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 w-48 mt-2 bg-white text-black shadow-lg rounded-lg">
                <ul>
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSelectedOption("QnA");
                      setIsDropdownOpen(false);
                    }}
                  >
                    QnA
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSelectedOption("Summariser");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Summariser
                  </li>
                  {/* <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSelectedOption("Recommendation");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Recommendation
                  </li> */}
                </ul>
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer text-gray-100">
            📎
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPaperPlane />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
