import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TimelineGroup } from "@/lib/utils/youtube";
import { ChevronRight, Play, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface TimelineAccordionProps {
  timelineGroups: TimelineGroup[];
  onSeek: (seconds: number) => void;
  onBookmark?: (id: string, seconds: number, text: string) => void;
  bookmarkedItems?: Record<string, boolean>;
  currentSegmentId?: string;
  useTranslated?: boolean; // 번역된 자막 사용 여부
}

export function TimelineAccordion({
  timelineGroups,
  onSeek,
  onBookmark,
  bookmarkedItems = {},
  currentSegmentId,
  useTranslated = false, // 기본값은 false
}: TimelineAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!timelineGroups || !timelineGroups.length) {
    return (
      <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-lg text-blue-700 mb-2">
          타임라인 정보가 없습니다
        </h3>
        <p className="text-blue-600 text-sm">
          이 콘텐츠는, 타임라인 정보를 가져올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {timelineGroups.map((group, index) => {
        // 번역된 자막 또는 일반 자막을 선택
        const subtitles =
          useTranslated && group.translatedSubtitles
            ? group.translatedSubtitles
            : group.subtitles;

        // 자막이 없는 경우 건너뛰기 (items은 구구조 호환)
        if (
          (!subtitles || subtitles.length === 0) &&
          (!group.items || group.items.length === 0)
        ) {
          return null;
        }

        // 그룹 ID 생성
        const groupId = `timeline-group-${index}`;
        const isExpanded = expandedItems[groupId];

        return (
          <div
            key={groupId}
            className="border border-border-line rounded-lg overflow-hidden"
          >
            <div
              className={cn(
                "py-2 px-3 flex items-center justify-between cursor-pointer transition-colors",
                isExpanded ? "bg-gray-100" : "hover:bg-gray-50"
              )}
              onClick={() => handleToggleItem(groupId)}
            >
              <div className="flex gap-1 items-center">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform flex-shrink-0 text-neutral-medium",
                    isExpanded && "transform rotate-90"
                  )}
                />
                <span className="text-sm font-medium text-neutral-dark">
                  {group.range}
                </span>
              </div>
              <div className="text-xs text-neutral-medium">
                {subtitles
                  ? `${subtitles.length}개 항목`
                  : group.items
                  ? `${group.items.length}개 항목`
                  : "0개 항목"}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border-line divide-y divide-border-line">
                    {/* 새로운 구조 (subtitles) */}
                    {subtitles &&
                      subtitles.map((subtitle, idx) => {
                        const itemId = String(subtitle.startSeconds);
                        const isBookmarked = bookmarkedItems[itemId];
                        const isActive = currentSegmentId === itemId;

                        return (
                          <div
                            key={`${itemId}-${idx}`}
                            data-segment-id={itemId}
                            className={cn(
                              "flex items-start py-2 px-3 hover:bg-gray-50 transition-colors",
                              isActive && "bg-blue-50/60"
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0 h-6 w-6 rounded-full mr-2 p-0 hover:bg-primary-light hover:text-primary-color"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeek(subtitle.startSeconds);
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex gap-1 mb-0.5">
                                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                  {subtitle.start}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSeek(subtitle.startSeconds);
                                }}
                                className="text-sm text-left text-neutral-dark break-words whitespace-pre-wrap"
                              >
                                {subtitle.text}
                              </button>
                            </div>
                            {onBookmark && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 h-8 w-8 rounded-full p-0 hover:bg-primary-light"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBookmark(
                                    itemId,
                                    subtitle.startSeconds,
                                    subtitle.text
                                  );
                                }}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-4 w-4 text-primary-color" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })}

                    {/* 구구조 호환 (items) */}
                    {/* {!subtitles &&
                      group.items &&
                      group.items.map((item, idx) => {
                        const itemId = String(item.id);
                        const isBookmarked = bookmarkedItems[itemId];
                        const isActive = currentSegmentId === itemId;

                        return (
                          <div
                            key={`${itemId}-${idx}`}
                            data-segment-id={itemId}
                            className={cn(
                              "flex items-start py-2 px-3 hover:bg-gray-50 transition-colors",
                              isActive && "bg-blue-50/60"
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0 h-8 w-8 rounded-full mr-2 p-0 hover:bg-primary-light hover:text-primary-color"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeek(item.seconds);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-neutral-dark break-words">
                                {item.text}
                              </p>
                            </div>
                            {onBookmark && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0 h-8 w-8 rounded-full p-0 hover:bg-primary-light"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBookmark(itemId, item.seconds, item.text);
                                }}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-4 w-4 text-primary-color" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })} */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
