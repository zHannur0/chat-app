'use client'

import { formatTime } from "@/shared/lib/utils";
import { Chat } from "../types/types";
import { useListChatsQuery } from "@/modules/chat/api/chatApi";
import { mapDtoChatToUi } from "@/modules/chat/api/mappers";

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    isRead: boolean;
    type: string;
}

  interface ChatListProps {
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
  }
  
  const ChatList = ({ selectedChat, setSelectedChat }: ChatListProps) => {
    const { data } = useListChatsQuery(undefined, { pollingInterval: 3000, refetchOnFocus: true, refetchOnReconnect: true });
    const list: Chat[] = data?.chats?.map(mapDtoChatToUi) ?? [];

    return (
        <div>
            {list.map((chat) => (
                <div key={chat.id} 
                className="w-full bg-background flex flex-col border-b border-border px-6 py-4 text-inverse"
                onClick={() => setSelectedChat(chat)}
                >
                    <div className="w-full flex justify-between items-center">
                        <h1 className="text-lg font-medium">{chat.name}</h1>
                        {
                          chat.unreadCount > 0 && (
                            <p className="opacity-50 rounded-full bg-primary text-white flex items-center justify-center w-6 h-6">{chat.unreadCount}</p>
                          )
                        }
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p className="opacity-50">{chat.lastMessage.content}</p>
                        <p className="opacity-50">{formatTime(chat.timestamp)}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ChatList;