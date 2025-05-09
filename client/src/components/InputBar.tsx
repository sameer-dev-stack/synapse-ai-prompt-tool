import React, { useRef, useEffect } from 'react';

interface InputBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ inputValue, onInputChange, onSubmit, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoading && inputValue.trim()) {
      onSubmit();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && inputValue.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="p-2 p-md-3 bg-dark border-top">
      <form onSubmit={handleSubmit} className="input-group">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="form-control form-control-sm bg-secondary text-light border-secondary"
          style={{ resize: 'none', maxHeight: '100px' }} // Max height for textarea
          rows={1}
          disabled={isLoading}
          aria-label="Prompt input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="btn btn-primary btn-sm" // Bootstrap primary button
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            // Send icon (Paper airplane) - Bootstrap Icons can be used here if installed
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
            </svg>
          )}
        </button>
      </form>
      <p className="text-muted small text-center mt-2">
        Our AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default InputBar;
