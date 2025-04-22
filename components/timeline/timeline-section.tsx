"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimelineItem } from "./timeline-item";
import { BookmarkItem } from "./bookmark-item";

interface TimelineSectionProps {
  timelineData: any[];
  bookmarkedItems: any[];
  currentTimelineIndex: number;
  onTimelineItemClick: (index: number) => void;
  onBookmarkClick: (time: number) => void;
  onDeleteBookmark: (id: string) => void;
  isAuthenticated: boolean;
  onEditNote: (id: string, content: string) => void;
}

export function TimelineSection({
  timelineData,
  bookmarkedItems,
  currentTimelineIndex,
  onTimelineItemClick,
  onBookmarkClick,
  onDeleteBookmark,
  isAuthenticated,
  onEditNote,
}: TimelineSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [expandedTimeline, setExpandedTimeline] = useState<boolean[]>([]);

  // 타임라인 아이템 확장 상태 초기화
  useEffect(() => {
    if (timelineData.length > 0) {
      setExpandedTimeline(new Array(timelineData.length).fill(false));
    }
  }, [timelineData]);

  // 타임라인 아이템 확장/축소 토글
  const handleToggleExpand = useCallback((index: number) => {
    setExpandedTimeline((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  }, []);

  // 현재 선택된 타임라인 아이템이 자동 스크롤되도록 처리
  const currentTimelineRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && activeTab === "timeline") {
        node.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [activeTab]
  );

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs
        defaultValue="timeline"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-2">
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
          <TabsTrigger value="bookmarks">
            북마크 ({bookmarkedItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="w-full">
          <Card className="border-none shadow-none">
            <CardHeader className="px-3 pt-3 pb-0">
              <CardTitle className="text-lg">타임라인</CardTitle>
              <CardDescription>
                영상 주요 타임라인 ({timelineData.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-3">
              <ScrollArea className="h-[calc(100vh-400px)] pr-2">
                {timelineData.length > 0 ? (
                  <div className="space-y-2">
                    {timelineData.map((item, index) => (
                      <TimelineItem
                        key={item.id || index}
                        ref={
                          index === currentTimelineIndex
                            ? currentTimelineRef
                            : null
                        }
                        item={item}
                        index={index}
                        isSelected={index === currentTimelineIndex}
                        isExpanded={expandedTimeline[index]}
                        onTimelineClick={() => onTimelineItemClick(index)}
                        onToggleExpand={() => handleToggleExpand(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    타임라인 정보가 없습니다
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="w-full">
          <Card className="border-none shadow-none">
            <CardHeader className="px-3 pt-3 pb-0">
              <CardTitle className="text-lg">북마크</CardTitle>
              <CardDescription>
                저장한 북마크 ({bookmarkedItems.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-3">
              <ScrollArea className="h-[calc(100vh-400px)] pr-2">
                {bookmarkedItems.length > 0 ? (
                  <div className="space-y-2">
                    {bookmarkedItems.map((bookmark) => (
                      <BookmarkItem
                        key={bookmark.id}
                        bookmark={bookmark}
                        onBookmarkClick={onBookmarkClick}
                        onDeleteBookmark={onDeleteBookmark}
                        isAuthenticated={isAuthenticated}
                        onEditNote={onEditNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    저장된 북마크가 없습니다
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
