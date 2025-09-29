'use client'

import { useEffect, useRef } from "react";
import { groupMessagesByDate } from "@/shared/lib/utils";
import { Message } from "@/modules/chat/types/types";
import DateDivider from "./DateDivider";
import MessageItem from "./MessageItem";


export const mockMessages: Message[] = [
    {
      id: '1',
      chatId: '1',
      senderId: '2',
      content: 'Hey! Long time no see! How have you been?',
      timestamp: new Date('2024-01-12 09:30'),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      chatId: '1',
      senderId: '1',
      content: 'Hi Aslan! I\'m doing great, thanks for asking! Just been super busy with work lately.',
      timestamp: new Date('2024-01-12 09:32'),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      chatId: '1',
      senderId: '2',
      content: 'I totally understand. Same here actually. The new project is keeping me on my toes.',
      timestamp: new Date('2024-01-12 09:35'),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      chatId: '1',
      senderId: '1',
      content: 'Oh nice! What kind of project are you working on?',
      timestamp: new Date('2024-01-12 09:40'),
      isRead: true,
      type: 'text',
    },
    {
      id: '5',
      chatId: '1',
      senderId: '2',
      content: 'It\'s a new mobile app for a startup. Really exciting stuff! We\'re using React Native.',
      timestamp: new Date('2024-01-12 09:42'),
      isRead: true,
      type: 'text',
    },
    
    // 2 дня назад
    {
      id: '6',
      chatId: '1',
      senderId: '2',
      content: 'By the way, are you free this weekend?',
      timestamp: new Date('2024-01-13 14:00'),
      isRead: true,
      type: 'text',
    },
    {
      id: '7',
      chatId: '1',
      senderId: '1',
      content: 'Let me check my calendar... Yeah, Saturday afternoon works for me!',
      timestamp: new Date('2024-01-13 14:15'),
      isRead: true,
      type: 'text',
    },
    {
      id: '8',
      chatId: '1',
      senderId: '2',
      content: 'Perfect! There\'s this new coffee place downtown I\'ve been wanting to try.',
      timestamp: new Date('2024-01-13 14:20'),
      isRead: true,
      type: 'text',
    },
    {
      id: '9',
      chatId: '1',
      senderId: '1',
      content: 'Sounds great! What time should we meet?',
      timestamp: new Date('2024-01-13 14:25'),
      isRead: true,
      type: 'text',
    },
    {
      id: '10',
      chatId: '1',
      senderId: '2',
      content: 'How about 3 PM? The place is called "Brew & Bean" on Main Street.',
      timestamp: new Date('2024-01-13 14:30'),
      isRead: true,
      type: 'text',
    },
    
    // Вчера
    {
      id: '11',
      chatId: '1',
      senderId: '1',
      content: 'Just wanted to confirm we\'re still on for tomorrow?',
      timestamp: new Date('2024-01-14 18:00'),
      isRead: true,
      type: 'text',
    },
    {
      id: '12',
      chatId: '1',
      senderId: '2',
      content: 'Absolutely! Looking forward to it.',
      timestamp: new Date('2024-01-14 18:05'),
      isRead: true,
      type: 'text',
    },
    {
      id: '13',
      chatId: '1',
      senderId: '2',
      content: 'Oh wait, I just remembered something...',
      timestamp: new Date('2024-01-14 18:06'),
      isRead: true,
      type: 'text',
    },
    {
      id: '14',
      chatId: '1',
      senderId: '2',
      content: 'Do you mind if I bring my friend Jake? He\'s new in town and doesn\'t know many people yet.',
      timestamp: new Date('2024-01-14 18:07'),
      isRead: true,
      type: 'text',
    },
    {
      id: '15',
      chatId: '1',
      senderId: '1',
      content: 'Of course not! The more the merrier. It\'ll be nice to meet him.',
      timestamp: new Date('2024-01-14 18:15'),
      isRead: true,
      type: 'text',
    },
    
    // Сегодня
    {
      id: '16',
      chatId: '1',
      senderId: '2',
      content: 'Yo Samurai, me and pokemon head will going to Dostyk, will u join?',
      timestamp: new Date('2025-09-28 10:00'),
      isRead: true,
      type: 'text',
    },
    {
      id: '17',
      chatId: '1',
      senderId: '1',
      content: 'Okay what excactly we\'re doing there?',
      timestamp: new Date('2025-09-28 10:05'),
      isRead: true,
      type: 'text',
    },
    {
      id: '18',
      chatId: '1',
      senderId: '1',
      content: 'First of all, could we have a snack at Memo\'s',
      timestamp: new Date('2025-09-28 10:06'),
      isRead: true,
      type: 'text',
    },
    {
      id: '19',
      chatId: '1',
      senderId: '2',
      content: 'We\'ll have to look for a gift for Alina',
      timestamp: new Date('2025-09-28 10:10'),
      isRead: true,
      type: 'text',
    },
    {
      id: '20',
      chatId: '1',
      senderId: '2',
      content: 'Ok cool',
      timestamp: new Date('2025-09-28 10:11'),
      isRead: false,
      type: 'text',
    },
  ];


const ChatHistory = () => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    //     }, 300);      

    //     return () => clearTimeout(timer);
    // }, [mockMessages]);
      
    const groupedMessages = groupMessagesByDate(mockMessages);

    return (
        <div className="flex-1 overflow-y-auto bg-background-muted">
            <div className="mx-auto p-6">
                {Object.entries(groupedMessages).map(([date, messages]) => (
                    <div key={date}>
                        <DateDivider date={date} />
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <MessageItem key={message.id} message={message} isOwn={message.senderId === '1'} />
                            ))}
                        </div>
                       
                    </div>
                ))}
            </div>
            
            <div ref={bottomRef} />
        </div>
    )
}

export default ChatHistory;
