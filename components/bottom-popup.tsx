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
    <AnimatePresence mode="wait">
      {isOpen ? (
        <>
          {/* 백드롭: 따로 애니메이션 주고 시트를 바깥에서 감싼다 */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 시트 */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 w-full z-[100]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => info.offset.y > 100 && onClose()}
          >
            <div className="flex flex-col bg-white rounded-t-2xl overflow-hidden">
              <div className="p-4 cursor-grab active:cursor-grabbing">
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
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
