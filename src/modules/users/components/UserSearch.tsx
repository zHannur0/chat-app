'use client'

import { useState } from 'react';
import { useSearchUsersQuery } from '@/modules/users/api/userApi';
import { useCreateChatMutation } from '@/modules/chat/api/chatApi';

type Props = { onChatCreated?: (chatId: string) => void };

const UserSearch = ({ onChatCreated }: Props) => {
    const [q, setQ] = useState('');
    const { data } = useSearchUsersQuery({ q }, { skip: q.trim().length < 2 });
    const [createChat] = useCreateChatMutation();

    const handleStartChat = async (uid: string) => {
        try {
            const res = await createChat({ type: 'direct', memberIds: [uid] }).unwrap();
            onChatCreated?.(res.chat.id);
        } catch {}
    };

    return (
        <div className="w-full bg-background p-4 border-b border-border text-inverse">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by email..."
                className="w-full rounded-md bg-transparent outline-none"
            />
            {q.trim().length >= 2 && (
                <div className="mt-3 space-y-2">
                    {data?.users?.map(u => (
                        <div key={u.uid} className="flex items-center justify-between">
                            <div className="truncate">{u.email || u.uid}</div>
                            <button className="text-primary" onClick={() => handleStartChat(u.uid)}>Start</button>
                        </div>
                    ))}
                    {!data?.users?.length && <div className="opacity-50">No results</div>}
                </div>
            )}
        </div>
    );
};

export default UserSearch;


