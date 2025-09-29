'use client'

import { Send } from "lucide-react";
import { useRef, useState } from "react";

const MessageInputForm = () => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
  
    const handleSend = () => {
        if (message.trim()) {
          setMessage('');
          inputRef.current?.focus();
        }
    };
  
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  
    const handleChange = (value: string) => {
      setMessage(value);
    };

    return (
        <div className="flex bg-background w-full h-18 px-6 py-5 border-t border-border text-inverse gap-2">
            <div className="flex-1 relative">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Write a message..."
                    rows={1}
                    className="w-full rounded-2xl 
                        resize-none outline-none 
                        placeholder:text-inverse/50"
                />
            </div>
            <button>
                <Send className="w-5 h-5" 
                    onClick={handleSend}
                />
            </button>
        </div>
    )
}

export default MessageInputForm;