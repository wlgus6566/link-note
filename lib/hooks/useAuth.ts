"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
  checkAuth: () => Promise<boolean>;
}

/**
 * 사용자 인증 상태를 확인하는 커스텀 훅
 * @returns {UseAuthResult} 인증 관련 상태와 함수
 */
export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 사용자 인증 상태를 확인하는 함수
   * @returns {Promise<boolean>} 인증 상태 (true: 로그인됨, false: 로그인되지 않음)
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      const supabase = createClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("인증 상태 확인 오류:", sessionError);
        setError(sessionError.message);
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const isAuth = !!sessionData.session;
      setIsAuthenticated(isAuth);

      if (isAuth && sessionData.session) {
        // 추가 사용자 정보 가져오기
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData?.user || null);
      } else {
        setUser(null);
      }

      setError(null);
      return isAuth;
    } catch (err) {
      console.error("인증 처리 중 오류 발생:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "인증 상태를 확인하는데 실패했습니다.";
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();

    // Supabase 인증 상태 변경 이벤트 구독
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      checkAuth();
    });

    // 클린업 함수
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    checkAuth,
  };
}

// 서버 컴포넌트에서 사용 가능한 인증 확인 함수
export async function checkServerAuth() {
  // 서버 컴포넌트에서는 직접 구현해야 함
  // 클라이언트 컴포넌트용 훅을 내보내는 파일에 추가
  console.warn("checkServerAuth는 서버 컴포넌트에서 직접 구현해야 합니다.");
  return false;
}
