'use client'

import { useEffect, useState } from "react";

import SideBar from "@/shared/components/Layout/SideBar";
import ChatWindow from "@/modules/chat/components/ChatWindow";
import { Chat } from "@/modules/chat/types/types";
import { useDevice } from "@/shared/hooks/useDevice";
import { useSignInGoogleMutation } from "@/modules/auth/api/authApi";
import { awaitGoogleRedirectCredential } from "@/modules/auth/lib/google";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const { isMobile, isTablet } = useDevice();
    const [signInGoogle] = useSignInGoogleMutation();

    useEffect(() => {
        // Redirect fallback exchange (two strategies)
        (async () => {
            try {
                const fromCallback = await awaitGoogleRedirectCredential(4000);
                const stored = typeof window !== 'undefined' ? localStorage.getItem('google_redirect_credential') : null;
                const cred = fromCallback || stored || undefined;
                if (cred) {
                    const res = await signInGoogle({ idToken: cred }).unwrap();
                    try {
                        localStorage.setItem('idToken', res.idToken);
                        localStorage.removeItem('google_redirect_credential');
                    } catch {}
                }
            } catch {}
        })();
    }, [signInGoogle]);

    const handleSelectChat = (chat: Chat | null) => {
        setSelectedChat(chat);
        if (chat && isMobile) {
            setIsChatOpen(true);
        }
    };

    const handleCloseChat = () => {
        if (isMobile) {
            setIsChatOpen(false);
            setTimeout(() => {
                setSelectedChat(null);
            }, 300);
        }
    };

    useEffect(() => {
        if (!isMobile && selectedChat) {
            setIsChatOpen(true);
        }
    }, [isMobile, selectedChat]);

    return (
        <div className="flex relative w-full">
             <div className={`w-full
                ${isMobile && isChatOpen ? 'hidden' : 'flex'}
                ${isTablet ? 'w-full sm:w-[320px]' : 'w-full'}
                flex-shrink-0 transition-all duration-300
            `}>
                <SideBar selectedChat={selectedChat} setSelectedChat={handleSelectChat} isOpen={isChatOpen} />
            </div>
            <div className={`w-full
                ${isMobile ? '' : 'relative flex-1'}
                ${isMobile && !isChatOpen ? 'pointer-events-none' : ''}
                z-10
            `}>
                <ChatWindow 
                    selectedChat={selectedChat} 
                    setSelectedChat={setSelectedChat}
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    isMobile={isMobile}
                 />
            </div>
        
        </div>
        
    )
}