"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore, User } from "@/store/userStore";

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
  const {
    isAuthenticated,
    isLoading,
    user,
    setUser,
    setIsAuthenticated,
    setIsLoading,
  } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const checkingRef = useRef(false);

  /**
   * 사용자 인증 상태를 확인하는 함수
   * @returns {Promise<boolean>} 인증 상태 (true: 로그인됨, false: 로그인되지 않음)
   */
  const checkAuth = async (): Promise<boolean> => {
    // 이미 확인 중이면 중복 요청 방지
    if (checkingRef.current) {
      return isAuthenticated;
    }

    try {
      checkingRef.current = true;
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
        // Supabase Auth에서 기본 사용자 정보 가져오기
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          try {
            // 사용자 프로필 정보 API에서 가져오기
            const response = await fetch("/api/users");
            const data = await response.json();

            if (response.ok && data.user) {
              // Zustand 스토어에 사용자 정보 저장
              setUser({
                id: userData.user.id,
                email: userData.user.email || "",
                name: data.user.name || "사용자",
                avatar: data.user.avatar || undefined,
                bio: data.user.bio || undefined,
              } as User);
            } else {
              // API 호출 실패 시 기본 Auth 정보만 저장
              setUser({
                id: userData.user.id,
                email: userData.user.email || "",
                name:
                  userData.user.user_metadata?.name ||
                  userData.user.user_metadata?.full_name ||
                  "사용자",
                avatar: userData.user.user_metadata?.avatar_url,
              } as User);
            }
          } catch (apiError) {
            console.error("사용자 프로필 정보 가져오기 오류:", apiError);

            // API 호출 실패 시 기본 Auth 정보만 저장
            setUser({
              id: userData.user.id,
              email: userData.user.email || "",
              name:
                userData.user.user_metadata?.name ||
                userData.user.user_metadata?.full_name ||
                "사용자",
              avatar: userData.user.user_metadata?.avatar_url,
            } as User);
          }
        } else {
          setUser(null);
        }
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
      checkingRef.current = false;
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    // 마운트 시 한 번만 실행
    checkAuth();

    // Supabase 인증 상태 변경 이벤트 구독
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      // 상태 변경 이벤트가 있을 때만 checkAuth 호출
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        checkAuth();
      }
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
