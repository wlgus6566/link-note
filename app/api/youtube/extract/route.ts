import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getYoutubeVideoData } from "@/lib/utils/youtube";

// 요청 스키마 정의
const requestSchema = z.object({
  url: z.string().url("유효한 URL이 아닙니다."),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();
    console.log("YouTube 추출 API 요청:", body);

    // 요청 검증
    const { url } = requestSchema.parse(body);
    console.log("추출할 YouTube URL:", url);

    // YouTube 비디오 데이터 추출
    console.log("YouTube 데이터 추출 시작...");
    const videoData = await getYoutubeVideoData(url);
    console.log(
      "YouTube 데이터 추출 완료:",
      JSON.stringify({
        videoId: videoData.videoId,
        hasVideoInfo: !!videoData.videoInfo,
        transcriptLength: videoData.transcript?.length || 0,
      })
    );

    // 비디오 정보 추출 부분
    const videoInfo = {
      title: videoData.videoInfo?.title || "",
      description: videoData.videoInfo?.description || "",
      channelId: videoData.videoInfo?.channelId || "",
      channelTitle: videoData.videoInfo?.channelTitle || "",
      publishedAt: videoData.videoInfo?.publishedAt || "",
      viewCount: videoData.videoInfo?.viewCount || "0",
      duration: videoData.videoInfo?.duration || "PT5M", // ISO 8601 형식의 동영상 길이
    };

    console.log("추출된 비디오 정보:", JSON.stringify(videoInfo));

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        videoInfo,
        transcript: videoData.transcript || "",
      },
    });
  } catch (error) {
    console.error("YouTube 데이터 추출 API 에러:", error);

    // 에러 응답 반환
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 400 }
    );
  }
}
