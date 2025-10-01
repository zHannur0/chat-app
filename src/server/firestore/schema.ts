export type UserDoc = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
};

export type ChatType = "direct" | "group" | "bot";

export type ChatDoc = {
  id: string;
  type: ChatType;
  title?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt?: number;
  memberIds: string[]; // denormalized for quick listing
  botId?: string; // when type === "bot"
};

export type MembershipDoc = {
  chatId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: number;
  muted?: boolean;
  archived?: boolean;
  lastReadAt?: number;
};

export type MessageDoc = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  readBy?: Record<string, number>; // userId -> timestamp
  isBot?: boolean;
  meta?: Record<string, unknown>;
};


