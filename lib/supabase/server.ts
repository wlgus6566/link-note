import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL과 익명 키가 설정되지 않았습니다.");
  }

  // 쿠키 헤더로부터 클라이언트 생성
  const cookieStore = cookies();

  // Supabase 클라이언트 디버깅을 위한 로그
  const allCookies = cookieStore.getAll();
  console.log(
    "서버 클라이언트 생성 시 쿠키 목록:",
    allCookies.map((c) => c.name)
  );

  const token = cookieStore.get("sb-urunpeifuloeerxbteve-auth-token")?.value;
  console.log("인증 토큰 존재 여부:", !!token);

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        const cookie = cookieStore.get(name);
        if (!cookie) return null;
        return cookie.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          console.error("쿠키 설정 오류:", error);
        }
      },
      remove(name, options) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch (error) {
          console.error("쿠키 제거 오류:", error);
        }
      },
    },
  });
};
