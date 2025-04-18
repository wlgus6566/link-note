import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 서버 컴포넌트에서 사용할 Supabase 클라이언트를 생성합니다.
 * Next.js 15에서는 cookies()가 비동기 함수로 변경되었으므로 이를 고려합니다.
 */
export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL과 익명 키가 설정되지 않았습니다.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          // 쿠키 설정 실패시 오류 로깅
          console.error("쿠키 설정 실패:", error);
        }
      },
      remove(name, options) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch (error) {
          // 쿠키 제거 실패시 오류 로깅
          console.error("쿠키 제거 실패:", error);
        }
      },
    },
  });
}
