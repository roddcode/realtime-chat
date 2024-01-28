import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('/');

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
    
    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <>
      <section className='w-full p-6'>
        <ul id='messages'>
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
        <form action='POST' id='form' className='flex gap-2' onSubmit={handleSubmit}>
          <input
            className='bg-inherit border-gray-300 border-2 rounded-md text-white p-2 outline-none'
            type='text'
            name='message'
            id='input'
            placeholder='Type a message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type='submit' className='btn'>Send</button>
        </form>
      </section>
    </>
  );
}

export default App;
