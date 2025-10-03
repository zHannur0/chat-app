'use client'

import { formatTime } from "@/shared/lib/utils";
import { ChatDto } from "@/modules/chat/api/chatApi";
import { useListChatsQuery } from "@/modules/chat/api/chatApi";
import { useEffect } from 'react';
import { getFirebaseApp } from '@/modules/auth/lib/firebaseClient';
import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import { useVerifyQuery } from '@/modules/auth/api/authApi';
import { mapDtoChatToUi } from "@/modules/chat/api/mappers";
import { useRouter } from 'next/navigation';
import ChatListSkeleton from './ChatListSkeleton';

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    isRead: boolean;
    type: string;
}

  interface ChatListProps {}
  
  const ChatList = ({}: ChatListProps) => {
    const router = useRouter();
    const { data, refetch, isLoading } = useListChatsQuery(undefined, { refetchOnFocus: true, refetchOnReconnect: true });
    const { data: user } = useVerifyQuery();

    useEffect(() => {
      if (!user?.uid) return;
      const db = getFirestore(getFirebaseApp());
      const membershipsRef = collection(db, 'memberships');
      const q = query(membershipsRef, where('userId', '==', user.uid));
      const unsub = onSnapshot(q, () => {
        refetch();
      });
      return () => unsub();
    }, [user?.uid, refetch]);

    if (isLoading) return <ChatListSkeleton />;

    return (
        <div>
            {data?.chats?.map((chat) => (
                <div key={chat.id} 
                className="w-full bg-background flex flex-col border-b border-border px-6 py-4 text-inverse"
                onClick={() => router.push(`/chat?chat=${encodeURIComponent(chat.id)}`)}
                >
                    <div className="w-full flex justify-between items-center">
                        <h1 className="text-lg font-medium">{chat.type === 'direct' ? (chat.peer?.displayName || chat.peer?.email) : chat.title}</h1>
                        {
                          (chat.unreadCount ?? 0) > 0 && (
                            <p className="opacity-50 rounded-full bg-primary text-white flex items-center justify-center w-6 h-6">{chat.unreadCount}</p>
                          )
                        }
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p className="opacity-50">{chat.lastMessage?.text}</p>
                        <p className="opacity-50">{formatTime(new Date(chat.updatedAt || chat.createdAt))}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ChatList;