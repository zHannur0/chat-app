export interface Chat {
    id: string;
    name: string;
    lastMessage: Message;
    unreadCount: number;
    status: string;
    timestamp: Date;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
    type: 'text' | 'image' | 'file' | 'voice';
    editedAt?: Date;
    replyTo?: string;
  }