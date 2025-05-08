import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubePopupProps {
  videoId: string;
  startTime?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function YouTubePopup({
  videoId,
  startTime = 0,
  isOpen,
  onClose,
}: YouTubePopupProps) {
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // ESC 키로 팝업 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // YouTube 임베드 URL
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${Math.floor(
    startTime
  )}&rel=0`;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center z-101 bg-black/70">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="aspect-video w-full">
          <iframe
            ref={playerRef}
            width="100%"
            height="100%"
            src={youtubeUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-t-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
