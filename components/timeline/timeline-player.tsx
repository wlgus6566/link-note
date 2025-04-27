import { useRef, useState, useEffect } from "react";
import { TimelinePlayerSectionProps } from "@/types/digest";

/**
 * YouTube 비디오 ID를 추출하는 함수
 */
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

/**
 * 타임라인 플레이어 컴포넌트
 */
export function TimelinePlayerSection({
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
    if (window.YT && window.YT.Player) {
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
            if (playerRef.current) {
              window.ytPlayer = playerRef.current;
              setPlayerReady(true);
              onPlayerReady();
            }
          },
          onError: (e) => console.error("YouTube Player 오류:", e),
        },
      });
    } else {
      console.error("YouTube IFrame API가 로드되지 않았습니다.");
    }
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
      className={`w-full md:sticky md:top-20 md:w-[45%] md:h-fit ${
        activeTab === "transcript" || activeTab === "translated"
          ? "sticky top-16 z-20"
          : "mb-4"
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
