"use client";
import ChatList from "@/modules/chat/components/ChatList";
// import { ChatDto } from "@/modules/chat/api/chatApi";
import { useDevice } from "@/shared/hooks/useDevice";
import { AnimatePresence, Variants, motion } from "framer-motion";
import UserSearch from "@/modules/users/components/UserSearch";

interface SideBarProps {
  isOpen: boolean;
}

const sidebarVariants: Variants = {
  hidden: {
    x: "-100%",
    transition: { type: "tween", duration: 0.2, ease: "easeInOut" },
  },
  visible: {
    x: 0,
    transition: { type: "tween", duration: 0.2, ease: "easeInOut" },
  },
};

export default function SideBar({ isOpen }: SideBarProps) {
  const { isMobile } = useDevice();

  const shouldShow = !isMobile || !isOpen;

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          className="h-[calc(100vh-93px)] bg-background-muted w-full"
          initial={isMobile ? "hidden" : false}
          animate={isMobile ? "visible" : false}
          exit={isMobile ? "hidden" : undefined}
          variants={isMobile ? sidebarVariants : {}}
        >
          <UserSearch />
          <div className="bg-background-muted w-full p-6 border-b border-border">
            <p className="text-inverse text-xl font-semibold">Messages</p>
          </div>
          <ChatList />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
