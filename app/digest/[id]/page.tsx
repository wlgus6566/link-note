"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Calendar,
  Clock,
  AlignJustify,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TimelineAccordion } from "@/components/timeline/TimelineAccordion";
import { TimelineGroup } from "@/lib/utils/youtube";
import { SimpleTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { SimpleToast } from "@/components/ui/toast";
import { MemoPopup } from "@/components/ui/memo-popup";
import {
  syncLocalTimelineBookmarks,
  saveTimelineBookmark,
  deleteTimelineBookmark,
} from "@/lib/utils/timeline";
import { createClient } from "@/lib/supabase/client";

interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  memo?: string;
  timestamp: number;
}

export default function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [showTimeline, setShowTimeline] = useState(true);

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
  const [syncNeeded, setSyncNeeded] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPageId(resolvedParams.id);
      } catch (error) {
        console.error("params 해결 오류:", error);
        setError("페이지 ID를 가져오는데 실패했습니다.");
      }
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!pageId) return;

    try {
      const timelineKey = `timeline_${pageId}`;
      const storedTimeline = localStorage.getItem(timelineKey);

      if (storedTimeline) {
        const parsedTimeline = JSON.parse(storedTimeline);
        setTimelineData(parsedTimeline);
        console.log(
          `타임라인 데이터 로드 완료: ${parsedTimeline.length}개 그룹`
        );
      } else {
        console.log("타임라인 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("타임라인 데이터 로딩 오류:", error);
    }
  }, [pageId]);

  useEffect(() => {
    if (!pageId) return;

    try {
      const bookmarkKey = `bookmarks_timeline_${pageId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);

      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        setBookmarkedItems(parsedBookmarks);
        console.log(
          `북마크 데이터 로드 완료: ${
            Object.keys(parsedBookmarks).length
          }개 항목`
        );
      }
    } catch (error) {
      console.error("북마크 데이터 로딩 오류:", error);
    }
  }, [pageId]);

  useEffect(() => {
    if (!pageId) return;

    let isMounted = true;

    let isDataFetched = false;

    const fetchDigest = async () => {
      if (digest && digest.id === Number.parseInt(pageId)) {
        console.log(
          `ID ${pageId}의 다이제스트 데이터가 이미 로드되어 있습니다.`
        );
        return;
      }

      if (isDataFetched) {
        console.log("이미 데이터를 가져오는 중입니다.");
        return;
      }

      isDataFetched = true;

      try {
        setLoading(true);

        console.log(`다이제스트 데이터 가져오기 시작: ID=${pageId}`);

        const response = await fetch(`/api/digest/${pageId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (result.success) {
          console.log("API에서 다이제스트 데이터 가져오기 성공:", result.data);

          const digestData = result.data;

          if (digestData.sourceType === "YouTube" && digestData.sourceUrl) {
            try {
              const videoId = getYouTubeVideoId(digestData.sourceUrl);

              if (
                !digestData.channelThumbnail &&
                digestData.videoInfo?.channelId
              ) {
                digestData.channelThumbnail = `https://yt3.googleusercontent.com/ytc/${digestData.videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`;
              }
            } catch (channelError) {
              console.warn("채널 정보 가져오기 실패:", channelError);
            }
          }

          if (isMounted) {
            setDigest(digestData);
          }
        } else {
          throw new Error(result.error || "요약을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("요약 불러오기 오류:", error);
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "요약을 불러오는데 실패했습니다."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDigest();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pageId, digest]);

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        setIsAuthenticated(!!sessionData.session);

        // 로그인한 경우 로컬 북마크를 서버와 동기화
        if (sessionData.session && pageId && !syncNeeded) {
          setSyncNeeded(true);
        }
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pageId]);

  // 로컬 스토리지의 북마크를 서버와 동기화
  useEffect(() => {
    if (isAuthenticated && syncNeeded && pageId && digest?.id) {
      syncLocalTimelineBookmarks(Number(digest.id))
        .then((result) => {
          if (result?.success) {
            console.log(
              `로컬 북마크 ${result.syncCount}개가 서버와 동기화되었습니다.`
            );
            setSyncNeeded(false);
          } else if (result?.error) {
            console.error("북마크 동기화 오류:", result.error);
          }
        })
        .catch((err) => console.error("북마크 동기화 실패:", err));
    }
  }, [isAuthenticated, syncNeeded, pageId, digest?.id]);

  const handleBookmark = async (id: string, seconds: number, text: string) => {
    if (!pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    let newBookmarkedItems = { ...bookmarkedItems };

    // 북마크 추가/제거를 로컬 스토리지에 먼저 반영
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

    // 로컬 스토리지에 저장
    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));
    setShowToast(true);

    // 로그인한 경우에만 서버에 저장/삭제 시도
    if (isAuthenticated && digest?.id) {
      try {
        if (!newBookmarkedItems[id]) {
          // 서버에서 북마크 삭제
          const result = await deleteTimelineBookmark(id, Number(digest.id));
          if (!result.success) {
            console.error("서버 북마크 삭제 오류:", result.error);
          }
        } else {
          // 서버에 북마크 저장
          const result = await saveTimelineBookmark(
            Number(digest.id),
            id,
            seconds,
            text
          );
          if (!result.success) {
            console.error("서버 북마크 저장 오류:", result.error);
          }
        }
      } catch (err) {
        console.error("타임라인 북마크 처리 오류:", err);
      }
    } else if (!isAuthenticated) {
      console.log("로그인하지 않았습니다. 로컬에만 북마크가 저장됩니다.");
    }
  };

  const handleSaveMemo = async (memo: string) => {
    if (!currentBookmarkId || !pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    let newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[currentBookmarkId]) {
      // 로컬 스토리지에 메모 추가
      newBookmarkedItems[currentBookmarkId] = {
        ...newBookmarkedItems[currentBookmarkId],
        memo,
      };

      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      // 로그인한 경우에만 서버에 메모 업데이트 시도
      if (isAuthenticated && digest?.id) {
        try {
          const bookmark = newBookmarkedItems[currentBookmarkId];
          const result = await saveTimelineBookmark(
            Number(digest.id),
            currentBookmarkId,
            bookmark.seconds,
            bookmark.text,
            memo
          );

          if (!result.success) {
            console.error("서버 메모 저장 오류:", result.error);
          }
        } catch (err) {
          console.error("메모 저장 오류:", err);
        }
      } else if (!isAuthenticated) {
        console.log("로그인하지 않았습니다. 로컬에만 메모가 저장됩니다.");
      }

      setToastMessage("메모가 저장되었습니다.");
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleCloseMemoPopup = () => {
    setShowMemoPopup(false);
    setCurrentBookmarkId(null);
  };

  const handleSeekTo = (seconds: number) => {
    if (!digest || digest.sourceType !== "YouTube") return;

    const videoId = getYouTubeVideoId(digest.sourceUrl);
    if (!videoId) return;

    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    try {
      const currentSrc = iframe.src;
      const baseUrl = currentSrc.split("?")[0];

      const newSrc = `${baseUrl}?start=${Math.floor(seconds)}&autoplay=1`;

      iframe.src = newSrc;

      console.log(`${seconds}초 위치로 이동`);
    } catch (error) {
      console.error("비디오 탐색 오류:", error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="header">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <div className="text-sm font-medium text-neutral-dark">
              오류 발생
            </div>
            <div className="w-5"></div>
          </div>
        </header>

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
              요약 로드 실패
            </h1>
            <p className="text-neutral-medium">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-color hover:bg-primary-color/90 text-white"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (loading || !digest) {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <header className="header">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
              >
                <Bookmark className="h-5 w-5 text-neutral-dark" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
              >
                <Share2 className="h-5 w-5 text-neutral-dark" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <article className="max-w-3xl mx-auto px-5 py-8">
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Skeleton className="h-6 w-16 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-20 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-14 rounded-full bg-secondary-color" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-8 w-3/4 mb-2 bg-secondary-color" />
              <Skeleton className="h-8 w-1/2 bg-secondary-color" />
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-line">
              <Skeleton className="h-12 w-12 rounded-full bg-secondary-color" />
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-2 bg-secondary-color" />
                <Skeleton className="h-4 w-24 bg-secondary-color" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-4 w-24 mb-2 bg-secondary-color" />
                <Skeleton className="h-4 w-20 bg-secondary-color" />
              </div>
            </div>

            <Skeleton className="h-64 md:h-80 w-full mb-8 rounded-xl bg-secondary-color" />

            <div className="space-y-6">
              <Skeleton className="h-24 w-full rounded-lg bg-secondary-color" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 bg-secondary-color" />
                <Skeleton className="h-4 w-full bg-secondary-color" />
                <Skeleton className="h-4 w-full bg-secondary-color" />
                <Skeleton className="h-4 w-3/4 bg-secondary-color" />
              </div>
            </div>
          </article>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen pb-24">
        <header className="header">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
                onClick={() => setIsSaved(!isSaved)}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-primary-color" />
                ) : (
                  <Bookmark className="h-5 w-5 text-neutral-dark" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
              >
                <Share2 className="h-5 w-5 text-neutral-dark" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <article className="max-w-3xl mx-auto px-5 py-8">
            <motion.div
              className="flex flex-wrap gap-1.5 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {digest.tags.map((tag: string) => (
                <Link href={`/tag/${tag}`} key={tag}>
                  <span className="tag">{tag}</span>
                </Link>
              ))}
            </motion.div>

            <motion.h1
              className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-neutral-dark"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {digest.title}
            </motion.h1>

            <motion.div
              className="flex items-center gap-4 mb-6 pb-6 border-b border-border-line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar className="h-12 w-12 border-2 border-primary-color/50">
                <AvatarImage
                  src={digest.author?.avatar || "/placeholder.svg"}
                  alt={digest.author?.name || "작성자"}
                />
                <AvatarFallback className="bg-primary-light text-primary-color">
                  {digest.author?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-neutral-dark">
                  {digest.author?.name || "AI 요약"}
                </div>
                <div className="text-sm text-neutral-medium">
                  {digest.author?.role || "자동 생성"}
                </div>
              </div>
              <div className="flex flex-col items-end text-sm text-neutral-medium">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(digest.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{digest.readTime}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mb-8 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {digest.sourceType === "YouTube" && digest.sourceUrl ? (
                <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-border-line shadow-sm">
                  <div className="relative w-full h-48 md:h-80">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                        digest.sourceUrl
                      )}`}
                      title={digest.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full border-0"
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <h2 className="text-xl font-bold text-neutral-dark">
                      {digest.title}
                    </h2>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary-color border border-border-line">
                          {digest.videoInfo?.channelId ? (
                            <Image
                              src={`https://yt3.googleusercontent.com/ytc/${digest.videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`}
                              alt={
                                digest.videoInfo?.channelTitle || "채널 이미지"
                              }
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          ) : (
                            <Image
                              src="/placeholder.svg?height=40&width=40"
                              alt="채널 이미지"
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-neutral-dark">
                            {digest.videoInfo?.channelTitle || "채널명 없음"}
                          </div>
                          <div className="text-xs text-neutral-medium">
                            {digest.videoInfo?.publishedAt
                              ? new Date(
                                  digest.videoInfo.publishedAt
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
                        {digest.videoInfo?.viewCount
                          ? `조회수 ${formatViewCount(
                              digest.videoInfo.viewCount
                            )}회`
                          : "조회수 정보 없음"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-64 md:h-80 w-full bg-white rounded-xl border border-border-line shadow-sm">
                  <Image
                    src={
                      digest.image || "/placeholder.svg?height=400&width=800"
                    }
                    alt={digest.title}
                    fill
                    className="object-cover opacity-80"
                    priority
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              className="mb-8 p-5 bg-primary-light rounded-lg border-l-4 border-primary-color"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-base italic text-neutral-dark">
                {digest.summary}
              </p>
            </motion.div>

            {digest.sourceType === "YouTube" && timelineData.length > 0 && (
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-bold text-neutral-dark">
                      타임라인
                    </h2>
                    <SimpleTooltip
                      content={
                        <div className="relative py-1">
                          <div className="flex gap-2">
                            <p className="text-xs">
                              <span className="mr-1">🔖</span> 타임라인을
                              북마크하면 나중에 쉽게 찾아볼 수 있어요!
                            </p>
                            <button
                              className="absolute top-0 right-0 p-1 text-white/60 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                const tooltipElement =
                                  e.currentTarget.closest('[role="tooltip"]');
                                if (tooltipElement) {
                                  tooltipElement.classList.add("opacity-0");
                                  setTimeout(() => {
                                    tooltipElement.classList.add("hidden");
                                  }, 300);
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      }
                      delay={100}
                    >
                      <button
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-color/10 text-primary-color hover:bg-primary-color/20 transition-colors"
                        aria-label="타임라인 정보"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    </SimpleTooltip>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-neutral-medium rounded-full px-3"
                    onClick={() => setShowTimeline(!showTimeline)}
                  >
                    <AlignJustify className="h-4 w-4 mr-1" />
                    {showTimeline ? "타임라인 숨기기" : "타임라인 보기"}
                  </Button>
                </div>

                {showTimeline && (
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
                )}
              </motion.div>
            )}

            <motion.div
              className="prose prose-blue prose-lg max-w-none mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              dangerouslySetInnerHTML={{ __html: digest.content }}
            />

            <motion.div
              className="flex items-center justify-center gap-4 py-6 border-t border-b border-border-line mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-6 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
                onClick={() => setIsSaved(!isSaved)}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-primary-color" />
                ) : (
                  <Bookmark className="h-5 w-5 text-neutral-dark" />
                )}
                <span className="text-neutral-dark">
                  {isSaved ? "저장됨" : "저장하기"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-6 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
              >
                <Share2 className="h-5 w-5 text-neutral-dark" />
                <span className="text-neutral-dark">공유하기</span>
              </Button>
            </motion.div>

            <motion.div
              className="mt-8 pt-6 border-t border-border-line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-sm font-medium mb-3 text-neutral-dark">
                원본 콘텐츠
              </h3>
              <Link
                href={digest.sourceUrl}
                target="_blank"
                className="flex items-center justify-center w-full p-3.5 bg-white rounded-xl text-sm text-primary-color font-medium hover:bg-primary-light transition-colors border border-border-line"
              >
                원본 보기
              </Link>
            </motion.div>
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
          onAction={
            currentBookmarkId ? () => setShowMemoPopup(true) : undefined
          }
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
    </TooltipProvider>
  );
}

function getYouTubeVideoId(url: string): string {
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
}

function formatViewCount(count: string | number): string {
  if (!count) return "0";

  const num = typeof count === "string" ? Number.parseInt(count, 10) : count;

  if (isNaN(num)) return "0";

  return num.toLocaleString("ko-KR");
}
