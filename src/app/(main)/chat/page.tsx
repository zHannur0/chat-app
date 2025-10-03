'use client'

import { useEffect, useState } from "react";

import SideBar from "@/shared/components/Layout/SideBar";
import ChatWindow from "@/modules/chat/components/ChatWindow";
import { useDevice } from "@/shared/hooks/useDevice";
import { awaitGoogleRedirectCredential } from "@/modules/auth/lib/google";
import { ChatDto } from "@/modules/chat/api/chatApi";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const { isMobile, isTablet } = useDevice();

    const handleSelectChat = (chat: ChatDto | null) => {
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