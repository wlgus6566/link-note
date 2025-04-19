import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * 현재 세션 정보를 가져오는 함수
 * @returns 세션 정보 및 사용자 데이터
 */
export async function getSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("세션 조회 오류:", error);
      return { session: null, user: null, error: error.message };
    }

    return {
      session,
      user: session?.user || null,
      error: null,
    };
  } catch (err) {
    console.error("세션 조회 중 예외 발생:", err);
    const errorMessage =
      err instanceof Error ? err.message : "세션 조회 중 오류 발생";
    return { session: null, user: null, error: errorMessage };
  }
}

/**
 * 인증 상태를 확인하고 인증되지 않았으면 로그인 페이지로 리다이렉트
 * @param redirectTo 리다이렉트할 로그인 URL (기본값: /login)
 * @returns 인증된 사용자의 정보
 */
export async function requireAuth(redirectTo = "/login") {
  const { session, user, error } = await getSession();

  if (!session || !user) {
    redirect(redirectTo);
  }

  return { user, session };
}

/**
 * 현재 사용자의 인증 상태만 확인
 * @returns 인증 상태 (true: 로그인됨, false: 로그인되지 않음)
 */
export async function isAuthenticated() {
  const { session } = await getSession();
  return !!session;
}

/**
 * 현재 인증된 사용자의 ID를 가져옴
 * @returns 사용자 ID 또는 null
 */
export async function getUserId() {
  const { user } = await getSession();
  return user?.id || null;
}
