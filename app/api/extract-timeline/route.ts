import { NextRequest, NextResponse } from "next/server";
import { getYoutubeVideoData } from "@/lib/utils/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // URL 파라미터에서 videoId 가져오기
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "비디오 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // YouTube URL 구성
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 타임라인 및 비디오 정보 가져오기x
    const result = await getYoutubeVideoData(youtubeUrl);
    console.log("타임라인", result);

    // videoInfo 객체에서 안전하게 속성 추출
    const videoInfo = result.videoInfo;

    // 타입 안전성을 위한 객체 생성
    const safeVideoInfo = {
      title: videoInfo.title || "",
      channelTitle: videoInfo.channelTitle || "",
      // TypeScript 이슈를 해결하기 위해 대체 접근법 사용
      channelId:
        typeof videoInfo === "object" && "channelId" in videoInfo
          ? String(videoInfo.channelId || "")
          : "",
      publishedAt: videoInfo.publishedAt || "",
      // viewCount도 안전하게 처리
      viewCount:
        typeof videoInfo === "object" && "viewCount" in videoInfo
          ? String(videoInfo.viewCount || "0")
          : "0",
    };

    return NextResponse.json({
      success: true,
      videoId,
      timeline: result.timeline,
      videoInfo: safeVideoInfo,
    });
  } catch (error) {
    console.error("타임라인 추출 API 오류:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "타임라인 추출에 실패했습니다",
      },
      { status: 500 }
    );
  }
}
