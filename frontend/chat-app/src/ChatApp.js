import React, { useState, useEffect } from "react";
import { io as socketClient } from "socket.io-client";
import "./ChatApp.css"; // Import CSS file

const socket = socketClient("http://localhost:5000", { transports: ["websocket"] });

const ChatApp = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (users) => {
      setTypingUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { user: username, text: message });
      setMessage("");
      socket.emit("stopTyping", username);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  const handleStopTyping = () => {
    socket.emit("stopTyping", username);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h2>Chat Application</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="messages">
          {messages.map((msg, index) => (
            <p key={index} className="message"><strong>{msg.user}:</strong> {msg.text}</p>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            onBlur={handleStopTyping}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        {typingUsers.length > 0 && <p className="typing">{typingUsers.join(", ")} is typing...</p>}
      </div>
    </div>
  );
};

export default ChatApp;
