"use client";

import { useRef, useState, useCallback } from "react";
import { useSendMessage } from "@/modules/chat/hooks/useSendMessage";
import EmojiPicker from "emoji-picker-react";

const MAX_LENGTH = 4096;

const MessageInputForm = ({ chatId }: { chatId: string }) => {
  const [message, setMessage] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, queue } = useSendMessage();

  useState(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const handleSend = useCallback(async () => {
    if (!message.trim() || message.length > MAX_LENGTH) return;

    const text = message.trim();
    setMessage("");

    try {
      const result = await sendMessage(chatId, text);

      const isBotChat =
        chatId.includes("bot") || chatId === process.env.BOT_CHAT_ID;
      if (isBotChat && result.status === "sent") {
        window.dispatchEvent(
          new CustomEvent("bot-typing", { detail: { chatId } })
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    inputRef.current?.focus();
  }, [message, chatId, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    if (value.length <= MAX_LENGTH) {
      setMessage(value);
    }
  };

  const getCharacterCountColor = () => {
    const ratio = message.length / MAX_LENGTH;
    if (ratio > 0.9) return "text-red-500";
    if (ratio > 0.8) return "text-yellow-500";
    return "text-gray-500";
  };

  const failedMessages = queue.filter(msg => msg.status === "failed");
  const isSending = queue.some(msg => msg.status === "sending");

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col bg-background w-full border-t border-border text-inverse">
      {isOffline && (
        <div className="px-6 py-2 bg-yellow-100 text-yellow-800 text-sm text-center">
          You're offline. Messages will be sent when connection is restored.
        </div>
      )}

      {failedMessages.length > 0 && (
        <div className="px-6 py-2 bg-red-100 text-red-800 text-sm text-center">
          {failedMessages.length} message(s) failed to send. Retrying...
        </div>
      )}

      <div className="flex h-18 px-6 py-5 gap-2">
        <div className="flex flex-1 relative items-center">
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write a message..."
            rows={1}
            disabled={isSending}
            className="w-full rounded-2xl resize-none outline-none placeholder:text-inverse/50 bg-gray-100 px-4 py-2"
          />

          {message.length > 0 && (
            <div
              className={`absolute bottom-1 right-2 text-xs ${getCharacterCountColor()}`}
            >
              {message.length}/{MAX_LENGTH}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-2xl opacity-50 cursor-pointer ml-2"
          >
            <img src="/icons/emoji.svg" alt="emoji" className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 right-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || message.length > MAX_LENGTH}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-border border-t-transparent rounded-full animate-spin" />
          ) : (
            <img
              src={message ? "/icons/sendActive.svg" : "/icons/send.svg"}
              alt="send"
              className="w-5 h-5"
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInputForm;
