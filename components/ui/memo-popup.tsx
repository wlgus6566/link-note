import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MemoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memo: string) => void;
  initialMemo?: string;
  title?: string;
}

export function MemoPopup({
  isOpen,
  onClose,
  onSave,
  initialMemo = "",
  title = "메모 추가하기",
}: MemoPopupProps) {
  const [memo, setMemo] = useState(initialMemo);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }

    // initialMemo가 변경될 때마다 memo 상태 업데이트
    setMemo(initialMemo);
  }, [isOpen, initialMemo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-gray-500 hover:text-gray-900"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          ref={textareaRef}
          className="w-full p-2 min-h-[120px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
          placeholder="메모를 입력하세요..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:text-gray-900"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              onSave(memo);
              onClose();
            }}
            className="bg-primary-color hover:bg-primary-color/90 text-white"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
