'use client'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface QueuedMessage {
  id: string;
  text: string;
  chatId: string;
  status: MessageStatus;
  attempts: number;
  nextRetry: number;
  createdAt: number;
}

class MessageQueue {
  private storageKey = 'messageQueue';

  // Get all queued messages from localStorage
  getMessages(): QueuedMessage[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get messages from localStorage:', error);
      return [];
    }
  }

  // Add message to queue
  addMessage(message: QueuedMessage): void {
    try {
      const messages = this.getMessages();
      messages.push(message);
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to add message to queue:', error);
    }
  }

  // Update message in queue
  updateMessage(id: string, updates: Partial<QueuedMessage>): void {
    try {
      const messages = this.getMessages();
      const index = messages.findIndex(msg => msg.id === id);
      
      if (index !== -1) {
        messages[index] = { ...messages[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  }

  // Remove message from queue
  removeMessage(id: string): void {
    try {
      const messages = this.getMessages();
      const filtered = messages.filter(msg => msg.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove message:', error);
    }
  }

  // Get messages for specific chat
  getMessagesByChat(chatId: string): QueuedMessage[] {
    return this.getMessages().filter(msg => msg.chatId === chatId);
  }

  // Get failed messages
  getFailedMessages(): QueuedMessage[] {
    return this.getMessages().filter(msg => msg.status === 'failed');
  }

  // Clear all messages
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    }
  }

  // Clear old messages (older than 24 hours)
  clearOldMessages(): void {
    try {
      const messages = this.getMessages();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const filtered = messages.filter(msg => msg.createdAt > oneDayAgo);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to clear old messages:', error);
    }
  }
}

export const messageQueue = new MessageQueue();