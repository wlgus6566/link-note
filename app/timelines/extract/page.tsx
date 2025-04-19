"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { TimelineAccordion } from "@/components/timeline/TimelineAccordion";
import type { TimelineGroup } from "@/lib/utils/youtube";
import { getVideoId } from "@/lib/utils/client-youtube";
import BottomNav from "@/components/bottom-nav";
import {
  Loader2,
  ArrowLeft,
  Bookmark,
  Share2,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleToast } from "@/components/ui/toast";
import { MemoPopup } from "@/components/ui/memo-popup";
import { createClient } from "@/lib/supabase/client";

interface YouTubeVideoInfo {
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  channelId?: string;
}

interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  timestamp: number;
  memo?: string;
}

export default function TimelineExtractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const youtubeLink = searchParams.get("url") || "";

  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, BookmarkItem>
  >({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<string | null>(
    null
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        setIsAuthenticated(!!sessionData.session);
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // URL 파라미터에서 YouTube 링크 처리
  useEffect(() => {
    if (!youtubeLink) {
      setError("YouTube 링크가 제공되지 않았습니다");
      setLoading(false);
      return;
    }

    const extractedVideoId = getVideoId(youtubeLink);
    if (!extractedVideoId) {
      setError("올바른 YouTube 링크가 아닙니다");
      setLoading(false);
      return;
    }

    setVideoId(extractedVideoId);
    extractTimeline(extractedVideoId);
  }, [youtubeLink]);

  // 타임라인 추출 함수
  const extractTimeline = async (videoId: string) => {
    setLoading(true);

    try {
      // API 호출
      const response = await fetch(`/api/extract-timeline?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "타임라인 추출에 실패했습니다");
      }

      // 타임라인 데이터 저장
      setTimelineData(data.timeline || []);
      setVideoInfo(data.videoInfo || null);

      // 로컬 스토리지에 저장
      const timelineKey = `timeline_extracted_${videoId}`;
      localStorage.setItem(timelineKey, JSON.stringify(data.timeline || []));

      // 북마크 데이터 로드
      const bookmarkKey = `bookmarks_timeline_extracted_${videoId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);
      if (storedBookmarks) {
        setBookmarkedItems(JSON.parse(storedBookmarks));
      } else {
        setBookmarkedItems({});
      }
    } catch (error) {
      console.error("타임라인 추출 오류:", error);
      setError(
        error instanceof Error ? error.message : "타임라인 추출에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  // 북마크 처리 함수
  const handleBookmark = (id: string, seconds: number, text: string) => {
    if (!videoId) return;

    const bookmarkKey = `bookmarks_timeline_extracted_${videoId}`;
    let newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[id]) {
      delete newBookmarkedItems[id];
      setToastMessage("타임라인에서 제거되었어요.");
      setCurrentBookmarkId(null);
    } else {
      newBookmarkedItems[id] = {
        id,
        seconds,
        text,
        timestamp: Date.now(),
      };
      setToastMessage("🔖 타임라인에 저장했어요!");
      setCurrentBookmarkId(id);
    }

    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));
    setShowToast(true);
  };

  // 메모 저장 함수
  const handleSaveMemo = async (memo: string) => {
    if (!currentBookmarkId || !videoId) return;

    const bookmarkKey = `bookmarks_timeline_extracted_${videoId}`;
    let newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[currentBookmarkId]) {
      // 로컬 스토리지에 메모 추가
      newBookmarkedItems[currentBookmarkId] = {
        ...newBookmarkedItems[currentBookmarkId],
        memo,
      };

      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      setToastMessage("메모가 저장되었습니다.");
      setShowToast(true);
    }
  };

  // 영상 재생 위치 이동 함수
  const handleSeekTo = (seconds: number) => {
    if (!videoId) return;

    // iframe 찾기
    const iframe = document.querySelector("iframe");
    if (iframe) {
      // YouTube Player API를 통해 특정 시간으로 이동
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seconds, true],
        }),
        "*"
      );
    }
  };

  // 조회수 포맷 함수
  const formatViewCount = (count: string | undefined): string => {
    if (!count) return "0";

    const num = Number.parseInt(count, 10);
    if (isNaN(num)) return "0";

    if (num >= 10000) {
      return `${Math.floor(num / 10000)}만회`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}천회`;
    }

    return `${num}회`;
  };

  // 토스트 닫기
  const handleCloseToast = () => {
    setShowToast(false);
  };

  // 메모 팝업 닫기
  const handleCloseMemoPopup = () => {
    setShowMemoPopup(false);
    setCurrentBookmarkId(null);
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="타임라인 추출" backUrl="/timelines" />
        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="max-w-sm w-full bg-white p-8 space-y-6 text-center rounded-xl border border-border-line shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-dark">
              타임라인 추출 실패
            </h1>
            <p className="text-neutral-medium">{error}</p>
            <Button
              onClick={() => router.push("/timelines")}
              className="bg-primary-color hover:bg-primary-color/90 text-white"
            >
              돌아가기
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (loading || !videoId) {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <Header title="타임라인 추출" backUrl="/timelines" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-color mx-auto mb-4" />
            <p className="text-neutral-medium">타임라인 추출 중...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header
        title="타임라인 추출"
        backUrl="/timelines"
        rightElement={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary-light"
            >
              <Share2 className="h-5 w-5 text-neutral-dark" />
            </Button>
          </div>
        }
      />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-5 py-8">
          {/* 영상 영역 */}
          <motion.div
            className="mb-8 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-border-line shadow-sm">
              <div className="relative w-full h-48 md:h-80">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                  title={videoInfo?.title || "YouTube 비디오"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              </div>

              {videoInfo && (
                <div className="p-4 space-y-3">
                  <h2 className="text-xl font-bold text-neutral-dark">
                    {videoInfo.title || "제목 없음"}
                  </h2>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary-color border border-border-line">
                        {videoInfo.channelId ? (
                          <Image
                            src={`https://yt3.googleusercontent.com/ytc/${videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`}
                            alt={videoInfo.channelTitle || "채널 이미지"}
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-neutral-dark">
                          {videoInfo.channelTitle || "채널명 없음"}
                        </div>
                        <div className="text-xs text-neutral-medium">
                          {videoInfo.publishedAt
                            ? new Date(
                                videoInfo.publishedAt
                              ).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "날짜 정보 없음"}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-medium">
                      {videoInfo.viewCount
                        ? `조회수 ${formatViewCount(videoInfo.viewCount)}회`
                        : "조회수 정보 없음"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 타임라인 영역 */}
          {timelineData.length > 0 && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-dark">
                  타임라인
                </h2>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <TimelineAccordion
                  timelineGroups={timelineData}
                  onSeek={handleSeekTo}
                  bookmarkedItems={Object.keys(bookmarkedItems).reduce(
                    (acc, key) => ({
                      ...acc,
                      [key]: true,
                    }),
                    {}
                  )}
                  onBookmark={handleBookmark}
                />
              </div>
            </motion.div>
          )}
        </article>
      </main>

      <BottomNav />

      <SimpleToast
        isVisible={showToast}
        message={toastMessage}
        onClose={handleCloseToast}
        actionLabel={
          currentBookmarkId && !showMemoPopup ? "메모 추가하기" : undefined
        }
        onAction={currentBookmarkId ? () => setShowMemoPopup(true) : undefined}
      />

      <MemoPopup
        isOpen={showMemoPopup}
        onClose={handleCloseMemoPopup}
        onSave={handleSaveMemo}
        initialMemo={
          currentBookmarkId
            ? bookmarkedItems[currentBookmarkId]?.memo || ""
            : ""
        }
        title="타임라인 메모 추가하기"
      />
    </div>
  );
}
