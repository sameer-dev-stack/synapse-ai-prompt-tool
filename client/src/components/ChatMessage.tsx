import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Keep framer-motion for animations

export type MessageType = 'userInput' | 'aiPrompt' | 'error';

interface ChatMessageProps {
  text: string;
  type: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, type }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const isUser = type === 'userInput';
  const isError = type === 'error';

  let messageRowClasses = "d-flex mb-3";
  let bubbleClasses = "p-2 rounded shadow-sm";
  let iconWrapperClasses = "me-2"; // For AI/Error icons
  let iconContent = null;

  if (isUser) {
    messageRowClasses += " justify-content-end";
    bubbleClasses += " bg-primary text-white"; // Bootstrap primary for user
  } else {
    messageRowClasses += " justify-content-start";
    if (isError) {
      bubbleClasses += " bg-danger-subtle text-danger-emphasis border border-danger-subtle";
      iconContent = <span className="fs-5">⚠️</span>; // Error icon
    } else { // AI Prompt
      bubbleClasses += " bg-secondary text-light"; // Bootstrap secondary for AI
      // Simple Bot icon using Bootstrap Icons (if installed) or SVG
      iconContent = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
          <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM11 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM0 13.5A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 14.5 1.5h-13A1.5 1.5 0 0 0 0 3v10.5ZM1.5 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-11Z"/>
          <path d="M2 13.292A1.496 1.496 0 0 1 1.5 13V3a1.5 1.5 0 0 1 3 0v10a1.5 1.5 0 0 1-3 0Zm11 0A1.496 1.496 0 0 1 11.5 13V3a1.5 1.5 0 0 1 3 0v10a1.5 1.5 0 0 1-3 0Z"/>
        </svg>
      );
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy'), 2000);
  };

  return (
    <motion.div
      className={messageRowClasses}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!isUser && iconContent && (
        <motion.div 
          className={iconWrapperClasses}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {iconContent}
        </motion.div>
      )}
      <div className="mw-100" style={isUser ? {maxWidth: '75%'} : {maxWidth: '75%'}}> {/* Max width for bubble container */}
        <motion.div 
          className={bubbleClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
        >
          <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{text}</div>
        </motion.div>
        {!isUser && !isError && (
          <motion.div 
            className="mt-1 d-flex align-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <button onClick={handleCopy} className="btn btn-link btn-sm text-muted p-1 me-1">
              {/* Copy Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-clipboard me-1" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
              {copyButtonText}
            </button>
            {/* Thumbs Up/Down */}
            <button className="btn btn-link btn-sm text-muted p-1 me-1">👍</button>
            <button className="btn btn-link btn-sm text-muted p-1">👎</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
