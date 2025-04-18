import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 인수 없이 사용할 경우의 기본 버전
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value ?? "";
        },
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // 쿠키 설정 중 오류 처리
            console.error("쿠키 설정 중 오류:", error);
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, "", { ...options, maxAge: -1 });
          } catch (error) {
            // 쿠키 삭제 중 오류 처리
            console.error("쿠키 삭제 중 오류:", error);
          }
        },
      },
    }
  );
}
