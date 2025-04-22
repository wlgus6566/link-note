"use client";

import React from "react";
import { formatTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, PlayCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkItemProps {
  bookmark: {
    id: string;
    time: number;
    title: string;
  };
  isSelected: boolean;
  onBookmarkClick: () => void;
  onBookmarkDelete: () => void;
}

export function BookmarkItem({
  bookmark,
  isSelected,
  onBookmarkClick,
  onBookmarkDelete,
}: BookmarkItemProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:bg-muted/50 cursor-pointer",
        isSelected && "bg-secondary/30"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onBookmarkClick}
          >
            <PlayCircle size={20} />
          </Button>

          <div className="flex-1 min-w-0" onClick={onBookmarkClick}>
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Bookmark size={14} className="text-primary" />
                <h3 className="font-medium text-sm line-clamp-1">
                  {bookmark.title}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatTime(bookmark.time)}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkDelete();
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
