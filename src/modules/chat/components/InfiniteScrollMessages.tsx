"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteMessages } from "@/modules/chat/hooks/useInfiniteMessages";
import { Message } from "@/modules/chat/types/types";
import { groupMessagesByDate } from "@/shared/lib/utils";
import DateDivider from "./DateDivider";
import MessageItem from "./MessageItem";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import ChatHistorySkeleton from "./ChatHistorySkeleton";
import { useSendMessage } from "@/modules/chat/hooks/useSendMessage";
import { getFirebaseApp } from "@/modules/auth/lib/firebaseClient";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

interface InfiniteScrollMessagesProps {
  chatId: string;
  onScrollToBottom?: () => void;
}

const InfiniteScrollMessages = ({
  chatId,
  onScrollToBottom,
}: InfiniteScrollMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: user } = useVerifyQuery();
  const { queue } = useSendMessage();
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  const { messages, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useInfiniteMessages({ chatId, limit: 30 });

  useEffect(() => {
    if (!chatId) return;

    const db = getFirestore(getFirebaseApp());
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc"),
      where("createdAt", ">", Date.now() - 300000) // Last 5 minutes
    );

    const unsub = onSnapshot(q, snap => {
      const newMessages: Message[] = snap.docs.map(d => {
        const v = d.data() as any;
        const readBy: Record<string, number> = v.readBy || {};
        let isRead = false;

        if (user?.uid) {
          if (v.senderId === user.uid) {
            // Own message: considered read if any other user has read it
            isRead = Object.keys(readBy).some(uid => uid !== user.uid);
          } else {
            // Incoming message: read if current user is in readBy
            isRead = !!readBy[user.uid];
          }
        }

        return {
          id: d.id,
          chatId: v.chatId,
          senderId: v.senderId,
          content: v.text,
          timestamp: new Date(v.createdAt || 0),
          isRead,
          type: "text",
        } as Message;
      });

      setRealtimeMessages(newMessages);
    });

    return () => unsub();
  }, [chatId, user?.uid]);

  // Merge paginated messages with real-time messages
  const allMessages = [
    ...messages,
    ...realtimeMessages.filter(
      rtMsg => !messages.some(msg => msg.id === rtMsg.id)
    ),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const topSentinel = topSentinelRef.current;
    if (!topSentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topSentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current && allMessages.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      onScrollToBottom?.();
    }
  }, [allMessages.length, onScrollToBottom]);

  if (isLoading) {
    return <ChatHistorySkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load messages</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-primary text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(allMessages);

  return (
    <div
      className="flex-1 overflow-y-auto bg-background-muted w-full"
      ref={containerRef}
    >
      <div className="mx-auto p-6 w-full">
        {/* Top sentinel for infinite scroll */}
        {hasMore && (
          <div
            ref={topSentinelRef}
            className="h-4 flex items-center justify-center"
          >
            {isLoadingMore && (
              <div className="text-sm text-gray-500">
                Loading older messages...
              </div>
            )}
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <DateDivider date={date} />
            <div className="space-y-6">
              {messages.map(message => {
                // Get message status from queue for own messages
                const queuedMessage = queue.find(q => q.id === message.id);
                const messageStatus = queuedMessage?.status || "sent";

                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.uid}
                    messageStatus={messageStatus}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom sentinel */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default InfiniteScrollMessages;
