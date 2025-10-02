'use client'

import { useEffect, useRef, useState } from "react";
import { groupMessagesByDate } from "@/shared/lib/utils";
import { Message } from "@/modules/chat/types/types";
import { useListMessagesQuery, useMarkReadMutation } from "@/modules/chat/api/chatApi";
import { mapDtoMessageToUi } from "@/modules/chat/api/mappers";
import { getFirebaseApp } from "@/modules/auth/lib/firebaseClient";
import { collection, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import DateDivider from "./DateDivider";
import MessageItem from "./MessageItem";
import { useVerifyQuery } from "@/modules/auth/api/authApi";

const ChatHistory = ({ chatId }: { chatId: string }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [rtMessages, setRtMessages] = useState<Message[]>([]);
    const { data } = useListMessagesQuery({ chatId, limit: 30 }, { skip: !chatId });
    const { data: user } = useVerifyQuery();
    const [markRead] = useMarkReadMutation();
    
    useEffect(() => {
        if (!chatId) {
            setRtMessages([]);
            return;
        }
        const db = getFirestore(getFirebaseApp());
        const q = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(q, (snap) => {
            const items: Message[] = snap.docs.map((d) => {
                const v = d.data() as any;
                const readBy: Record<string, number> = v.readBy || {};
                let isRead = false;
                if (user?.uid) {
                    if (v.senderId === user.uid) {
                        // Own message: considered read if any other user has read it
                        isRead = Object.keys(readBy).some((uid) => uid !== user.uid);
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
                    type: 'text',
                } as Message;
            });
            setRtMessages(items);
        });
        return () => unsub();
    }, [chatId, user?.uid]);

    useEffect(() => {
        if (!chatId) return;
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            markRead({ chatId }).catch(() => {});
        }, 300);
        return () => clearTimeout(timer);
    }, [chatId]);
      
    const apiMessages: Message[] = (data?.messages || []).map(mapDtoMessageToUi);
    const messages: Message[] = rtMessages.length ? rtMessages : apiMessages;
    const groupedMessages = groupMessagesByDate(messages.length ? messages : []);
    
    return (
        <div className="flex-1 overflow-y-auto bg-background-muted w-full">
            <div className="mx-auto p-6 w-full">
                {Object.entries(groupedMessages).map(([date, messages]) => (
                    <div key={date}>
                        <DateDivider date={date} />
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <MessageItem key={message.id} message={message} isOwn={message.senderId === user?.uid} />
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
