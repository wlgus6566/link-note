"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, BookmarkPlus, Edit, PlayCircle } from "lucide-react";

interface TimelineGuideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBookmarking: () => void;
}

export function TimelineGuideSheet({
  isOpen,
  onClose,
  onStartBookmarking,
}: TimelineGuideSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[95]" onClick={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 w-full z-[100]"
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
            className="p-4 border-b border-border-line cursor-grab active:cursor-grabbing"
            onTouchStart={(e) =>
              e.currentTarget.classList.add("active:cursor-grabbing")
            }
            onTouchEnd={(e) =>
              e.currentTarget.classList.remove("active:cursor-grabbing")
            }
          >
            <div className="w-12 h-1 bg-border-line rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary-color" />
              <h3 className="font-medium text-lg">타임라인 북마크 가이드</h3>
            </div>
            <p className="text-sm text-center text-neutral-medium">
              중요한 순간을 저장하고 쉽게 찾아보세요
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <BookmarkPlus className="h-5 w-5 text-primary-color" />
              </div>
              <div>
                <h4 className="font-medium text-base mb-1">
                  타임라인 북마크하기
                </h4>
                <p className="text-sm text-neutral-medium">
                  스크립트 탭, 번역 탭에서 타임라인 항목 옆의 북마크 아이콘을
                  클릭하여 중요한 순간을 저장하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Edit className="h-5 w-5 text-primary-color" />
              </div>
              <div>
                <h4 className="font-medium text-base mb-1">메모 추가하기</h4>
                <p className="text-sm text-neutral-medium">
                  북마크한 타임라인에 메모를 추가하여 중요한 내용을 기록할 수
                  있습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <PlayCircle className="h-5 w-5 text-primary-color" />
              </div>
              <div>
                <h4 className="font-medium text-base mb-1">빠르게 이동하기</h4>
                <p className="text-sm text-neutral-medium">
                  북마크 버튼을 클릭하여 저장한 타임라인 목록을 확인하고, 원하는
                  구간으로 바로 이동할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button
                className="w-full bg-primary-color hover:bg-primary-color/90 text-white"
                onClick={onStartBookmarking}
              >
                타임라인 북마크 시작하기
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
