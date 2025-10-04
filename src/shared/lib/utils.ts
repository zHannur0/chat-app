import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { Message } from "@/modules/chat/types/types";

export function formatTime(date: Date | string | undefined): string {
  if (!date) return "";

  const messageDate = new Date(date);
  const now = new Date();
  const diff = now.getTime() - messageDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return messageDate.toLocaleDateString("en-US", { weekday: "short" });
  }

  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTimeShort(date: Date | string | undefined): string {
  if (!date) return "";

  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateDivider(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  if (isSameYear(date, new Date())) {
    return format(date, "MMMM d");
  }

  return format(date, "MMMM d, yyyy");
}

export function truncateMessage(
  message: string,
  maxLength: number = 50
): string {
  if (message.length <= maxLength) return message;
  return `${message.substring(0, maxLength)}...`;
}

export function groupMessagesByDate(messages: Message[]) {
  return messages.reduce(
    (groups, message) => {
      const date = format(new Date(message.timestamp), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>
  );
}
