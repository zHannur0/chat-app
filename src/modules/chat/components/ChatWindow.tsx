'use client'

import ChatWindowHeader from "./ChatWindowHeader";
import ChatHistory from "./ChatHistory";
import MessageInputForm from "./MessageInputForm";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useGetChatByIdQuery } from "@/modules/chat/api/chatApi";


interface ChatWindowProps {
    chatId?: string;
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
}

const mobileVariants = {
    hidden: {
        x: '100%',
        transition: {
            type: 'tween',
            duration: 0.3,
            ease: 'easeInOut'
        }
    },
    visible: {
        x: 0,
        transition: {
            type: 'tween',
            duration: 0.3,
            ease: 'easeInOut'
        }
    }
};

const desktopVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut'
        }
    }
};


const ChatWindow = ({ chatId, isOpen, onClose, isMobile }: ChatWindowProps) => {

    const { data } = useGetChatByIdQuery(chatId as string, { skip: !chatId });
    const chatData = (data as any)?.chat;
    
    if (!chatId && !isMobile) {
        return (
            <div className="flex-1 h-full flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {(isOpen || !isMobile) && chatId && chatData && (
                 <motion.div className={`flex flex-col w-full h-[calc(100vh-93px)]`}
                        key={chatId}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={isMobile ? mobileVariants as Variants : desktopVariants as Variants}
                 >
                    <ChatWindowHeader isMobile={isMobile} onClose={onClose} chat={chatData} />
                    <ChatHistory chatId={chatId} />
                    <MessageInputForm chatId={chatId} />
                 </motion.div>
            )}

           
        </AnimatePresence>
        
    )
}

export default ChatWindow;