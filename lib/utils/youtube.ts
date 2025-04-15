import { google } from "googleapis";
// 기존 import 방식 제거
// import { YoutubeTranscript } from "youtube-transcript-api";
// CommonJS 방식으로 불러오기
// import * as YoutubeTranscriptApi from "youtube-transcript-api";
// youtube-captions-scraper 사용
import { getSubtitles } from "youtube-captions-scraper";
import { z } from "zod";

// 시간(초)를 mm:ss 형식으로 변환하는 함수
export function secondsToTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

// 자막 타임라인 타입 정의
export interface SubtitleItem {
  start: string;
  end: string;
  text: string;
  startSeconds: number;
}

export interface TimelineGroup {
  range: string;
  subtitles: SubtitleItem[];
}

// 자막을 5분 단위로 그룹화하는 함수
export function createSubtitleTimeline(captions: any[]): TimelineGroup[] {
  if (!captions || captions.length === 0) {
    return [];
  }

  const TIMELINE_SECONDS = 5 * 60; // 300초 (5분)
  const timelineMap: Record<string, SubtitleItem[]> = {};

  captions.forEach((caption) => {
    const startSeconds = caption.start || 0;
    const duration = caption.dur || caption.duration || 2; // 기본 지속 시간 2초

    const groupIndex = Math.floor(startSeconds / TIMELINE_SECONDS);
    const startTime = groupIndex * TIMELINE_SECONDS;
    const endTime = startTime + TIMELINE_SECONDS;

    const rangeLabel = `${secondsToTimestamp(startTime)} - ${secondsToTimestamp(
      endTime
    )}`;

    if (!timelineMap[rangeLabel]) {
      timelineMap[rangeLabel] = [];
    }

    timelineMap[rangeLabel].push({
      start: secondsToTimestamp(startSeconds),
      end: secondsToTimestamp(startSeconds + duration),
      startSeconds: startSeconds,
      text: caption.text,
    });
  });

  // 객체를 배열로 변환하고 시간순으로 정렬
  return Object.entries(timelineMap)
    .map(([range, subtitles]) => ({
      range,
      subtitles: subtitles.sort((a, b) => a.startSeconds - b.startSeconds),
    }))
    .sort((a, b) => {
      // 시간대 시작 부분으로 정렬
      const aStart = a.range.split(" - ")[0];
      const bStart = b.range.split(" - ")[0];
      return aStart.localeCompare(bStart);
    });
}

// YouTube URL에서 비디오 ID 추출
export function getVideoId(url: string): string | null {
  const urlSchema = z.string().url();

  try {
    urlSchema.parse(url);

    // YouTube URL 패턴 분석
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// YouTube API를 사용하여 비디오 정보 가져오기
export async function getVideoInfo(videoId: string) {
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails", "statistics"],
      id: [videoId],
    });

    const video = response.data.items?.[0];

    if (!video) {
      throw new Error("비디오를 찾을 수 없습니다.");
    }

    return {
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      publishedAt: video.snippet?.publishedAt,
      channelTitle: video.snippet?.channelTitle,
      channelId: video.snippet?.channelId,
      thumbnails: video.snippet?.thumbnails,
      duration: video.contentDetails?.duration,
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
    };
  } catch (error) {
    console.error("YouTube API 에러:", error);
    throw new Error("비디오 정보를 가져오는 중 오류가 발생했습니다.");
  }
}

// 비디오의 자막 가져오기
export async function getVideoTranscript(videoId: string) {
  try {
    // youtube-captions-scraper 사용하여 자막 가져오기
    const captions = await getSubtitles({
      videoID: videoId,
      lang: "ko", // 한국어 자막 시도
    }).catch(() => {
      // 한국어 자막이 없으면 영어로 시도
      return getSubtitles({
        videoID: videoId,
        lang: "en", // 영어 자막
      });
    });

    // 자막 텍스트만 추출하여 문자열로 결합
    const transcriptText = captions.map((item) => item.text).join(" ");

    return {
      transcriptText,
      captions,
    };
  } catch (error) {
    console.error("자막 추출 에러:", error);
    throw new Error("비디오 자막을 가져오는 중 오류가 발생했습니다.");
  }
}

// YouTube 영상 모든 데이터 가져오기 (통합 함수)
export async function getYoutubeVideoData(url: string) {
  console.log("getYoutubeVideoData 함수 호출됨, URL:", url);

  const videoId = getVideoId(url);
  console.log("추출된 비디오 ID:", videoId);

  if (!videoId) {
    console.error("유효한 YouTube URL이 아닙니다:", url);
    throw new Error("유효한 YouTube URL이 아닙니다.");
  }

  try {
    console.log("비디오 정보 및 자막 가져오기 시작...");

    // 비디오 정보와 자막을 병렬로 가져오지만, 각각에 대한 오류 처리 개선
    let videoInfo;
    let transcript = "자막을 찾을 수 없습니다.";
    let rawCaptions = [];

    try {
      videoInfo = await getVideoInfo(videoId);
      console.log(
        "비디오 정보 가져오기 성공:",
        JSON.stringify({
          id: videoInfo.id,
          title: videoInfo.title?.substring(0, 30) + "...",
          duration: videoInfo.duration,
        })
      );
    } catch (videoError) {
      console.error("비디오 정보 가져오기 실패:", videoError);
      videoInfo = {
        id: videoId,
        title: "제목을 가져올 수 없습니다",
        description: "",
        publishedAt: new Date().toISOString(),
        channelTitle: "채널 정보 없음",
        duration: "PT5M", // 기본 5분 설정
      };
    }

    try {
      // 자막 및 원시 캡션 데이터 가져오기
      const captionResult = await getVideoTranscript(videoId);
      transcript = captionResult.transcriptText;
      rawCaptions = captionResult.captions;
      console.log("자막 가져오기 성공, 길이:", transcript.length);
    } catch (transcriptError) {
      console.error("자막 가져오기 실패:", transcriptError);
    }

    // 타임라인 생성
    const timeline = createSubtitleTimeline(rawCaptions);
    console.log(`타임라인 그룹 생성 완료: ${timeline.length}개 그룹`);

    const result = {
      videoId,
      videoInfo,
      transcript,
      timeline,
    };

    console.log("YouTube 데이터 추출 완료");
    return result;
  } catch (error) {
    console.error("YouTube 데이터 추출 치명적 오류:", error);
    // 최소한의 데이터라도 반환하여 애플리케이션이 계속 작동하도록 함
    return {
      videoId,
      videoInfo: {
        id: videoId,
        title: "제목을 가져올 수 없습니다",
        description: "",
        publishedAt: new Date().toISOString(),
        channelTitle: "채널 정보 없음",
        duration: "PT5M", // 기본 5분 설정
      },
      transcript:
        "자막을 가져올 수 없습니다. 요약의 정확도가 낮을 수 있습니다.",
      timeline: [],
    };
  }
}
