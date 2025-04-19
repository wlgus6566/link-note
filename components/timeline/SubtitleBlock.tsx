import React from "react";
import { Button } from "@/components/ui/button";
import { MapPinPlusInside, MapPinCheckInside } from "lucide-react";

interface SubtitleBlockProps {
  start: string;
  end: string;
  text: string;
  startSeconds: number;
  onSeek?: (seconds: number) => void;
  isBookmarked?: boolean;
  onBookmark?: (id: string, seconds: number, text: string) => void;
  id?: string; // 고유 ID
  isActive?: boolean;
  dataSegmentId?: number | string;
}

export function SubtitleBlock({
  start,
  end,
  isActive,
  text,
  startSeconds,
  onSeek,
  dataSegmentId,
  isBookmarked = false,
  onBookmark,
  id = `subtitle_${start.replace(":", "")}_${startSeconds}`, // 기본 ID 생성
}: SubtitleBlockProps) {
  const handleClick = () => {
    if (onSeek) {
      onSeek(startSeconds);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    if (onBookmark) {
      onBookmark(id, startSeconds, text);
    }
  };

  return (
    <div className="py-1 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs p-1 h-auto min-w-[70px] whitespace-nowrap text-gray-600"
          onClick={handleClick}
        >
          [{start}]
        </Button>
        <button
          onClick={handleClick}
          data-segment-id={dataSegmentId}
          className={`text-sm flex-1 text-left hover:text-primary-color ${
            isActive ? "text-primary-color" : ""
          }`}
        >
          {text}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-gray-600 hover:text-primary-color"
          onClick={handleBookmark}
          title={isBookmarked ? "북마크 해제" : "북마크 저장"}
        >
          {isBookmarked ? (
            <MapPinCheckInside className="h-4 w-4 text-primary-color" />
          ) : (
            <MapPinPlusInside className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
