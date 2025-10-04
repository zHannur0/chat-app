"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useListMessagesQuery } from "@/modules/chat/api/chatApi";
import { Message } from "@/modules/chat/types/types";
import { mapDtoMessageToUi } from "@/modules/chat/api/mappers";

interface UseInfiniteMessagesOptions {
  chatId: string;
  limit?: number;
}

interface UseInfiniteMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  error: any;
}

export function useInfiniteMessages({
  chatId,
  limit = 30,
}: UseInfiniteMessagesOptions): UseInfiniteMessagesReturn {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestTimestamp, setOldestTimestamp] = useState<number | null>(null);
  // const [newestTimestamp, setNewestTimestamp] = useState<number | null>(null);
  const isLoadingInitial = useRef(false);

  // Initial load
  const {
    data: initialData,
    isLoading: isLoadingInitialData,
    error,
    refetch,
  } = useListMessagesQuery({ chatId, limit }, { skip: !chatId });

  // Update state when initial data loads
  useEffect(() => {
    if (initialData && !isLoadingInitial.current) {
      isLoadingInitial.current = true;
      const messages = initialData.messages.map(mapDtoMessageToUi);
      setAllMessages(messages);
      setHasMore(initialData.hasMore);
      if (messages.length > 0) {
        setOldestTimestamp(initialData.prevCursor);
        // setNewestTimestamp(initialData.nextCursor);
      }
    }
  }, [initialData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !oldestTimestamp) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/messages?chatId=${encodeURIComponent(chatId)}&limit=${limit}&beforeTs=${oldestTimestamp}`
      );
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        const newMessages = data.messages.map(mapDtoMessageToUi);
        setAllMessages(prev => [...newMessages, ...prev]);
        setHasMore(data.hasMore);
        setOldestTimestamp(data.prevCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, limit, hasMore, isLoadingMore, oldestTimestamp]);

  const refresh = useCallback(() => {
    setAllMessages([]);
    setHasMore(true);
    setOldestTimestamp(null);
    // setNewestTimestamp(null);
    isLoadingInitial.current = false;
    refetch();
  }, [refetch]);

  return {
    messages: allMessages,
    isLoading: isLoadingInitialData,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    error,
  };
}
