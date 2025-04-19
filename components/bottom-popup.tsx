"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BottomPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCancelButton?: boolean;
  cancelText?: string;
}

export function BottomPopup({
  isOpen,
  onClose,
  title,
  children,
  showCancelButton = true,
  cancelText = "취소",
}: BottomPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-0 left-0 w-full z-50"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            // 드래그 거리가 100px 이상이면 팝업 닫기
            if (info.offset.y > 100) {
              onClose();
            }
          }}
        >
          <div className="flex flex-col bg-white border-t border-border-line rounded-t-2xl overflow-hidden">
            <div
              className="p-4 border-b border-border-line cursor-grab active:cursor-grabbing rounded-t-2xl"
              onTouchStart={(e) =>
                e.currentTarget.classList.add("active:cursor-grabbing")
              }
              onTouchEnd={(e) =>
                e.currentTarget.classList.remove("active:cursor-grabbing")
              }
            >
              <div className="w-12 h-1 bg-border-line rounded-full mx-auto mb-4" />
              {title && (
                <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
              )}
            </div>

            <div className="p-2">{children}</div>

            {showCancelButton && (
              <Button
                variant="ghost"
                className="py-4 border-t border-border-line rounded-none"
                onClick={onClose}
              >
                {cancelText}
              </Button>
            )}
          </div>

          <div className="fixed inset-0 bg-black/40 -z-10" onClick={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
