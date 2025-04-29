export interface FolderType {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface Digest {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  source_type: string;
  source_url: string;
  created_at: string;
  date: string;
  image: string;
  video_info?: {
    channelTitle?: string;
    viewCount?: string;
    duration?: string;
  };
}

export interface BookmarkItem {
  id: number;
  user_id: string;
  digest_id: number;
  created_at: string;
  folder_id?: string;
  digests: Digest;
  folders?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export type SortType = "latest" | "oldest" | "popular" | "duration";
// YouTube API 타입 정의
export interface YouTubePlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
}

export interface YouTubeAPI {
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
  ) => YouTubePlayer;
  ready: (callback: () => void) => void;
}

// 확장된 Window 속성
export interface ExtendedWindow {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: (() => void) | null;
  syncTimer?: NodeJS.Timeout;
  ytPlayer?: any; // YouTube 플레이어 전역 참조
}

// 북마크 아이템 타입
export interface TimelineBookmarkItem {
  id: string;
  seconds: number;
  text: string;
  memo?: string;
  timestamp: number;
}

// YouTube 팝업 상태 타입
export interface YouTubePopupState {
  isOpen: boolean;
  videoId: string;
  startTime: number;
}

// 타임라인 플레이어 섹션 속성 타입
export interface TimelinePlayerSectionProps {
  sourceType: string;
  sourceUrl: string;
  activeTab: string;
  onPlayerReady: (player: YouTubePlayer) => void;
  onTimeUpdate: (currentTime: number) => void;
}

// 번역 문단 타입
export interface TranslatedParagraph {
  start: string;
  text: string;
  index?: number;
}
