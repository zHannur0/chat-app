import { Message } from "../types/types";
import { Check, CheckCheck } from 'lucide-react';
import { formatTimeShort } from "@/shared/lib/utils";

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
}

const MessageItem = ({ message, isOwn }: MessageItemProps) => { 
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
                            {message.isRead ? (
                                <CheckCheck className="w-4 h-4" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </span>
                    )}

                </div>
                
             </div>
        </div>
    )
}

export default MessageItem;