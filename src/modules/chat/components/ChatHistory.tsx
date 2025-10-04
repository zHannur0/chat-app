"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [markRead] = useMarkReadMutation();

  const handleScrollToBottom = useCallback(() => {
    markRead({ chatId }).catch(console.error);
  }, [markRead, chatId]);

  useEffect(() => {
    if (!chatId) return;

    const db = getFirestore(getFirebaseApp());
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc"),
      where("createdAt", ">", Date.now() - 60000)
    );

    const unsub = onSnapshot(q, snap => {
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

  useEffect(() => {
    const onTyping = (e: Event) => {
      const ev = e as CustomEvent<{ chatId: string }>;
      if (!ev?.detail?.chatId || ev.detail.chatId !== chatId) return;
      setIsBotTyping(true);
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

  useEffect(() => {
    if (!chatId) return;
    const timer = setTimeout(() => {
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
    <div className="flex-1 flex-col overflow-y-auto">
      <InfiniteScrollMessages
        chatId={chatId}
        onScrollToBottom={handleScrollToBottom}
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
