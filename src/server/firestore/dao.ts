import { getFirestore } from "@/server/firebase/admin";
import { ChatDoc, MembershipDoc, MessageDoc, UserDoc } from "@/server/firestore/schema";

const USERS = "users";
const CHATS = "chats";
const MEMBERSHIPS = "memberships"; // root collection, alternative: subcollection of chat
const MESSAGES = "messages";

export function usersCollection() {
  return getFirestore().collection(USERS);
}

export function chatsCollection() {
  return getFirestore().collection(CHATS);
}

export function membershipsCollection() {
  return getFirestore().collection(MEMBERSHIPS);
}

export function messagesCollection() {
  return getFirestore().collection(MESSAGES);
}

export async function upsertUser(user: UserDoc) {
  await usersCollection().doc(user.uid).set(user, { merge: true });
}

export async function createChat(chat: ChatDoc) {
  await chatsCollection().doc(chat.id).set(chat);
}

export async function addMembership(m: MembershipDoc) {
  const key = `${m.chatId}_${m.userId}`;
  await membershipsCollection().doc(key).set(m, { merge: true });
}

export async function listUserChats(userId: string) {
  const snaps = await membershipsCollection().where("userId", "==", userId).get();
  const chatIds = snaps.docs.map(d => (d.data() as MembershipDoc).chatId);
  if (chatIds.length === 0) return [] as ChatDoc[];
  const chatSnaps = await chatsCollection().where("id", "in", chatIds.slice(0, 10)).get();
  // Note: Firestore 'in' limited to 10 items; paginate if needed
  return chatSnaps.docs.map(d => d.data() as ChatDoc);
}

export async function getChatById(chatId: string) {
  const snap = await chatsCollection().doc(chatId).get();
  return (snap.exists ? (snap.data() as ChatDoc) : undefined);
}

export async function createMessage(msg: MessageDoc) {
  console.log(msg);
  await messagesCollection().doc(msg.id).set(msg);
}

export async function listMessages(chatId: string, limit: number, beforeTs?: number) {
  let q = messagesCollection().where("chatId", "==", chatId).orderBy("createdAt", "desc");
  if (beforeTs) q = q.where("createdAt", "<", beforeTs);
  const snaps = await q.limit(limit).get();
  return snaps.docs.map(d => d.data() as MessageDoc);
}

export async function markRead(chatId: string, userId: string, timestamp: number) {
  const key = `${chatId}_${userId}`;
  await membershipsCollection().doc(key).set({ lastReadAt: timestamp }, { merge: true });
}


