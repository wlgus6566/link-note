import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center z-101">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 z-50 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-neutral-dark">
                  {title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-neutral-100"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-neutral-medium mb-5">{message}</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-border-line hover:bg-neutral-100"
                  onClick={onCancel}
                >
                  {cancelText}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full px-4 bg-primary-color hover:bg-primary-color/90"
                  onClick={onConfirm}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
