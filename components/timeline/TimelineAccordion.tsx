import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SubtitleBlock } from "./SubtitleBlock";
import { TimelineGroup } from "@/lib/utils/youtube";

interface TimelineAccordionProps {
  timelineGroups: TimelineGroup[];
  onSeek?: (seconds: number) => void;
  bookmarkedItems?: Record<string, boolean>;
  onBookmark?: (id: string, seconds: number, text: string) => void;
  currentSegmentId?: string | number;
}

export function TimelineAccordion({
  timelineGroups,
  currentSegmentId,
  onSeek,
  bookmarkedItems = {},
  onBookmark,
}: TimelineAccordionProps) {
  if (!timelineGroups || timelineGroups.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 text-center border rounded-md">
        타임라인 데이터가 없습니다.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {timelineGroups.map((group, index) => (
        <AccordionItem key={index} value={group.range}>
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            {group.range} ({group.subtitles.length}개 항목)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pl-1 pt-2">
              {group.subtitles.map((subtitle, i) => {
                const sst = subtitle.startSeconds;
                const subtitleId = `subtitle_${subtitle.start.replace(
                  ":",
                  ""
                )}_${subtitle.startSeconds}`;
                return (
                  <SubtitleBlock
                    key={subtitleId}
                    isActive={currentSegmentId == sst}
                    id={subtitleId}
                    dataSegmentId={subtitle.startSeconds}
                    start={subtitle.start}
                    end={subtitle.end}
                    text={subtitle.text}
                    startSeconds={subtitle.startSeconds}
                    onSeek={onSeek}
                    isBookmarked={bookmarkedItems[subtitleId] || false}
                    onBookmark={onBookmark}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
