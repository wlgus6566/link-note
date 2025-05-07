"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";

interface SharedDigest {
  id: number;
  title: string;
  summary: string;
  content: string;
  sourceType: string;
  sourceUrl: string;
  createdAt: string;
}

export default function SharedPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<SharedDigest | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedDigest = async () => {
      if (!params.token) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/share?token=${params.token}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const result = await response.json();

        if (result.success) {
          setDigest(result.data.digest);
          setExpiresAt(result.data.expiresAt);
        } else {
          setError(result.error || "공유된 콘텐츠를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("공유 콘텐츠 로드 오류:", error);
        setError("공유된 콘텐츠를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDigest();
  }, [params.token]);

  // 원본 콘텐츠로 이동 (로그인 필요)
  const handleViewOriginal = () => {
    if (digest) {
      router.push(`/digest/${digest.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="공유된 콘텐츠" backUrl="/" showBackButton={true} />
        
        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-color mx-auto mb-4" />
            <p className="text-neutral-medium">공유된 콘텐츠를 불러오는 중...</p>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="오류" backUrl="/" showBackButton={true} />
        
        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="max-w-sm w-full bg-white p-8 space-y-6 text-center rounded-xl border border-border-line shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-neutral-dark">
              콘텐츠 로드 실패
            </h1>
            <p className="text-neutral-medium">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-color hover:bg-primary-color/90 text-white"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header 
        title={digest?.title || "공유된 콘텐츠"} 
        backUrl="/" 
        showBackButton={true}
      />

      <main className="flex-1">
        <div className="container px-5 py-6">
          {/* 공유 정보 배너 */}
          <div className="bg-primary-light rounded-lg p-4 mb-6 border border-primary-color/30">
            <p className="text-sm text-neutral-dark">
              이 콘텐츠는 공유 링크를 통해 접근하셨습니다.
              {expiresAt && (
                <span className="block mt-1 text-xs text-neutral-medium">
                  공유 링크 만료일: {new Date(expiresAt).toLocaleDateString()}
                </span>
              )}
            </p>
            {isAuthenticated && digest && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewOriginal}
                className="mt-2 w-full bg-white hover:bg-primary-light"
              >
                원본 콘텐츠 보기
              </Button>
            )}
            {!isAuthenticated && !authLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/login")}
                className="mt-2 w-full bg-white hover:bg-primary-light"
              >
                로그인하여 전체 콘텐츠 보기
              </Button>
            )}
          </div>

          {/* 콘텐츠 내용 */}
          {digest && (
            <>
              <div className="mb-6 p-5 bg-primary-light rounded-lg border-l-4 border-primary-color">
                <p className="text-base italic text-neutral-dark">
                  {digest.summary}
                </p>
              </div>

              <motion.div
                className="prose prose-blue prose-lg max-w-none mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                dangerouslySetInnerHTML={{ __html: digest.content }}
              />

              {/* 소스 정보 */}
              {digest.sourceType === "YouTube" && digest.sourceUrl && (
                <div className="mt-8 pt-6 border-t border-border-line">
                  <h3 className="text-lg font-semibold mb-2">원본 소스</h3>
                  <a
                    href={digest.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-color hover:underline flex items-center"
                  >
                    YouTube 영상 보기
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
