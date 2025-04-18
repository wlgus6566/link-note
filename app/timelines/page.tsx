"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Clock,
  Play,
  Edit,
  Trash,
  Calendar,
  LogIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import { getUserTimelineBookmarks, formatTime } from "@/lib/utils/timeline";
import { TimelineBookmark } from "@/types/timeline";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SimpleToast } from "@/components/ui/toast";
import { MemoPopup } from "@/components/ui/memo-popup";
import { YouTubePopup } from "@/components/ui/youtube-popup";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TimelinesPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<TimelineBookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<
    TimelineBookmark[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmark, setCurrentBookmark] =
    useState<TimelineBookmark | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [youtubePopup, setYoutubePopup] = useState({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();

        setIsAuthenticated(!!sessionData.session);

        if (!sessionData.session) {
          console.log("사용자가 로그인하지 않았습니다.");
          setAuthError("로그인이 필요한 서비스입니다.");
          setLoading(false);
        }
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        setAuthError("인증 상태를 확인하는데 실패했습니다.");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 북마크 데이터 가져오기 (인증된 경우에만)
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await getUserTimelineBookmarks();

        if (response.success && response.data) {
          setBookmarks(response.data);
          setFilteredBookmarks(response.data);
        } else {
          console.error("북마크 로드 오류:", response.error);
          setToastMessage("북마크를 불러오는데 실패했습니다.");
          setShowToast(true);
        }
      } catch (error) {
        console.error("북마크 로드 오류:", error);
        setToastMessage("북마크를 불러오는데 실패했습니다.");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bookmarks.length) return;

    let result = [...bookmarks];

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (bookmark) =>
          bookmark.digests?.title.toLowerCase().includes(query) ||
          bookmark.text.toLowerCase().includes(query) ||
          (bookmark.memo && bookmark.memo.toLowerCase().includes(query))
      );
    }

    // 정렬
    result = result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

    setFilteredBookmarks(result);
  }, [searchQuery, sortOrder, bookmarks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  const handleMemoClick = (bookmark: TimelineBookmark) => {
    setCurrentBookmark(bookmark);
    setShowMemoPopup(true);
  };

  const handleMemoSave = async (memo: string) => {
    if (!currentBookmark) return;

    try {
      // API 호출 시 fetch 상태 로깅
      console.log(
        `메모 저장 API 호출: 북마크 ID ${currentBookmark.id}, 메모 길이 ${memo.length}자`
      );

      const response = await fetch(
        `/api/timelines/${currentBookmark.id}/memo`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memo }),
          credentials: "include",
        }
      );

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error("메모 저장 API 오류 응답:", response.status, errorText);
        throw new Error(`API 오류: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        console.error("메모 저장 결과 오류:", result.error);
        throw new Error(result.error);
      }

      // 메모 업데이트 성공
      console.log("메모 저장 성공:", result);
      setToastMessage("메모가 저장되었습니다");
      setShowToast(true);

      // 북마크 목록 업데이트
      setBookmarks((prevBookmarks) =>
        prevBookmarks.map((bookmark) =>
          bookmark.id === currentBookmark.id ? { ...bookmark, memo } : bookmark
        )
      );
    } catch (error) {
      console.error("메모 저장 오류:", error);
      setToastMessage("메모 저장에 실패했습니다");
      setShowToast(true);
    }

    setShowMemoPopup(false);
  };

  const handlePlayClick = (bookmark: TimelineBookmark) => {
    if (!bookmark.digests?.source_url) return;

    const videoId = getYouTubeVideoId(bookmark.digests.source_url);
    if (!videoId) return;

    // 팝업으로 재생하기
    setYoutubePopup({
      isOpen: true,
      videoId,
      startTime: bookmark.seconds,
    });
  };

  const closeYoutubePopup = () => {
    setYoutubePopup({
      ...youtubePopup,
      isOpen: false,
    });
  };

  const redirectToLogin = () => {
    router.push("/login"); // 로그인 페이지 경로
  };

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return "";

    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch) return watchMatch[1];

    const shortRegex = /youtu\.be\/([^?&]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) return shortMatch[1];

    const embedRegex = /youtube\.com\/embed\/([^?&]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];

    return "";
  };

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border-line">
          <Skeleton className="w-24 h-16 rounded-md bg-secondary-color" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-5 mb-2 bg-secondary-color" />
            <Skeleton className="w-1/4 h-4 mb-2 bg-secondary-color" />
            <Skeleton className="w-1/2 h-4 bg-secondary-color" />
          </div>
        </div>
      ));
  };

  // 인증되지 않은 상태 렌더링
  if (isAuthenticated === false) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <header className="sticky top-0 z-10 bg-white border-b border-border-line">
          <div className="container px-5 py-4">
            <h1 className="text-xl font-bold mb-4 text-neutral-dark">
              타임라인 저장소
            </h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white p-8 rounded-xl border border-border-line shadow-sm text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-primary-color" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-dark">
              로그인이 필요합니다
            </h2>
            <p className="text-neutral-medium mb-6">
              타임라인을 보고 관리하려면 로그인이 필요합니다.
            </p>
            <Button
              className="bg-primary-color hover:bg-primary-color/90 text-white"
              onClick={redirectToLogin}
            >
              로그인하기
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-border-line">
        <div className="container px-5 py-4">
          <h1 className="text-xl font-bold mb-4 text-neutral-dark">타임라인</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-medium" />
              <Input
                type="text"
                placeholder="타임라인 검색"
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-medium">
              {filteredBookmarks.length}개의 타임라인
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-sm border border-border-line px-3"
              onClick={handleSort}
            >
              <Clock className="h-4 w-4" />
              {sortOrder === "newest" ? "최신순" : "오래된순"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {loading && isAuthenticated !== false ? (
          renderSkeletons()
        ) : filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-neutral-medium" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-neutral-dark">
              {searchQuery ? "검색 결과가 없어요" : "저장된 타임라인이 없어요"}
            </h3>
            <p className="text-neutral-medium text-sm mb-4">
              {searchQuery
                ? "다른 검색어로 다시 시도해보세요"
                : "영상 시청 중 타임라인을 북마크하면 여기에 표시됩니다"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => setSearchQuery("")}
              >
                검색 초기화
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border-line">
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                className="p-4 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex gap-4">
                  <div className="relative w-32 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {bookmark.digests?.source_type === "YouTube" ? (
                      <Image
                        src={`https://i.ytimg.com/vi/${getYouTubeVideoId(
                          bookmark.digests.source_url || ""
                        )}/mqdefault.jpg`}
                        alt={bookmark.digests.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={
                          bookmark.digests?.image ||
                          "/placeholder.svg?height=90&width=160"
                        }
                        alt={bookmark.digests?.title || "북마크 이미지"}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-primary-color transition-colors"
                        onClick={() => handlePlayClick(bookmark)}
                      >
                        <Play className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handlePlayClick(bookmark)}
                      className="text-sm font-medium text-neutral-dark hover:text-primary-color line-clamp-1 mb-1 transition-colors"
                    >
                      {bookmark.digests?.title || "제목 없음"}
                    </button>

                    <div className="flex items-center text-xs text-neutral-medium mb-1.5">
                      <Badge
                        variant="outline"
                        onClick={() => handlePlayClick(bookmark)}
                        className="mr-2 bg-gray-50 border-gray-200 cursor-pointer"
                      >
                        {formatTime(bookmark.seconds)}
                      </Badge>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(bookmark.created_at).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {/* <p className="text-sm text-neutral-dark line-clamp-1 mb-1.5">
                      {bookmark.text}
                    </p> */}

                    {bookmark.memo && (
                      <div className="flex items-center justify-between bg-primary-light text-neutral-dark text-xs p-2 rounded-md line-clamp-1">
                        <button
                          className="text-xs text-neutral-medium flex items-center gap-1 hover:text-primary-color transition-colors"
                          onClick={() => handleMemoClick(bookmark)}
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <span className="line-clamp-1 flex-1 ml-1">
                          {bookmark.memo}
                        </span>
                      </div>
                    )}
                    {!bookmark.memo && (
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-neutral-medium flex items-center gap-1 hover:text-primary-color transition-colors"
                          onClick={() => handleMemoClick(bookmark)}
                        >
                          <Edit className="h-3 w-3" />
                          메모 추가
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-neutral-medium mb-1">
                      {bookmark.digests?.video_info?.channelTitle || ""} ·
                      조회수{" "}
                      {formatViewCount(
                        bookmark.digests?.video_info?.viewCount || "0"
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      <SimpleToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      <MemoPopup
        isOpen={showMemoPopup}
        onClose={() => setShowMemoPopup(false)}
        onSave={handleMemoSave}
        initialMemo={currentBookmark?.memo || ""}
        title="타임라인 메모"
      />

      <YouTubePopup
        isOpen={youtubePopup.isOpen}
        videoId={youtubePopup.videoId}
        startTime={youtubePopup.startTime}
        onClose={closeYoutubePopup}
      />
    </div>
  );
}

const formatViewCount = (count: string): string => {
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
