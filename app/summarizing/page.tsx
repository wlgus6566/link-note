"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";

// 타입 정의 추가
interface ProcessState {
  isProcessing: boolean;
  currentUrl: string | null;
}

// 컴포넌트 외부에 전역 변수로 처리 상태 추적
const processState: ProcessState = {
  isProcessing: false,
  currentUrl: null,
};

export default function SummarizingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedReadTime, setEstimatedReadTime] =
    useState<string>("예상 시간 계산 중...");

  // API 호출 시작했는지 추적하는 상태 추가
  const [processingStarted, setProcessingStarted] = useState(false);

  // useRef는 컴포넌트 최상위 레벨에서 호출해야 함
  const processedUrlRef = useRef<string | null>(null);

  const steps = [
    "링크 분석 중...",
    "콘텐츠 추출 중...",
    "핵심 내용 요약 중...",
    "태그 생성 중...",
    "이미지 추출 중...",
    "요약 완료!",
  ];

  // 컴포넌트 마운트 시 초기화 로직
  useEffect(() => {
    console.log("컴포넌트 마운트: URL =", url);

    // 처리가 시작되었는지 확인하는 함수
    const checkAndStartProcessing = () => {
      // 이전에 이미 처리한 URL과 동일하면 중복 처리 방지
      if (processedUrlRef.current === url) {
        console.log("이미 처리 완료된 URL입니다:", url);
        return;
      }

      if (!url) {
        router.push("/");
        return;
      }

      // 이미 동일한 URL에 대한 처리가 진행 중이면 중복 호출 방지
      if (processState.isProcessing && processState.currentUrl === url) {
        console.log("이미 처리 중인 URL입니다:", url);
        return;
      }

      // 이미 처리가 시작되었으면 중복 실행 방지
      if (processingStarted) {
        console.log("이미 프로세스가 시작되었습니다.");
        return;
      }

      // 새 프로세스 시작 표시
      setProcessingStarted(true);
      console.log("프로세스 시작 플래그 설정");

      // 새 프로세스 초기화
      processState.isProcessing = true;
      processState.currentUrl = url;

      // 현재 URL을 처리 완료된 URL로 기록
      processedUrlRef.current = url;

      console.log("fetchAndSummarize 함수 호출 예정");

      // 약간의 지연 후 처리 시작 (React 18 이중 렌더링 이슈 방지)
      const timeoutId = setTimeout(() => {
        console.log("fetchAndSummarize 실행");
        fetchAndSummarize();
      }, 300);

      // 컴포넌트 언마운트 시 타이머 정리
      return () => clearTimeout(timeoutId);
    };

    // 확인 및 시작
    checkAndStartProcessing();

    // 클린업 함수
    return () => {
      console.log("컴포넌트 언마운트 또는 의존성 변경");
    };
  }, [url, router]); // processingStarted는 의존성에서 제거하여 무한 루프 방지

  const fetchAndSummarize = async () => {
    console.log("fetchAndSummarize 함수 내부 시작");

    try {
      if (!url) {
        console.error("URL이 없습니다");
        setError("유효한 URL이 필요합니다");
        return;
      }

      // 1단계: 링크 분석
      setCurrentStep(0);
      setProgress(10);

      // 2단계: YouTube 데이터 추출
      setCurrentStep(1);
      setProgress(20);

      console.log("YouTube 데이터 추출 시작");
      const extractResponse = await fetch("/api/youtube/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const extractData = await extractResponse.json();

      if (extractData.success) {
        console.log("YouTube 영상 데이터 추출 완료");

        // 타임라인 데이터 처리
        if (
          extractData.data?.timeline &&
          extractData.data.timeline.length > 0
        ) {
          console.log(
            `타임라인 데이터 추출 완료: ${extractData.data.timeline.length}개 항목`
          );

          // 타임라인 데이터를 로컬 스토리지에 저장할 때는 저장 시점의 URL을 키로 사용
          // 나중에 다이제스트 ID를 키로 변경
          try {
            localStorage.setItem(
              `timeline_temp_${encodeURIComponent(url)}`,
              JSON.stringify(extractData.data.timeline)
            );
            console.log("타임라인 데이터 임시 저장 완료");
          } catch (storageError) {
            console.error(
              "타임라인 데이터 로컬 스토리지 저장 오류:",
              storageError
            );
            // 오류가 발생해도 계속 진행
          }
        } else {
          console.log("타임라인 데이터가 없거나 충분하지 않습니다.");
        }

        // API 응답 구조에서 videoInfo와 transcript 추출 - 타입 안전성 확보
        const videoInfo = extractData.data?.videoInfo || {
          title: "제목 정보 없음",
          description: "",
          channelTitle: "채널 정보 없음",
          publishedAt: new Date().toISOString(),
        };

        const transcript =
          extractData.data?.transcript || "자막 정보가 없습니다.";
        console.log("추출된 데이터 확인:", {
          "videoInfo 확인": !!videoInfo,
          "videoInfo 제목": videoInfo.title?.substring(0, 30),
          "transcript 길이": transcript.length,
        });

        // 자막 길이에 따라 예상 읽기 시간 설정
        const transcriptLength = transcript.length;
        if (transcriptLength > 10000) {
          setEstimatedReadTime("약 7-10분 소요");
        } else if (transcriptLength > 5000) {
          setEstimatedReadTime("약 5-7분 소요");
        } else if (transcriptLength > 2000) {
          setEstimatedReadTime("약 3-5분 소요");
        } else {
          setEstimatedReadTime("약 2-3분 소요");
        }

        setProgress(40);

        // 3단계: AI 요약 생성
        setCurrentStep(2);

        console.log("AI 요약 생성 시작");
        const summarizeResponse = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoInfo: {
              title: videoInfo.title,
              description: videoInfo.description,
              channelTitle: videoInfo.channelTitle,
              publishedAt: videoInfo.publishedAt,
            },
            transcript,
            sourceUrl: url,
          }),
        });

        const summarizeData = await summarizeResponse.json();

        if (!summarizeData.success) {
          throw new Error(
            summarizeData.error || "AI 요약 생성에 실패했습니다."
          );
        }
        console.log("AI 요약 생성 완료");

        // 4단계: 태그 생성 중
        setCurrentStep(3);
        setProgress(70);

        // 5단계: 이미지 추출 중
        setCurrentStep(4);
        setProgress(85);

        // 6단계: 요약 저장 및 완료
        setCurrentStep(5);

        console.log("요약 저장 시작");
        const saveResponse = await fetch("/api/digest/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...summarizeData.data,
            sourceUrl: url,
            sourceType: "YouTube",
            // YouTube 영상 정보도 함께 저장
            videoInfo: {
              channelId: videoInfo.channelId,
              channelTitle: videoInfo.channelTitle,
              publishedAt: videoInfo.publishedAt,
              viewCount: videoInfo.viewCount,
              description: videoInfo.description,
              title: videoInfo.title,
              duration: videoInfo.duration,
            },
          }),
        });

        const saveData = await saveResponse.json();
        console.log("저장 API 응답 데이터:", JSON.stringify(saveData));

        if (!saveData.success) {
          throw new Error(saveData.error || "요약 저장에 실패했습니다.");
        }
        console.log("요약 저장 완료");

        setProgress(100);
        setIsComplete(true);

        // 저장된 다이제스트 ID 저장
        const digestId = saveData.digest?.[0]?.id || saveData.digest?.id;
        console.log("이동할 다이제스트 ID:", digestId);

        // 타임라인 데이터 키 업데이트
        if (digestId) {
          try {
            const tempTimelineKey = `timeline_temp_${encodeURIComponent(url)}`;
            const timelineData = localStorage.getItem(tempTimelineKey);

            if (timelineData) {
              // 새 키로 저장
              localStorage.setItem(`timeline_${digestId}`, timelineData);
              // 임시 데이터 삭제
              localStorage.removeItem(tempTimelineKey);
              console.log("타임라인 데이터 키 업데이트 완료:", digestId);
            }
          } catch (storageError) {
            console.error("로컬 스토리지 업데이트 오류:", storageError);
            // 오류가 발생해도 계속 진행
          }
        }

        // 현재 타임스탬프 로깅
        const timestamp = new Date().toISOString();
        console.log(
          `[${timestamp}] 다이제스트 저장 완료, 페이지 이동 준비 중...`
        );

        // 프로세스 상태 초기화
        processState.isProcessing = false;
        setProcessingStarted(false);

        // 페이지 이동
        console.log(`다이제스트 페이지로 이동: /digest/${digestId}`);
        router.push(`/digest/${digestId}`);
      } else {
        throw new Error(extractData.error || "YouTube 데이터 추출 실패");
      }
    } catch (error) {
      console.error("요약 과정 에러:", error);
      setError(
        error instanceof Error
          ? error.message
          : "요약 생성 중 오류가 발생했습니다."
      );
      // 에러 발생 시 처리 플래그 리셋
      processState.isProcessing = false;
      setProcessingStarted(false);
    }
  };

  // 에러 발생 시 UI
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button variant="ghost" size="sm" className="p-0" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="text-sm font-medium">오류 발생</div>
            <div className="w-5"></div>
          </div>
        </header>

        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">요약 생성 실패</h1>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => {
                // 다시 시도 시 처리 플래그 리셋
                processState.isProcessing = false;
                setProcessingStarted(false);
                router.push("/");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              다시 시도하기
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-5">
          <Button variant="ghost" size="sm" className="p-0" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="text-sm font-medium">콘텐츠 요약</div>
          <div className="w-5"></div>
        </div>
      </header>

      <main className="flex-1 container px-5 py-8">
        <div className="max-w-md mx-auto">
          {/* 링크 정보 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
            <Link2 className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 break-all">{url}</div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{estimatedReadTime}</span>
              </div>
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">{steps[currentStep]}</div>
              <div className="text-sm text-gray-500">{progress}%</div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 콘텐츠 스켈레톤 UI */}
          <div className="space-y-6">
            {/* 제목 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>

            {/* 태그 스켈레톤 */}
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            {/* 본문 스켈레톤 */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full my-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
