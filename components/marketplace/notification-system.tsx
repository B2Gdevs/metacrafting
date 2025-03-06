"use client"

import { useEffect, useState } from "react";
import { Notification } from "@/hooks/use-marketplace";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface NotificationSystemProps {
  notifications: Notification[];
}

export default function NotificationSystem({ notifications }: NotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);
  
  const removeNotification = (notification: Notification) => {
    setVisibleNotifications(prev => prev.filter(n => n !== notification));
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={`${notification.message}-${index}`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`
              p-4 rounded-lg shadow-lg flex items-start justify-between
              ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
              text-white min-w-[300px] max-w-md
            `}
          >
            <p>{notification.message}</p>
            <button 
              onClick={() => removeNotification(notification)}
              className="ml-2 text-white hover:text-gray-200 focus:outline-none"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 