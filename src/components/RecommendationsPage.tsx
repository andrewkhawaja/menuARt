import React, { useState } from "react";
import Navigation from "./Navigation";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const RecommendationsPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I can help you find the perfect food item. What are you in the mood for today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    const newUserMessage: Message = { sender: "user", text: inputText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newUserMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse: Message = { sender: "ai", text: data.response };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error sending message to backend:", error);
      const errorMessage: Message = {
        sender: "ai",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--text-color)",
      }}
    >
      <Navigation />
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--secondary-accent-color)" }}
        >
          AI Food Recommendations
        </h1>

        {/* Chat Window */}
        <div
          className="flex-grow rounded-lg p-4 overflow-y-auto mb-4"
          style={{
            maxHeight: "60vh",
            backgroundColor: "var(--card-background)",
            border: "1px solid var(--border-color)",
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-3 rounded-lg ${
                  message.sender === "user" ? "user-message" : "ai-message"
                }`}
                style={
                  {
                    // Background and color handled by .user-message and .ai-message classes
                  }
                }
              >
                {message.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-color"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
            placeholder="Ask for a recommendation..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="btn py-2 px-4 rounded-r-md transition-colors"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
