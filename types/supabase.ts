export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: number;
          user_id: string;
          digest_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          digest_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          digest_id?: number;
          created_at?: string;
        };
      };
      digests: {
        Row: {
          id: number;
          title: string;
          summary: string;
          content: string;
          source_url: string | null;
          source_type: string | null;
          image: string | null;
          tags: string[] | null;
          author: Json | null;
          date: string | null;
          read_time: string | null;
          video_info: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          summary: string;
          content: string;
          source_url?: string | null;
          source_type?: string | null;
          image?: string | null;
          tags?: string[] | null;
          author?: Json | null;
          date?: string | null;
          read_time?: string | null;
          video_info?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          summary?: string;
          content?: string;
          source_url?: string | null;
          source_type?: string | null;
          image?: string | null;
          tags?: string[] | null;
          author?: Json | null;
          date?: string | null;
          read_time?: string | null;
          video_info?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      folder_bookmarks: {
        Row: {
          id: number;
          folder_id: number;
          bookmark_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          folder_id: number;
          bookmark_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          folder_id?: number;
          bookmark_id?: number;
          created_at?: string;
        };
      };
      folders: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      timeline_bookmarks: {
        Row: {
          id: number;
          user_id: string;
          digest_id: number;
          timeline_id: string;
          seconds: number;
          text: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          digest_id: number;
          timeline_id: string;
          seconds: number;
          text: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          digest_id?: number;
          timeline_id?: string;
          seconds?: number;
          text?: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: number;
          auth_id: string;
          email: string;
          name: string | null;
          avatar: string | null;
          is_admin: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          auth_id: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          is_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          auth_id?: string;
          email?: string;
          name?: string | null;
          avatar?: string | null;
          is_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
