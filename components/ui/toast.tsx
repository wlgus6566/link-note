"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// 필요한 타입 정의 추가
export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ToastActionElement = React.ReactNode;

interface SimpleToastProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export function SimpleToast({
  isVisible,
  message,
  onClose,
  actionLabel,
  onAction,
  duration = 3000,
}: SimpleToastProps) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      timeoutId = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex-1 mr-2">
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:text-red-300 hover:bg-transparent p-0 h-auto"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-transparent p-0 h-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
