// 북마크 아이템 타입
export interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  memo?: string;
  timestamp: number;
}

// 타임라인 북마크 타입 (Supabase DB)
export interface TimelineBookmark {
  id: number;
  user_id: number;
  digest_id: number;
  timeline_id: string;
  seconds: number;
  text: string;
  memo?: string;
  created_at: string;
  updated_at: string;
  digests?: {
    id: number;
    title: string;
    source_url: string;
    image?: string;
    source_type: string;
    video_info?: {
      videoId?: string;
      channelId?: string;
      channelTitle?: string;
      publishedAt?: string;
      viewCount?: string;
      duration?: string;
    };
  };
}

// 타임라인 아이템 타입
export interface TimelineItem {
  id: string;
  start: number;
  end?: number;
  text: string;
}

// 타임라인 그룹화 타입
export interface TimelineGroup {
  title: string;
  items: TimelineItem[];
}
