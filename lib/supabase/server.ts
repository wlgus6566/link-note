import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// 환경 변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 서버 컴포넌트에서 사용할 Supabase 클라이언트를 생성합니다.
 * 비동기적으로 쿠키를 처리합니다.
 */
export async function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => {
          try {
            return cookies().get(name)?.value;
          } catch (error) {
            console.error(`쿠키 가져오기 오류 (${name}):`, error);
            return undefined;
          }
        },
        set: async (name, value, options) => {
          try {
            cookies().set(name, value, options);
          } catch (error) {
            console.error(`쿠키 설정 오류 (${name}):`, error);
          }
        },
        remove: async (name, options) => {
          try {
            cookies().set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.error(`쿠키 삭제 오류 (${name}):`, error);
          }
        },
      },
    }
  );
}
