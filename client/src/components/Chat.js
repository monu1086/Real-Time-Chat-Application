import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState(null);
  const socket = io('http://localhost:5000');

  useEffect(() => {
    fetch('/api/messages', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data));

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.disconnect();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newMessage);
    if (image) formData.append('image', image);

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    const message = await response.json();
    socket.emit('message', message);
    setNewMessage('');
    setImage(null);
  };

  return (
    <div className="chat">
      <h1>ConnectSphere Chat</h1>
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <p>{msg.content}</p>
            {msg.imageUrl && <img src={msg.imageUrl} alt="Chat" />}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          required
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
