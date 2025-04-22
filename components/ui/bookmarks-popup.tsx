"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import type { BookmarkItem } from "@/types/timeline";

interface BookmarksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Record<string, BookmarkItem>;
  onBookmarkClick: (seconds: number) => void;
  onBookmarkDelete?: (id: string) => void;
  formatTime: (seconds: number) => string;
}

export function BookmarksPopup({
  isOpen,
  onClose,
  bookmarks,
  onBookmarkClick,
  onBookmarkDelete,
  formatTime,
}: BookmarksPopupProps) {
  if (!isOpen) return null;

  const bookmarkCount = Object.keys(bookmarks).length;
  const sortedBookmarks = Object.values(bookmarks).sort(
    (a, b) => a.seconds - b.seconds
  );

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (onBookmarkDelete) {
      onBookmarkDelete(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-info" />
            <h3 className="text-lg font-medium">
              저장된 타임라인 ({bookmarkCount})
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {bookmarkCount === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-primary-color" />
              </div>
              <p className="text-neutral-medium">저장된 타임라인이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-gray-50 hover:bg-primary-light rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-primary-color/30"
                  onClick={() => {
                    onBookmarkClick(bookmark.seconds);
                    onClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-white border border-blue-200 rounded-md p-0.5 text-sm leading-none font-medium  text-info">
                      {formatTime(bookmark.seconds)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-dark line-clamp-2">
                        {bookmark.text}
                      </p>
                      {bookmark.memo && (
                        <p className="text-xs text-neutral-medium mt-1 italic line-clamp-1">
                          {bookmark.memo}
                        </p>
                      )}
                    </div>
                    {onBookmarkDelete && (
                      <button
                        className="group rounded-full hover:bg-gray-200 transition-colors"
                        onClick={(e) => handleDeleteClick(e, bookmark.id)}
                        aria-label="타임라인 삭제"
                      >
                        <X className="h-4 w-4 text-neutral-medium group-hover:text-error" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
