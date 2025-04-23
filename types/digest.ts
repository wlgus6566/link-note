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
