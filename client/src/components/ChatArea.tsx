import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import type { AppMessage } from '../App'; // Import AppMessage type from App.tsx

interface ChatAreaProps {
  messages: AppMessage[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow-1 overflow-auto p-3 p-md-4" style={{ backgroundColor: '#343a40' /* A dark gray for chat area */ }}>
      {messages.length === 0 && (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-chat-square-dots mb-3" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
          <p className="h5">How can I help you today?</p>
        </div>
      )}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} text={msg.text} type={msg.type} />
      ))}
      <div ref={endOfMessagesRef} /> {/* For auto-scrolling */}
    </div>
  );
};

export default ChatArea;
