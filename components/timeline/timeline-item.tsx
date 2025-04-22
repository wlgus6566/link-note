"use client";

import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface TimelineItemProps {
  item: {
    time: number;
    title: string;
    description?: string;
  };
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onTimelineClick: () => void;
  onToggleExpand: () => void;
}

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (
    { item, index, isSelected, isExpanded, onTimelineClick, onToggleExpand },
    ref
  ) => {
    return (
      <div ref={ref}>
        <Card
          className={cn(
            "transition-all duration-300 hover:bg-muted/50 cursor-pointer",
            isSelected && "bg-secondary/30"
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2" onClick={onTimelineClick}>
              <div className="w-12 flex-shrink-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <PlayCircle size={20} />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(item.time)}
                  </span>
                </div>

                {isExpanded && item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              {item.description && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);
