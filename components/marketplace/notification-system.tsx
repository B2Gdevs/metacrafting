"use client"

import { Notification } from "@/lib/marketplace-types";

interface NotificationSystemProps {
  notifications: Notification[];
}

export default function NotificationSystem({ notifications }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div 
          key={index} 
          className={`p-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 
            ${notification.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
} 