import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getYoutubeVideoData,
  generateTimelineFromTranscript,
} from "@/lib/utils/youtube";

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
        timelineGroupsCount: videoData.timeline?.length || 0,
      })
    );

    // 타임라인이 없거나 충분하지 않은 경우 Gemini로 생성
    let timelineData = videoData.timeline || [];

    if (!timelineData || timelineData.length < 3) {
      console.log("타임라인이 없거나 불충분하여 Gemini로 생성 시도...");

      if (videoData.transcript && videoData.transcript.length > 100) {
        const generatedTimeline = await generateTimelineFromTranscript(
          videoData.transcript
        );

        if (generatedTimeline && generatedTimeline.length > 0) {
          console.log(
            `Gemini로 타임라인 ${generatedTimeline.length}개 생성 완료`
          );
          timelineData = generatedTimeline;
        }
      }
    }

    // 기본 비디오 정보 생성
    const videoInfo = {
      title: videoData.videoInfo?.title || "",
      description: videoData.videoInfo?.description || "",
      channelTitle: videoData.videoInfo?.channelTitle || "",
      publishedAt: videoData.videoInfo?.publishedAt || "",
      viewCount: "0",
      duration: videoData.videoInfo?.duration || "PT5M",
      channelId: "",
    };

    // videoData.videoInfo가 존재하는 경우
    if (videoData.videoInfo && typeof videoData.videoInfo === "object") {
      // channelId 설정
      if ("channelId" in videoData.videoInfo) {
        videoInfo.channelId = String(videoData.videoInfo.channelId || "");
      }

      // viewCount 설정
      if ("viewCount" in videoData.videoInfo) {
        const count = videoData.videoInfo.viewCount;
        videoInfo.viewCount = count ? String(count) : "0";
      }
    }

    console.log("추출된 비디오 정보:", JSON.stringify(videoInfo));

    // 성공 응답 반환 (타임라인 데이터 포함)
    return NextResponse.json({
      success: true,
      data: {
        videoInfo,
        transcript: videoData.transcript || "",
        timeline: timelineData,
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
