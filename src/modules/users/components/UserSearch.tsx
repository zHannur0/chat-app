"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchUsersQuery } from "@/modules/users/api/userApi";
import {
  useCreateChatMutation,
  useListChatsQuery,
} from "@/modules/chat/api/chatApi";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Props = { onChatCreated?: (chatId: string) => void };

const UserSearch = ({ onChatCreated }: Props) => {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useSearchUsersQuery({ q }, { skip: q.trim().length < 2 });
  const { data: chats } = useListChatsQuery();
  const { data: currentUser } = useVerifyQuery();
  const [createChat] = useCreateChatMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartChat = async (uid: string) => {
    try {
      const res = await createChat({
        type: "direct",
        memberIds: [uid],
      }).unwrap();
      onChatCreated?.(res.chat.id);
      setShowResults(false);
      setQ("");
      router.push(`/chat?chat=${encodeURIComponent(res.chat.id)}`);
    } catch {
      console.log("Failed to create chat");
    }
  };

  const getExistingChatId = (uid: string): string | undefined => {
    const list = chats?.chats || [];
    const found = list.find(
      c =>
        c.type === "direct" &&
        Array.isArray(c.memberIds) &&
        c.memberIds.includes(uid)
    );
    return found?.id;
  };

  return (
    <div className="w-full bg-background border-b border-border text-inverse h-[69px] flex items-center px-6">
      <div className="relative w-full" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-inverse/50 w-4 h-4" />
          <input
            value={q}
            onChange={e => {
              setQ(e.target.value);
              setShowResults(e.target.value.trim().length >= 2);
            }}
            onFocus={() => setShowResults(q.trim().length >= 2)}
            placeholder="Search by email..."
            className="w-full bg-background-muted rounded-lg pl-10 pr-4 py-2 text-inverse placeholder-inverse/50 border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        {showResults && q.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {data?.users
              ?.filter(u => u.uid !== currentUser?.uid)
              .map(u => {
                const existing = getExistingChatId(u.uid);
                return (
                  <div
                    key={u.uid}
                    className="flex items-center justify-between px-4 py-3 hover:bg-background-muted transition-colors border-b border-border last:border-b-0"
                    onClick={() => {
                      if (existing) {
                        setShowResults(false);
                        setQ("");
                        router.push(
                          `/chat?chat=${encodeURIComponent(existing)}`
                        );
                      } else {
                        handleStartChat(u.uid);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-inverse truncate">
                        {u.displayName || u.email || u.uid}
                      </div>
                      {u.email && u.displayName && (
                        <div className="text-sm text-inverse/60 truncate">
                          {u.email}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {!data?.users?.filter(u => u.uid !== currentUser?.uid).length && (
              <div className="px-4 py-3 text-inverse/50 text-center">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
