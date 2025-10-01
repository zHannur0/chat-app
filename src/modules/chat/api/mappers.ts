import { Chat } from '@/modules/chat/types/types';
import { ChatDto, MessageDto } from '@/modules/chat/api/chatApi';

export function mapDtoMessageToUi(dto: MessageDto) {
  return {
    id: dto.id,
    chatId: dto.chatId,
    senderId: dto.senderId,
    content: dto.text,
    timestamp: new Date(dto.createdAt),
    isRead: true,
    type: 'text' as const,
  };
}

export function mapDtoChatToUi(dto: ChatDto): Chat {
  const placeholderMessage = {
    id: 'placeholder',
    chatId: dto.id,
    senderId: dto.createdBy,
    content: '',
    timestamp: new Date(dto.updatedAt || dto.createdAt),
    isRead: true,
    type: 'text' as const,
  };
  return {
    id: dto.id,
    name: dto.title || 'Chat',
    lastMessage: placeholderMessage,
    unreadCount: 0,
    status: 'online',
    timestamp: new Date(dto.updatedAt || dto.createdAt),
  };
}


