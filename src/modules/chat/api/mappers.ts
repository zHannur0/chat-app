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



