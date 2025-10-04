import { Message, MessageStatus } from "../types/types";
import { Check, CheckCheck } from 'lucide-react';
import { formatTimeShort } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import MessageStatusComponent from "./MessageStatus";

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
    messageStatus?: MessageStatus;
}

const MessageItem = ({ message, isOwn, messageStatus = 'sent' }: MessageItemProps) => { 
    return (
        <motion.div
        initial={{ opacity: 0, transform: "translateY(10px) scale(0.95)" }}
        animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`
                max-w-[70%] px-6 py-3 rounded-2xl
                ${isOwn 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-white text-inverse rounded-bl-sm shadow-sm'
                }
            `}>
                <p className="break-words">{message.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${
                    isOwn ? 'text-white/70' : 'text-inverse'
                }`}>
                    <span className="text-xs">
                        {formatTimeShort(message.timestamp)}
                    </span>
                    {isOwn && (
                        <span className="inline-flex">
                            <MessageStatusComponent 
                                status={messageStatus} 
                                isOwn={isOwn}
                            />
                        </span>
                    )}
                    {/* Debug info */}
                
                </div>
                
             </div>
        </motion.div>
    )
}

export default MessageItem;