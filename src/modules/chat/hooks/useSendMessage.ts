"use client";

import { useState, useCallback, useEffect } from "react";
import { useSendMessageMutation } from "@/modules/chat/api/chatApi";
import {
  messageQueue,
  QueuedMessage,
  MessageStatus,
} from "@/modules/chat/lib/messageQueue";

export function useSendMessage() {
  const [sendMessage] = useSendMessageMutation();
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadMessages = () => {
      const messages = messageQueue.getMessages();
      setQueue(messages);
    };

    loadMessages();

    // Clean up old messages
    messageQueue.clearOldMessages();
  }, []);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Process retry queue
  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const toRetry = queue.filter(
        item => item.status === "failed" && item.nextRetry <= now
      );

      toRetry.forEach(item => retryMessage(item));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, queue]);

  const retryMessage = useCallback(
    async (item: QueuedMessage) => {
      try {
        await sendMessage({
          chatId: item.chatId,
          text: item.text,
        }).unwrap();

        // Remove from queue on success
        messageQueue.removeMessage(item.id);
        setQueue(prev => prev.filter(q => q.id !== item.id));
      } catch {
        const newAttempts = item.attempts + 1;
        const nextRetry = Date.now() + Math.pow(2, newAttempts) * 1000; // Exponential backoff

        if (newAttempts <= 5) {
          const updatedMessage = {
            ...item,
            attempts: newAttempts,
            nextRetry,
            status: "failed" as MessageStatus,
          };

          messageQueue.updateMessage(item.id, updatedMessage);
          setQueue(prev =>
            prev.map(q => (q.id === item.id ? updatedMessage : q))
          );
        } else {
          // Max retries reached, remove from queue
          messageQueue.removeMessage(item.id);
          setQueue(prev => prev.filter(q => q.id !== item.id));
        }
      }
    },
    [sendMessage]
  );

  const sendMessageWithRetry = useCallback(
    async (
      chatId: string,
      text: string
    ): Promise<{ status: MessageStatus; messageId?: string }> => {
      const clientId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add to queue immediately (optimistic)
      const queuedMessage: QueuedMessage = {
        id: clientId,
        text,
        chatId,
        status: "sending",
        attempts: 0,
        nextRetry: 0,
        createdAt: Date.now(),
      };

      messageQueue.addMessage(queuedMessage);
      setQueue(prev => [...prev, queuedMessage]);

      try {
        const result = await sendMessage({ chatId, text }).unwrap();

        // Update status to sent
        const updatedMessage = {
          ...queuedMessage,
          status: "sent" as MessageStatus,
        };
        messageQueue.updateMessage(clientId, updatedMessage);
        setQueue(prev =>
          prev.map(q => (q.id === clientId ? updatedMessage : q))
        );

        return { status: "sent", messageId: result.message.id };
      } catch {
        // Update status to failed
        const updatedMessage = {
          ...queuedMessage,
          status: "failed" as MessageStatus,
          nextRetry: Date.now() + 1000,
        };
        messageQueue.updateMessage(clientId, updatedMessage);
        setQueue(prev =>
          prev.map(q => (q.id === clientId ? updatedMessage : q))
        );

        return { status: "failed" };
      }
    },
    [sendMessage]
  );

  const updateMessageStatus = useCallback(
    (messageId: string, status: MessageStatus) => {
      messageQueue.updateMessage(messageId, { status });
      setQueue(prev =>
        prev.map(q => (q.id === messageId ? { ...q, status } : q))
      );
    },
    []
  );

  return {
    sendMessage: sendMessageWithRetry,
    queue,
    isOnline,
    updateMessageStatus,
  };
}
