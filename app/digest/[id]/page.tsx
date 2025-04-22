"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Info,
  MapPinIcon as MapPinCheckInside,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion, type PanInfo, AnimatePresence } from "framer-motion";
import { TimelineAccordion } from "@/components/timeline/timeline-accordion";
import type { TimelineGroup } from "@/lib/utils/youtube";
import {
  syncLocalTimelineBookmarks,
  saveTimelineBookmark,
  deleteTimelineBookmark,
  formatTime,
} from "@/lib/utils/timeline";
import { saveTimelineData, getTimelineData } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimelineBookmarkButton } from "@/components/timeline/timeline-bookmark-button";
import { TimelineGuideSheet } from "@/components/timeline/timeline-guide-sheet";
import { useAuth } from "@/lib/hooks/useAuth";
import { Header } from "@/components/Header";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";
import { MemoPopup } from "@/components/ui/memo-popup";
import { DesignToast } from "@/components/ui/toast";
import { BookmarksPopup } from "@/components/ui/bookmarks-popup";

// YouTube API 타입 선언
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId: string;
          playerVars?: {
            playsinline?: number;
            rel?: number;
            modestbranding?: number;
            [key: string]: any;
          };
          events?: {
            onReady?: (event: any) => void;
            onError?: (event: any) => void;
            onStateChange?: (event: any) => void;
            [key: string]: any;
          };
        }
      ) => {
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        getCurrentTime: () => number;
      };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady: (() => void) | null;
    syncTimer?: NodeJS.Timeout;
    ytPlayer?: any; // YouTube 플레이어 전역 참조
  }
}

interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  memo?: string;
  timestamp: number;
}

interface YouTubePopupState {
  isOpen: boolean;
  videoId: string;
  startTime: number;
}

// YouTube 플레이어 컴포넌트
interface TimelinePlayerSectionProps {
  sourceType: string;
  sourceUrl: string;
  activeTab: string;
  onPlayerReady: () => void;
  onTimeUpdate: (currentTime: number) => void;
}

function TimelinePlayerSection({
  sourceType,
  sourceUrl,
  activeTab,
  onPlayerReady,
  onTimeUpdate,
}: TimelinePlayerSectionProps) {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // YouTube IFrame API 로드 및 초기화
  useEffect(() => {
    if (sourceType !== "YouTube" || !sourceUrl) return;

    // YouTube IFrame API가 이미 로드되었는지 확인
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // API 로드
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API 로드 완료 이벤트 처리
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      // 컴포넌트 언마운트 시 이벤트 핸들러 제거
      window.onYouTubeIframeAPIReady = null;
    };
  }, [sourceType, sourceUrl]);

  // 플레이어 초기화
  const initializePlayer = () => {
    if (!playerContainerRef.current || !sourceUrl) return;

    const videoId = getYouTubeVideoId(sourceUrl);
    if (!videoId) return;

    // Player 객체 생성
    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        fs: 0,
        controls: 1,
        cc_load_policy: 0,
        disablekb: 0,
      },
      events: {
        onReady: () => {
          setPlayerReady(true);
          onPlayerReady();

          // 외부에서 참조할 수 있도록 전역 변수에 저장
          window.ytPlayer = playerRef.current;
        },
        onError: (e) => console.error("YouTube Player 오류:", e),
      },
    });
  };

  // 현재 시간 업데이트를 위한 인터벌
  useEffect(() => {
    if (!playerReady) return;

    const id = setInterval(() => {
      const time = playerRef.current?.getCurrentTime?.() ?? 0;
      onTimeUpdate(time);
    }, 500);

    return () => clearInterval(id);
  }, [playerReady, onTimeUpdate]);

  // 탭 변경 시 스크롤 위치 조정
  useEffect(() => {
    if (activeTab === "transcript" && playerContainerRef.current) {
      // 탭 전환 시 스크롤 위치를 영상 위로 조정
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  // 비디오 재생 위치 이동
  const seekTo = (seconds: number) => {
    if (playerReady && playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
      return true;
    }
    return false;
  };

  // 컴포넌트 외부에서 메서드 사용 가능하게 함
  useEffect(() => {
    // playerRef를 외부에서 참조할 수 있도록 모듈화
    if (playerRef.current) {
      playerRef.current.seekToTime = seekTo;
    }
  }, [playerReady]);

  if (sourceType !== "YouTube" || !sourceUrl) {
    return null;
  }

  return (
    <div
      className={`w-full ${
        activeTab === "transcript" ? "sticky top-16 z-20" : "mb-4"
      }`}
    >
      <div className="relative w-full aspect-video">
        <div
          ref={playerContainerRef}
          className="absolute top-0 left-0 w-full h-full border-0"
        ></div>
      </div>
    </div>
  );
}

export default function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const playerInstanceRef = useRef<any>(null);

  // 상태 관리
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, BookmarkItem>
  >({});

  // UI 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAddMemoButton, setShowAddMemoButton] = useState(false);
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<string | null>(
    null
  );
  const [syncNeeded, setSyncNeeded] = useState(false);
  const [showBookmarksPopup, setShowBookmarksPopup] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFolderSelectionModal, setShowFolderSelectionModal] =
    useState(false);
  const [showGuidePopup, setShowGuidePopup] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("summary");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [youtubePopup, setYoutubePopup] = useState<YouTubePopupState>({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });

  // 타이머 참조를 위한 ref
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 플레이어 준비 상태
  const [playerReady, setPlayerReady] = useState(false);

  // 플레이어 준비 완료 핸들러
  const handlePlayerReady = () => {
    setPlayerReady(true);

    // 전역 참조에서 플레이어 인스턴스를 가져옴
    if (!playerInstanceRef.current && window.ytPlayer) {
      playerInstanceRef.current = window.ytPlayer;
      console.log("전역 YouTube 플레이어 참조 성공");
    }
  };

  // 플레이어 시간 업데이트 핸들러
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // 스와이프 핸들러
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      setActiveTab("summary");
      setSwipeDirection(1);
    } else if (info.offset.x < -threshold) {
      setActiveTab("transcript");
      setSwipeDirection(-1);
    }
  };

  // 탭 변경 시 스와이프 방향 설정
  useEffect(() => {
    if (activeTab === "summary" || activeTab === "transcript") {
      setSwipeDirection(0);
    }
  }, [activeTab]);

  // URL 파라미터에서 다이제스트 ID 추출
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPageId(resolvedParams.id);
      } catch (error) {
        console.error("URL 파라미터 처리 오류:", error);
        setError("페이지 ID를 가져오는데 실패했습니다.");
      }
    };

    resolveParams();
  }, [params]);

  // 현재 재생 시간과 타임라인 항목 연동
  useEffect(() => {
    if (!timelineData.length) return;

    // 모든 세그먼트 추출
    const segments = timelineData.flatMap((group) => {
      if (group.subtitles?.length) {
        return group.subtitles.map((sub) => ({
          id: String(sub.startSeconds),
          seconds: Number(sub.startSeconds),
        }));
      }
      if (group.items?.length) {
        return group.items.map((it) => ({
          id: String(it.id),
          seconds: Number(it.seconds),
        }));
      }
      return [];
    });

    if (!segments.length) return;

    // 현재 시간과 가장 가까운 세그먼트 찾기
    const active = segments.reduce(
      (prev, seg) =>
        seg.seconds <= currentTime && seg.seconds > prev.seconds ? seg : prev,
      { id: "", seconds: Number.NEGATIVE_INFINITY }
    );

    // 새로운 세그먼트로 스크롤
    if (active.id && active.id !== currentSegmentId) {
      setCurrentSegmentId(active.id);
      const safeId = CSS?.escape
        ? CSS.escape(active.id)
        : active.id.replace(/\./g, ".");
      const el = document.querySelector(`[data-segment-id="${safeId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, timelineData, currentSegmentId]);

  // 타임라인 데이터 로드
  useEffect(() => {
    if (!pageId || !digest?.id) return;

    let isMounted = true;

    const fetchTimelineData = async () => {
      try {
        // 로컬 스토리지에서 데이터 확인
        const timelineKey = `timeline_${pageId}`;
        const storedTimeline = localStorage.getItem(timelineKey);
        let parsedTimeline = null;

        if (storedTimeline) {
          try {
            parsedTimeline = JSON.parse(storedTimeline);
            setTimelineData(parsedTimeline);
          } catch (parseError) {
            console.error("로컬 타임라인 데이터 파싱 오류:", parseError);
          }
        }

        // 로그인한 경우 서버와 데이터 동기화
        if (isAuthenticated) {
          // 로컬 데이터가 있으면 먼저 서버에 저장
          if (
            parsedTimeline &&
            Array.isArray(parsedTimeline) &&
            parsedTimeline.length > 0
          ) {
            try {
              await saveTimelineData(Number(digest.id), parsedTimeline);
            } catch (saveError) {
              console.error("타임라인 데이터 서버 저장 오류:", saveError);
            }
          }

          // 서버에서 데이터 가져오기
          try {
            const response = await getTimelineData(Number(digest.id));

            if (
              response.success &&
              response.data &&
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              // 서버 데이터가 있으면 사용
              setTimelineData(response.data);
              // 로컬 스토리지도 업데이트
              localStorage.setItem(timelineKey, JSON.stringify(response.data));
            }
          } catch (fetchError) {
            console.error("서버 타임라인 데이터 가져오기 오류:", fetchError);
          }
        }
      } catch (error) {
        console.error("타임라인 데이터 처리 중 오류 발생:", error);
      }
    };

    fetchTimelineData();

    return () => {
      isMounted = false;
    };
  }, [pageId, digest?.id, isAuthenticated]);

  // 북마크 데이터 로드
  useEffect(() => {
    if (!pageId) return;

    try {
      const bookmarkKey = `bookmarks_timeline_${pageId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);

      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        setBookmarkedItems(parsedBookmarks);
      }
    } catch (error) {
      console.error("북마크 데이터 로딩 오류:", error);
    }
  }, [pageId]);

  // 인증 상태 변경 감지 및 북마크 동기화
  useEffect(() => {
    if (isAuthenticated === true && pageId && !syncNeeded) {
      setSyncNeeded(true);
    }
  }, [isAuthenticated, pageId]);

  // 북마크 서버 동기화
  useEffect(() => {
    if (isAuthenticated !== true || !syncNeeded || !pageId || !digest?.id)
      return;

    // 동기화 시작 시 바로 상태 변경하여 중복 실행 방지
    setSyncNeeded(false);

    // 이전 재시도 타이머가 있으면 초기화
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    syncLocalTimelineBookmarks(Number(digest.id))
      .then((result) => {
        if (!result?.success && result?.error) {
          // 에러 발생 시 나중에 다시 시도
          retryTimerRef.current = setTimeout(() => {
            setSyncNeeded(true);
            retryTimerRef.current = null;
          }, 30000); // 30초 후 재시도
        }
      })
      .catch(() => {
        // 예외 발생 시 나중에 다시 시도
        retryTimerRef.current = setTimeout(() => {
          setSyncNeeded(true);
          retryTimerRef.current = null;
        }, 30000);
      });

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isAuthenticated, syncNeeded, pageId, digest?.id]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      if (window.syncTimer) {
        clearTimeout(window.syncTimer);
        window.syncTimer = undefined;
      }
    };
  }, []);

  // 다이제스트 데이터 가져오기
  useEffect(() => {
    if (!pageId) return;

    let isMounted = true;
    let isDataFetched = false;

    const fetchDigest = async () => {
      // 이미 데이터가 있거나 가져오는 중이면 중복 요청 방지
      if (digest && digest.id === Number.parseInt(pageId)) {
        return;
      }

      if (isDataFetched) {
        return;
      }

      isDataFetched = true;

      try {
        setLoading(true);
        const response = await fetch(`/api/digest/${pageId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (result.success) {
          const digestData = result.data;

          // YouTube 채널 썸네일 정보 처리
          if (digestData.sourceType === "YouTube" && digestData.sourceUrl) {
            try {
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

    // 약간의 지연을 두고 데이터 가져오기 (디바운싱)
    const timeoutId = setTimeout(fetchDigest, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pageId, digest]);

  // 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated !== true || !digest?.id) return;

      try {
        const response = await fetch(`/api/bookmarks?digestId=${digest.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        const result = await response.json();
        if (result.success) {
          setIsSaved(result.isBookmarked);
        }
      } catch (error) {
        console.error("북마크 상태 확인 오류:", error);
      }
    };

    checkBookmarkStatus();
  }, [isAuthenticated, digest?.id]);

  // 탭 변경 시 스크롤 위치 조정
  useEffect(() => {
    if (activeTab === "transcript" && playerInstanceRef.current) {
      // 탭 전환 시 스크롤 위치를 영상 위로 조정
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const handleBookmark = async (id: string, seconds: number, text: string) => {
    if (!pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };
    let isAdding = false;

    // 북마크 추가/제거를 로컬 스토리지에 먼저 반영
    if (newBookmarkedItems[id]) {
      // 북마크 제거
      delete newBookmarkedItems[id];
      setToastMessage("타임라인이 삭제되었습니다.");
      setCurrentBookmarkId(null);
      setShowAddMemoButton(false);
      isAdding = false;
    } else {
      // 북마크 추가
      newBookmarkedItems[id] = {
        id,
        seconds,
        text,
        timestamp: Date.now(),
      };
      setToastMessage("타임라인에 저장되었습니다.");
      setCurrentBookmarkId(id);
      setShowAddMemoButton(true);
      isAdding = true;
    }

    // 로컬 스토리지에 저장
    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));
    setShowToast(true);

    // 토스트 메시지 자동 숨김 타이머 설정
    setTimeout(() => {
      setShowToast(false);
      setShowAddMemoButton(false);
    }, 5000);

    // 로그인한 경우에만 서버에 직접 저장/삭제 API 호출
    if (isAuthenticated === true && digest?.id) {
      try {
        if (isAdding) {
          // 북마크 추가 - 직접 API 호출
          const result = await saveTimelineBookmark(
            Number(digest.id),
            id,
            seconds,
            text
          );
          if (!result.success) {
            console.error("서버 북마크 저장 오류:", result.error);
          } else {
            console.log("서버에 북마크가 저장되었습니다:", id);
          }
        } else {
          // 북마크 삭제 - 직접 API 호출
          const result = await deleteTimelineBookmark(id, Number(digest.id));
          if (!result.success) {
            console.error("서버 북마크 삭제 오류:", result.error);
          } else {
            console.log("서버에서 북마크가 삭제되었습니다:", id);
          }
        }
      } catch (err) {
        console.error("북마크 서버 동기화 오류:", err);
      }

      // 기존 디바운싱 로직도 유지 (백업 동기화)
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      // 3초 후 동기화 트리거 (여러 번 빠르게 북마크 추가/제거 시 최적화)
      syncTimerRef.current = setTimeout(() => {
        setSyncNeeded(true);
        syncTimerRef.current = null;
      }, 3000);
    }
  };

  const handleSaveMemo = async (memo: string) => {
    if (!currentBookmarkId || !pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[currentBookmarkId]) {
      // 로컬 스토리지에 메모 추가
      newBookmarkedItems[currentBookmarkId] = {
        ...newBookmarkedItems[currentBookmarkId],
        memo,
      };

      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      // 로그인한 경우에만 서버에 메모 업데이트 시도
      if (isAuthenticated === true && digest?.id) {
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
      } else if (isAuthenticated !== true) {
        console.log("로그인하지 않았습니다. 로컬에만 메모가 저장됩니다.");
      }

      setToastMessage("타임라인이 저장되었습니다.");
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
    setShowAddMemoButton(false);
  };

  const handleAddMemo = () => {
    if (currentBookmarkId) {
      setShowMemoPopup(true);
      setShowToast(false);
    }
  };

  const handleCloseMemoPopup = () => {
    setShowMemoPopup(false);
    setCurrentBookmarkId(null);
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };

    // 북마크가 존재하는지 확인
    if (newBookmarkedItems[id]) {
      // 북마크 제거
      delete newBookmarkedItems[id];
      setToastMessage("타임라인이 삭제되었습니다.");
      setShowToast(true);

      // 로컬 스토리지에 저장
      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      // 로그인한 경우에만 서버에서도 삭제
      if (isAuthenticated === true && digest?.id) {
        try {
          // 북마크 삭제 - 직접 API 호출
          const result = await deleteTimelineBookmark(id, Number(digest.id));
          if (!result.success) {
            console.error("서버 북마크 삭제 오류:", result.error);
          } else {
            console.log("서버에서 북마크가 삭제되었습니다:", id);
          }
        } catch (err) {
          console.error("북마크 서버 동기화 오류:", err);
        }
      }

      // 토스트 메시지 자동 숨김 타이머 설정
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  // 타임라인 아이템 클릭 시 해당 시간으로 이동
  const handleSeekTo = (seconds: number) => {
    if (!digest || digest.sourceType !== "YouTube") return;

    // 북마크 팝업이 열려있다면 닫기
    if (showBookmarksPopup) {
      setShowBookmarksPopup(false);
    }

    // 첫 번째로 전역 플레이어 인스턴스 확인
    if (window.ytPlayer && typeof window.ytPlayer.seekTo === "function") {
      try {
        console.log(`${seconds}초로 이동합니다 (전역 참조 사용)`);
        window.ytPlayer.seekTo(seconds, true);
        window.ytPlayer.playVideo();
        return;
      } catch (error) {
        console.error("전역 플레이어 참조로 시간 이동 중 오류 발생:", error);
      }
    }

    // 다음으로 컴포넌트 플레이어 인스턴스 확인
    if (playerReady && playerInstanceRef.current) {
      try {
        if (typeof playerInstanceRef.current.seekTo !== "function") {
          console.error(
            "seekTo 메서드가 존재하지 않습니다. 유효한 플레이어 인스턴스가 아닙니다."
          );
          return;
        }

        console.log(`${seconds}초로 이동합니다 (컴포넌트 참조 사용)`);
        // seekTo: 첫 번째 인자는 시간(초), 두 번째 인자가 true면 정확한 시간으로 이동
        playerInstanceRef.current.seekTo(seconds, true);

        // 영상 재생 시작
        playerInstanceRef.current.playVideo();
      } catch (error) {
        console.error("시간 이동 중 오류 발생:", error);
      }
    } else {
      // 플레이어가 준비되지 않았으면 팝업 사용
      const videoId = getYouTubeVideoId(digest.sourceUrl);
      if (!videoId) return;

      setYoutubePopup({
        isOpen: true,
        videoId,
        startTime: seconds,
      });
    }
  };

  const handleSaveBookmark = () => {
    console.log("북마크 저장 시도");
    console.log(isAuthenticated);
    if (isAuthenticated !== true) {
      toast.error("북마크를 저장하려면 로그인이 필요합니다");
      router.push("/login");
      return;
    }

    setShowFolderSelectionModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!digest?.id) return;

    try {
      const response = await fetch(`/api/bookmarks?digestId=${digest.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        setIsSaved(false);
        setToastMessage("저장이 취소되었습니다.");
        setShowToast(true);
      } else {
        setToastMessage("저장 취소 중 오류가 발생했습니다.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
      setToastMessage("저장 취소 중 오류가 발생했습니다.");
      setShowToast(true);
    } finally {
      setShowConfirmDialog(false);
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
                <MapPinCheckInside className="h-4 w-4 text-primary-color" />
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
    <div className="flex flex-col min-h-screen pb-24">
      <Header
        title={digest.title}
        backUrl="back"
        showBackButton={true}
        rightElement={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary-light"
              onClick={handleSaveBookmark}
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
        }
      />

      <main className="flex-1">
        <div className="container px-0 sm:px-5">
          {/* 비디오 섹션 */}
          {digest.sourceType === "YouTube" && digest.sourceUrl && (
            <TimelinePlayerSection
              sourceType={digest.sourceType}
              sourceUrl={digest.sourceUrl}
              activeTab={activeTab}
              onPlayerReady={handlePlayerReady}
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {/* 탭 네비게이션 */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div
              className={`sticky ${
                activeTab === "transcript"
                  ? "top-[calc(56.25vw+64px)]"
                  : "top-16"
              } z-10 bg-white border-b border-border-line`}
            >
              <TabsList className="grid w-full grid-cols-2 p-0 h-12">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary-color data-[state=active]:text-primary-color rounded-none h-full"
                >
                  AI 요약 정리
                </TabsTrigger>
                <TabsTrigger
                  value="transcript"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary-color data-[state=active]:text-primary-color rounded-none h-full"
                >
                  스크립트
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 스와이프 가능한 콘텐츠 영역 */}
            <div ref={contentRef} className="overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={{
                  x: swipeDirection * window.innerWidth,
                  transition: { duration: 0.3 },
                }}
                className="flex w-full"
              >
                <div
                  className={`w-full flex-shrink-0 ${
                    activeTab === "summary" ? "block" : "hidden md:block"
                  }`}
                >
                  <TabsContent value="summary" className="mt-0 p-5">
                    {/* AI 요약 정리 콘텐츠 */}
                    <div className="mb-4 p-5 bg-primary-light rounded-lg border-l-4 border-primary-color">
                      <p className="text-base italic text-neutral-dark">
                        {digest.summary}
                      </p>
                    </div>

                    <motion.div
                      className="prose prose-blue prose-lg max-w-none mb-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      dangerouslySetInnerHTML={{ __html: digest.content }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full"
                    >
                      콘텐츠 저장하기
                    </Button>
                  </TabsContent>
                </div>

                <div
                  className={`w-full flex-shrink-0 ${
                    activeTab === "transcript" ? "block" : "hidden md:block"
                  }`}
                >
                  <TabsContent value="transcript" className="mt-0 p-5">
                    {/* 스크립트 콘텐츠 */}
                    {digest.sourceType === "YouTube" &&
                      timelineData.length > 0 && (
                        <motion.div
                          className="mb-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <h2 className="text-lg font-bold text-neutral-dark">
                                타임라인
                              </h2>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm text-neutral-medium rounded-full px-3"
                              onClick={() => setShowGuidePopup(true)}
                            >
                              <Info className="h-4 w-4 bg-[#1976D2] text-white rounded-full p-0.5" />
                              이용가이드
                            </Button>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <TimelineAccordion
                              timelineGroups={timelineData}
                              onSeek={handleSeekTo}
                              currentSegmentId={currentSegmentId || undefined}
                              bookmarkedItems={Object.keys(
                                bookmarkedItems
                              ).reduce(
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full"
                    >
                      콘텐츠 저장하기
                    </Button>
                  </TabsContent>
                </div>
              </motion.div>
            </div>
          </Tabs>
        </div>
      </main>

      <BottomNav />

      {/* 타임라인 북마크 버튼 */}
      <TimelineBookmarkButton
        bookmarkCount={Object.keys(bookmarkedItems).length}
        onClick={() => setShowBookmarksPopup(true)}
        onGuideClick={() => setShowGuidePopup(true)}
      />

      {/* 북마크 팝업 */}
      <AnimatePresence>
        {showBookmarksPopup && (
          <BookmarksPopup
            isOpen={showBookmarksPopup}
            onClose={() => setShowBookmarksPopup(false)}
            bookmarks={bookmarkedItems}
            onBookmarkClick={handleSeekTo}
            onBookmarkDelete={handleDeleteBookmark}
            formatTime={formatTime}
          />
        )}
      </AnimatePresence>

      {/* 폴더 선택 모달    */}
      <AnimatePresence>
        {showFolderSelectionModal && (
          <FolderSelectionModal
            isOpen={showFolderSelectionModal}
            onClose={() => setShowFolderSelectionModal(false)}
            digestId={digest.id}
            title={digest.title}
            onSuccess={() => {
              setShowFolderSelectionModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 타임라인 이용 가이드 */}
      <AnimatePresence>
        {showGuidePopup && (
          <TimelineGuideSheet
            isOpen={showGuidePopup}
            onClose={() => setShowGuidePopup(false)}
            onStartBookmarking={() => {
              setShowGuidePopup(false);
              setActiveTab("transcript");
            }}
          />
        )}
      </AnimatePresence>

      {/* 메모 팝업 */}
      <MemoPopup
        isOpen={showMemoPopup}
        onClose={handleCloseMemoPopup}
        onSave={handleSaveMemo}
        initialMemo={
          (currentBookmarkId && bookmarkedItems[currentBookmarkId]?.memo) || ""
        }
        title="북마크 메모 추가"
      />

      {/* 토스트 메시지 */}
      <DesignToast
        isVisible={showToast}
        message={toastMessage}
        onClose={handleCloseToast}
        showAddButton={showAddMemoButton}
        onAddButtonClick={handleAddMemo}
      />
    </div>
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

// formatTime 함수 추가 - 파일 맨 아래, getYouTubeVideoId 함수 위에 추가

// 조회수 포맷 함수를 내부 함수로 변경
function formatViewCount(count: string | number): string {
  if (!count) return "0";

  const num = typeof count === "string" ? Number.parseInt(count, 10) : count;
  if (isNaN(num)) return "0";

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만회`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}천회`;
  }

  return `${num}회`;
}
