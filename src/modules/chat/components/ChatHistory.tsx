"use client";

import { useEffect, useRef, useState } from "react";
import { useMarkReadMutation } from "@/modules/chat/api/chatApi";
import { getFirebaseApp } from "@/modules/auth/lib/firebaseClient";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
// import { useVerifyQuery } from "@/modules/auth/api/authApi";
// import { useSendMessage } from "@/modules/chat/hooks/useSendMessage";
import InfiniteScrollMessages from "./InfiniteScrollMessages";

const ChatHistory = ({ chatId }: { chatId: string }) => {
  const [isBotTyping, setIsBotTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const { data: user } = useVerifyQuery();
  const [markRead] = useMarkReadMutation();
  // const { queue } = useSendMessage();

  // Listen for new bot messages to stop typing indicator
  useEffect(() => {
    if (!chatId) return;

    const db = getFirestore(getFirebaseApp());
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc"),
      where("createdAt", ">", Date.now() - 60000) // Only listen to messages from last minute
    );

    const unsub = onSnapshot(q, snap => {
      // Check for new bot messages to stop typing indicator
      const hasNewBotMessage = snap.docChanges().some(ch => {
        const v = ch.doc.data() as any;
        return ch.type === "added" && v.isBot === true && v.chatId === chatId;
      });

      if (hasNewBotMessage) {
        setIsBotTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    });

    return () => unsub();
  }, [chatId]);

  // Listen for client-side event to start typing indicator
  useEffect(() => {
    const onTyping = (e: Event) => {
      const ev = e as CustomEvent<{ chatId: string }>;
      if (!ev?.detail?.chatId || ev.detail.chatId !== chatId) return;
      setIsBotTyping(true);
      // Safety timeout (10s) in case reply fails
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsBotTyping(false);
        typingTimeoutRef.current = null;
      }, 10000);
    };
    window.addEventListener("bot-typing", onTyping as EventListener);
    return () =>
      window.removeEventListener("bot-typing", onTyping as EventListener);
  }, [chatId]);

  // Mark messages as read when chat changes
  useEffect(() => {
    if (!chatId) return;
    const timer = setTimeout(() => {
      console.log("📖 Marking messages as read for chat:", chatId);
      markRead({ chatId })
        .then(() => {
          console.log("✅ Successfully marked messages as read");
        })
        .catch(error => {
          console.error("❌ Failed to mark messages as read:", error);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [chatId, markRead]);

  return (
    <div className="flex flex-col h-full">
      <InfiniteScrollMessages
        chatId={chatId}
        onScrollToBottom={() => {
          // Mark as read when user scrolls to bottom
          markRead({ chatId }).catch(console.error);
        }}
      />
      {isBotTyping && (
        <div className="px-6 py-2 text-sm text-inverse/60 bg-background-muted border-t border-border">
          AI Bot is typing…
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
