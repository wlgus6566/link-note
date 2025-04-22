"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  PlayIcon,
  PauseIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimelinePlayerSectionProps {
  videoId: string;
  initialTime?: number;
  timelineData: any[];
  currentTimelineIndex: number;
  onTimelineItemChange: (index: number) => void;
  onAddBookmark: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playerRef: React.RefObject<ReactPlayer>;
  showBookmarkToast: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
}

export function TimelinePlayerSection({
  videoId,
  initialTime,
  timelineData,
  currentTimelineIndex,
  onTimelineItemChange,
  onAddBookmark,
  isPlaying,
  setIsPlaying,
  playerRef,
  showBookmarkToast,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
}: TimelinePlayerSectionProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [videoDuration, setVideoDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayerReady = useCallback(() => {
    setIsVideoReady(true);

    if (playerRef.current && initialTime) {
      playerRef.current.seekTo(initialTime, "seconds");
    }
  }, [initialTime, playerRef]);

  const handleProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      setCurrentTime(playedSeconds);
    },
    []
  );

  const handleDuration = useCallback((duration: number) => {
    setVideoDuration(duration);
  }, []);

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !playerRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / rect.width;
      const seekTime = percentage * videoDuration;

      playerRef.current.seekTo(seekTime, "seconds");
      setCurrentTime(seekTime);
    },
    [playerRef, videoDuration]
  );

  const goToNextTimeline = useCallback(() => {
    if (
      timelineData.length === 0 ||
      currentTimelineIndex === timelineData.length - 1
    )
      return;

    onTimelineItemChange(currentTimelineIndex + 1);
  }, [currentTimelineIndex, onTimelineItemChange, timelineData.length]);

  const goToPreviousTimeline = useCallback(() => {
    if (timelineData.length === 0 || currentTimelineIndex <= 0) return;

    onTimelineItemChange(currentTimelineIndex - 1);
  }, [currentTimelineIndex, onTimelineItemChange, timelineData.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleBookmarkClick = useCallback(() => {
    onAddBookmark(currentTime);
  }, [currentTime, onAddBookmark]);

  const handleSkipForward = useCallback(() => {
    if (!playerRef.current) return;

    const newTime = currentTime + 10;
    playerRef.current.seekTo(newTime, "seconds");
    setCurrentTime(newTime);
  }, [currentTime, playerRef]);

  const handleSkipBackward = useCallback(() => {
    if (!playerRef.current) return;

    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime, "seconds");
    setCurrentTime(newTime);
  }, [currentTime, playerRef]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted, setIsMuted]);

  const progressPercentage = useMemo(() => {
    return videoDuration ? (currentTime / videoDuration) * 100 : 0;
  }, [currentTime, videoDuration]);

  // 재생 상태에 따라 현재 시간 업데이트 인터벌 관리
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentSeconds = playerRef.current.getCurrentTime();
          setCurrentTime(currentSeconds);
        }
      }, 200);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, playerRef]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* 영상 플레이어 */}
      <div className="relative aspect-video bg-black w-full">
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        )}
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          onReady={handlePlayerReady}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: {
                rel: 0,
                modestbranding: 1,
              },
            },
          }}
        />
      </div>

      {/* 타임라인 네비게이션 */}
      <div className="flex flex-col my-3 px-3">
        {/* 프로그레스 바 */}
        <div
          ref={progressRef}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
          onClick={handleProgressBarClick}
        >
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* 재생 컨트롤 */}
        <div className="flex items-center justify-between w-full">
          <div className="text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="rounded-full"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousTimeline}
              disabled={timelineData.length === 0 || currentTimelineIndex <= 0}
              className={cn(
                "rounded-full",
                (timelineData.length === 0 || currentTimelineIndex <= 0) &&
                  "opacity-50"
              )}
            >
              <ArrowLeftIcon size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipBackward}
              className="rounded-full"
            >
              <SkipBack size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="rounded-full"
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipForward}
              className="rounded-full"
            >
              <SkipForward size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextTimeline}
              disabled={
                timelineData.length === 0 ||
                currentTimelineIndex === timelineData.length - 1
              }
              className={cn(
                "rounded-full",
                (timelineData.length === 0 ||
                  currentTimelineIndex === timelineData.length - 1) &&
                  "opacity-50"
              )}
            >
              <ArrowRightIcon size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmarkClick}
              className={cn(
                "rounded-full",
                showBookmarkToast && "text-emerald-500"
              )}
            >
              <BookmarkIcon size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
