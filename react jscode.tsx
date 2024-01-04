/* eslint-disable react/no-array-index-key */
/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Chat.css'; // Import the CSS file for styling

const socket = io('http://localhost:3001', {
  transports: ['websocket'], // Use WebSocket transport
});

const Chat = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log('Attempting to connect...');
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('message', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('message');
    };
  }, []);

  const handleLogin = () => {
    socket.emit('login', username);
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      const recipient = username; // Replace with the username of the recipient
      console.log('Sending message:', { recipient, message });
      socket.emit('message', { recipient, message });
      setMessage('');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index} className={msg.id === socket.id ? 'receiver' : 'sender'}>
            {msg.sender}
            {' '}
            {msg.message}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
