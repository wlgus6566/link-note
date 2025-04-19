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

    // 타임라인 및 비디오 정보 가져오기
    const result = await getYoutubeVideoData(youtubeUrl);

    return NextResponse.json({
      success: true,
      videoId,
      timeline: result.timeline,
      videoInfo: {
        title: result.videoInfo.title,
        channelTitle: result.videoInfo.channelTitle,
        channelId: result.videoInfo.channelId,
        publishedAt: result.videoInfo.publishedAt,
        viewCount: result.videoInfo.viewCount,
      },
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
