"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineBookmarkButtonProps {
  bookmarkCount: number;
  onClick: () => void;
  onGuideClick: () => void;
}

export function TimelineBookmarkButton({
  bookmarkCount,
  onClick,
  onGuideClick,
}: TimelineBookmarkButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 스크롤 방향에 따라 버튼 표시/숨김 처리
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 방향 감지 (아래로 스크롤 시 숨김, 위로 스크롤 시 표시)
      if (currentScrollY > lastScrollY + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed right-5 bottom-24 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            variant="default"
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg ${
              bookmarkCount > 0
                ? "bg-[#1976D2] hover:bg-[#1976D2]/90"
                : "bg-white border border-border-line hover:bg-gray-50"
            }`}
            onClick={bookmarkCount > 0 ? onClick : onGuideClick}
          >
            <MapPin
              className={`h-6 w-6 ${
                bookmarkCount > 0 ? "text-white" : "text-primary-color"
              }`}
            />
            {bookmarkCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-color text-white text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                {bookmarkCount}
              </span>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
