'use client'

import SideBar from "@/shared/components/Layout/SideBar";
import ChatWindow from "@/modules/chat/components/ChatWindow";
import { useDevice } from "@/shared/hooks/useDevice";
import { useSearchParams, useRouter } from 'next/navigation';

export default function ChatPage() {
    const { isMobile, isTablet } = useDevice();
    const searchParams = useSearchParams();
    const router = useRouter();
    const chatId = searchParams.get('chat') || undefined;

    const isChatOpen = Boolean(chatId);

    return (
        <div className="flex relative w-full">
             <div className={`w-full
                ${isMobile && isChatOpen ? 'hidden' : 'flex'}
                ${isTablet ? 'w-full sm:w-[320px]' : 'w-full'}
                flex-shrink-0 transition-all duration-300
            `}>
                <SideBar isOpen={isChatOpen} />
            </div>
            <div className={`w-full
                ${isMobile ? '' : 'relative flex-1'}
                ${isMobile && !isChatOpen ? 'pointer-events-none' : ''}
                z-10
            `}>
                <ChatWindow 
                    chatId={chatId}
                    isOpen={isChatOpen}
                    onClose={() => router.push('/chat')}
                    isMobile={isMobile}
                 />
            </div>
        
        </div>
        
    )
}