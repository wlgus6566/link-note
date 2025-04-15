import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL과 익명 키가 설정되지 않았습니다.");
  }

  // 서버 컴포넌트에서는 cookies()를 사용하여 쿠키에 접근
  const cookieStore = cookies();

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // 쿠키 스토리지 사용
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  });
};
