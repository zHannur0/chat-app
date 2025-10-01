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


const mockData: Chat[] = [
    {
      id: '1',
      name: 'Aslan',
      lastMessage: {
        id: '1',
        chatId: '1',
        content: 'Hi, how is going now?',
        senderId: '2',
        timestamp: new Date('2024-01-01 10:44'),
        isRead: true,
        type: 'text',
      },
      unreadCount: 0,
      status: 'online',
      timestamp: new Date('2024-01-01 10:44'),
    },
    {
      id: '2',
      name: 'Moana',
      lastMessage: {
        id: '2',
        chatId: '2',
        content: 'Yo bro I got some info for you',
        senderId: '3',
        timestamp: new Date('2024-01-01 10:21'),
        isRead: false,
        type: 'text',
      },
      unreadCount: 1,
      status: 'offline',
      timestamp: new Date('2024-01-01 10:21'),
    },
    {
      id: '3',
      name: 'Dragon Love',
      lastMessage: {
        id: '3',
        chatId: '3',
        content: 'Send nuds',
        senderId: '4',
        timestamp: new Date('2024-01-01 10:44'),
        isRead: true,
        type: 'text',
      },
      unreadCount: 0,
      status: 'away',
      timestamp: new Date('2024-01-01 10:44'),
    },
  ];

  interface ChatListProps {
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
  }
  
  const ChatList = ({ selectedChat, setSelectedChat }: ChatListProps) => {
    const { data } = useListChatsQuery();
    const list: Chat[] = data?.chats?.map(mapDtoChatToUi) ?? mockData;

    return (
        <div>
            {list.map((chat) => (
                <div key={chat.id} 
                className="w-full bg-background flex flex-col border-b border-border px-6 py-4 text-inverse"
                onClick={() => setSelectedChat(chat)}
                >
                    <h1 className="text-lg font-medium">{chat.name}</h1>
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