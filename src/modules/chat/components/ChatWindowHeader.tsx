import { ChatDto } from "@/modules/chat/api/chatApi";

interface ChatWindowHeaderProps {
    isMobile: boolean;
    onClose: () => void;
    chat: ChatDto;
}

const ChatWindowHeader = ({ isMobile, onClose, chat }: ChatWindowHeaderProps) => {

    return (
        <div className="flex items-start bg-background w-full px-6 py-2 border-b border-border text-inverse gap-2">
            {isMobile && 
                <img src="/icons/back.svg" alt="back" className="w-6 h-6" onClick={onClose} />
            }
            <div className="flex flex-col">
                <h3 className="text-lg font-medium">
                    {chat.type === 'direct' ? (chat.peer?.displayName || chat.peer?.email) : chat.title}
                </h3>
                <p className="opacity-50">Online</p>
            </div>
          
        </div>
    )
}

export default ChatWindowHeader;