"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트가 브라우저에서만 생성되도록 함
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL과 익명 키가 설정되지 않았습니다.");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};
