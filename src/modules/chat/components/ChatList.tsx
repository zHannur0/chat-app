"use client";

import { formatTime } from "@/shared/lib/utils";
import { useListChatsQuery } from "@/modules/chat/api/chatApi";
import { useEffect } from "react";
import { getFirebaseApp } from "@/modules/auth/lib/firebaseClient";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import { useRouter } from "next/navigation";
import ChatListSkeleton from "./ChatListSkeleton";

interface ChatListProps {}

const ChatList = (_props: ChatListProps) => {
  const router = useRouter();
  const { data, refetch, isLoading } = useListChatsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: user } = useVerifyQuery();

  useEffect(() => {
    if (!user?.uid) return;
    const db = getFirestore(getFirebaseApp());
    const membershipsRef = collection(db, "memberships");
    const q = query(membershipsRef, where("userId", "==", user.uid));
    const unsub = onSnapshot(q, () => {
      refetch();
    });
    return () => unsub();
  }, [user?.uid, refetch]);

  if (isLoading) return <ChatListSkeleton />;

  return (
    <div>
      {data?.chats?.map(chat => (
        <div
          key={chat.id}
          className="w-full bg-background flex flex-col border-b border-border px-6 py-4 text-inverse cursor-pointer hover:bg-background-muted transition-colors"
          onClick={() =>
            router.push(`/chat?chat=${encodeURIComponent(chat.id)}`)
          }
        >
          <div className="w-full flex justify-between items-center gap-2 mb-1">
            <h1 className="text-lg font-medium truncate flex-1">
              {chat.type === "direct"
                ? chat.peer?.displayName || chat.peer?.email
                : chat.title}
            </h1>
            {(chat.unreadCount ?? 0) > 0 && (
              <p className="opacity-50 rounded-full bg-primary text-white flex items-center justify-center w-6 h-6 flex-shrink-0 text-sm">
                {chat.unreadCount}
              </p>
            )}
          </div>
          <div className="w-full flex justify-between items-center gap-2">
            <p className="opacity-50 truncate flex-1">
              {chat.lastMessage?.text}
            </p>
            <p className="opacity-50 whitespace-nowrap text-sm flex-shrink-0">
              {formatTime(new Date(chat.updatedAt || chat.createdAt))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
