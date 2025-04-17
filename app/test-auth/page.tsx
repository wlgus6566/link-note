"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [cookiesText, setCookiesText] = useState<string>("");

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
        } else {
          setSession(data.session);
          if (document.cookie) {
            setCookiesText(document.cookie);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // API 요청 테스트
  const testApi = async () => {
    try {
      const response = await fetch("/api/timelines/test", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setApiResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 내 정보 API 테스트
  const testMeApi = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setApiResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Memo API 테스트
  const testMemoApi = async () => {
    try {
      const response = await fetch("/api/timelines/4/memo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memo: "테스트 메모" }),
        credentials: "include",
      });
      const data = await response.json();
      setApiResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">인증 테스트 페이지</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">세션 상태</h2>
            {session ? (
              <div>
                <p>로그인 됨</p>
                <p>사용자 ID: {session.user.id}</p>
                <p>이메일: {session.user.email}</p>
                <p>
                  세션 만료:{" "}
                  {new Date(session.expires_at * 1000).toLocaleString()}
                </p>
              </div>
            ) : (
              <p>로그인되지 않음</p>
            )}
          </div>

          {error && (
            <div className="p-4 border border-red-300 bg-red-50 rounded">
              <h2 className="text-lg font-semibold mb-2 text-red-700">오류</h2>
              <p>{error}</p>
            </div>
          )}

          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">쿠키 정보</h2>
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
              {cookiesText || "쿠키 없음"}
            </pre>
          </div>

          <div className="flex space-x-2">
            <Button onClick={testApi}>테스트 API 호출</Button>
            <Button onClick={testMeApi}>내 정보 API 테스트</Button>
            <Button onClick={testMemoApi}>메모 API 테스트</Button>
          </div>

          {apiResult && (
            <div className="p-4 border rounded">
              <h2 className="text-lg font-semibold mb-2">API 응답</h2>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
