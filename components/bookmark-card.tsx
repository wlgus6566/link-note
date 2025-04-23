import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { BookmarkItem } from "@/types/digest";
import { formatDuration, formatViewCount, formatDate } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: BookmarkItem;
  onOpenMenu: (e: React.MouseEvent, bookmark: BookmarkItem) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onOpenMenu,
}) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className="group">
      <Link href={`/digest/${bookmark.digest_id}`}>
        <motion.div
          className="bg-white rounded-xl overflow-hidden transition-all duration-200 border border-border-line shadow-sm h-full flex flex-col group-hover:border-primary-color"
          whileHover={{ y: -5 }}
        >
          <div className="relative h-24 w-full">
            <Image
              src={bookmark.digests.image || "/placeholder.svg"}
              alt={bookmark.digests.title}
              fill
              className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
            />
            {/* 영상 길이 표시 */}
            {bookmark.digests.source_type === "YouTube" &&
              bookmark.digests.video_info?.duration && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                  {formatDuration(bookmark.digests.video_info.duration)}
                </div>
              )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full absolute top-2 right-2 p-0 bg-white/80 hover:bg-white border border-border-line group-hover:opacity-100 opacity-60"
              onClick={(e) => onOpenMenu(e, bookmark)}
            >
              <MoreVertical className="h-4 w-4 text-neutral-dark" />
            </Button>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
              {bookmark.digests.title}
            </h3>

            {/* 유튜버 이름과 조회수 표시 */}
            {bookmark.digests.source_type === "YouTube" &&
            bookmark.digests.video_info ? (
              <p className="text-xs text-neutral-medium mb-1">
                {bookmark.digests.video_info.channelTitle || ""} · 조회수{" "}
                {formatViewCount(bookmark.digests.video_info.viewCount || "0")}
              </p>
            ) : (
              <p className="text-xs text-neutral-medium mb-1">
                {formatDate(bookmark.created_at)}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mt-auto">
              {bookmark.digests.tags &&
                bookmark.digests.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="tag text-xs">
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
