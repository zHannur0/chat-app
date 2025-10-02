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
  const last = dto.lastMessage
    ? mapDtoMessageToUi({
        id: dto.lastMessage.id,
        chatId: dto.id,
        senderId: dto.lastMessage.senderId,
        text: dto.lastMessage.text,
        createdAt: dto.lastMessage.createdAt,
        updatedAt: dto.lastMessage.updatedAt,
        isBot: dto.lastMessage.isBot,
      } as MessageDto)
    : {
        id: 'placeholder',
        chatId: dto.id,
        senderId: dto.createdBy,
        content: '',
        timestamp: new Date(dto.updatedAt || dto.createdAt),
        isRead: true,
        type: 'text' as const,
      };

  const displayName = dto.peer?.displayName || dto.peer?.email || 'Chat';

  return {
    id: dto.id,
    name: displayName ,
    lastMessage: last,
    unreadCount: dto.unreadCount ?? 0,
    status: 'online',
    timestamp: new Date(dto.updatedAt || dto.createdAt),
  };
}


