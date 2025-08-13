import React, { useState, useRef, useEffect } from 'react';
import './chatBot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Save chat history to localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem('bazarhub_chat');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bazarhub_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8099/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage,
          chatHistory: messages
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, something went wrong. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([{ sender: 'bot', text: 'Hello! How can I help?' }]);
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>BazarHub Assistant</h3>
            <div className="chatbot-controls">
              <button onClick={clearChat} className="clear-btn" title="Clear chat">
                🗑️
              </button>
              <button onClick={toggleChat} className="minimize-btn" title="Minimize">
                −
              </button>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={toggleChat}>
          <img src="chat-icon.png" alt="Chat" width="24" height="24" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;