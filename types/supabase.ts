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
      users: {
        Row: {
          id: number;
          auth_id: string;
          name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          auth_id: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          auth_id?: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      digests: {
        Row: {
          id: number;
          title: string;
          summary: string | null;
          content: string | null;
          image: string | null;
          source_url: string | null;
          source_type: string | null;
          created_at: string | null;
          updated_at: string | null;
          author_name: string | null;
          author_avatar: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          summary?: string | null;
          content?: string | null;
          image?: string | null;
          source_url?: string | null;
          source_type?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_name?: string | null;
          author_avatar?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          summary?: string | null;
          content?: string | null;
          image?: string | null;
          source_url?: string | null;
          source_type?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          author_name?: string | null;
          author_avatar?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "digests_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["auth_id"];
          }
        ];
      };
      timeline_bookmarks: {
        Row: {
          id: number;
          user_id: string;
          digest_id: number;
          timestamp: number | null;
          memo: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          digest_id: number;
          timestamp?: number | null;
          memo?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          digest_id?: number;
          timestamp?: number | null;
          memo?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_bookmarks_digest_id_fkey";
            columns: ["digest_id"];
            referencedRelation: "digests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "timeline_bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["auth_id"];
          }
        ];
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
