import { google } from "googleapis";
import { getSubtitles } from "youtube-captions-scraper";
import { z } from "zod";
import pMap from "p-map";
import { log } from "console";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationServiceClient } from "@google-cloud/translate";

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
  subtitles: SubtitleItem[]; // 신구조
  translatedSubtitles?: SubtitleItem[]; // 번역된 자막 추가
  items?: {
    // 구구조 호환
    id: string;
    seconds: number;
    text: string;
  }[];
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

    const allSubtitles: SubtitleItem[] = captions.map((caption) => {
      const startSeconds = parseFloat(caption.start.toString());
      const duration = parseFloat(caption.dur.toString() || "2");
      return {
        start: secondsToTimestamp(startSeconds),
        end: secondsToTimestamp(startSeconds + duration),
        startSeconds,
        text: caption.text,
      };
    });

    // 자막을 15개씩 묶어서 문단으로 만드는 함수 호출
    const groupedParagraphs = groupSubtitlesIntoParagraphs(allSubtitles, {
      filterEmpty: true,
    });
    return {
      transcriptText,
      captions,
      groupedParagraphs,
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
    let rawCaptions: Array<any> = [];

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

// 타임라인 아이템 타입 정의
export interface TimelineItem {
  start: string;
  title: string;
}

// 타임라인 그룹 타입 정의
export interface TimelineGroup {
  range: string;
  subtitles: {
    start: string;
    end: string;
    startSeconds: number;
    text: string;
  }[];
}

// Gemini API를 사용하여 자막에서 타임라인 생성
export async function generateTimelineFromTranscript(
  transcript: string
): Promise<TimelineGroup[]> {
  try {
    // 자막이 없거나 너무 짧으면 타임라인 생성 불가
    if (!transcript || transcript.length < 100) {
      console.log("자막이 너무 짧아 타임라인 생성 불가");
      return [];
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 타임라인 생성 프롬프트
    const timelinePrompt = `
다음은 유튜브 영상 자막 전체입니다. 이 자막을 분석하여 영상의 주제 흐름을 기준으로 타임라인(챕터)을 생성해주세요.

🧠 요청사항:
- 타임라인 개수는 **영상의 길이나 주제 흐름에 따라 유동적으로** 결정해주세요. (3~7개 정도가 이상적)
- 각 타임라인은 다음 속성을 포함해야 합니다:
  - "start": 시작 시간 (형식: mm:ss)
  - "title": 해당 구간의 제목
- 각 타이틀은 내용을 **요약하거나 유저가 클릭하고 싶게 만드는 제목**으로 작성해주세요.
- 결과는 아래와 같은 형식의 **JSON 배열**로 출력해주세요.

예시 출력:
[
  { "start": "00:00", "title": "영상 소개 및 인트로" },
  { "start": "02:15", "title": "챗GPT란 무엇인가?" },
  { "start": "06:30", "title": "실제 사용 사례들" },
  { "start": "10:00", "title": "마무리 및 요약" }
]

아래는 자막입니다:
${transcript}
`;

    console.log("Gemini API 호출 시작");
    const result = await model.generateContent(timelinePrompt);
    const response = await result.response.text();
    console.log("Gemini API 응답 수신");

    try {
      // JSON 부분 추출
      const jsonStart = response.indexOf("[");
      const jsonEnd = response.lastIndexOf("]");

      // JSON이 없으면 빈 배열 반환
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Gemini 응답에서 JSON을 찾을 수 없습니다:", response);
        return [];
      }

      const jsonString = response.slice(jsonStart, jsonEnd + 1);
      const timelineItems: TimelineItem[] = JSON.parse(jsonString);

      // 타임라인 아이템을 타임라인 그룹으로 변환
      return convertToTimelineGroups(timelineItems);
    } catch (error) {
      console.error("Gemini 응답 파싱 실패:", response, error);
      return [];
    }
  } catch (error) {
    console.error("타임라인 생성 중 오류 발생:", error);
    return [];
  }
}

// TimelineItem 배열을 TimelineGroup 배열로 변환하는 함수
export function convertToTimelineGroups(
  items: TimelineItem[]
): TimelineGroup[] {
  if (!items || items.length === 0) return [];

  const toSeconds = (mmss: string): number => {
    const parts = mmss.split(":");
    if (parts.length === 2) {
      const [min, sec] = parts.map(Number);
      return min * 60 + sec;
    } else if (parts.length === 3) {
      const [hours, min, sec] = parts.map(Number);
      return hours * 3600 + min * 60 + sec;
    }
    return 0;
  };

  // 5분(300초) 단위로 그룹화하기 위한 새로운 맵 생성
  const TIMELINE_SECONDS = 5 * 60; // 300초 (5분)
  const timelineMap: Record<string, SubtitleItem[]> = {};

  // LLM 생성 타임라인 아이템을 순회하며 5분 단위로 그룹화
  items.forEach((item, index) => {
    const startSeconds = toSeconds(item.start);
    // 다음 아이템의 시작 시간 또는 현재 + 3분
    const nextStartSec =
      index + 1 < items.length
        ? toSeconds(items[index + 1].start)
        : startSeconds + 180;

    // 5분 단위 그룹 인덱스 계산
    const groupIndex = Math.floor(startSeconds / TIMELINE_SECONDS);
    const groupStartTime = groupIndex * TIMELINE_SECONDS;
    const groupEndTime = groupStartTime + TIMELINE_SECONDS;

    // 그룹 레이블 생성
    const rangeLabel = `${secondsToTimestamp(
      groupStartTime
    )} - ${secondsToTimestamp(groupEndTime)}`;

    // 그룹이 없으면 생성
    if (!timelineMap[rangeLabel]) {
      timelineMap[rangeLabel] = [];
    }

    // 현재 타임라인 아이템을 해당 그룹에 추가
    timelineMap[rangeLabel].push({
      start: item.start,
      end: secondsToTimestamp(nextStartSec),
      startSeconds: startSeconds,
      text: item.title,
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

function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

// 1. 자막을 최대 글자 수 기준으로 나누는 함수
function splitSubtitlesByLength(
  subtitles: SubtitleItem[],
  maxChars: number = 5000
): SubtitleItem[][] {
  const batches: SubtitleItem[][] = [];
  let currentBatch: SubtitleItem[] = [];
  let currentLength = 0;

  for (const subtitle of subtitles) {
    const line = subtitle.text || "";
    const lineLength = line.length + 1; // 줄바꿈 포함

    if (currentLength + lineLength > maxChars && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLength = 0;
    }

    currentBatch.push(subtitle);
    currentLength += lineLength;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

export async function translateAllSubtitlesSmart(
  subtitles: SubtitleItem[],
  targetLanguage: string = "ko",
  depth: number = 0
): Promise<SubtitleItem[]> {
  if (!subtitles || subtitles.length === 0) return [];

  if (depth > 3) {
    console.warn("❗ 최대 재시도 횟수 초과로 원본 반환");
    return subtitles;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 태그 포함 길이 기준으로 자막 분할
  const batches = splitSubtitlesByLength(subtitles, 5000);
  console.log(`📦 총 ${batches.length}개 배치로 분할 (depth: ${depth})`);

  const translatedBatches = await pMap(
    batches,
    async (batch, batchIndex) => {
      const inputText = batch.map((s) => s.text || "").join("\n");

      const prompt = `다음 자막들을 '${targetLanguage}' 언어로 자연스럽고 존댓말 스타일로 번역해주세요.
한 줄에 하나의 자막이 있으며, 출력도 동일하게 줄바꿈 기준으로 맞춰주세요.
자막 순서는 변경하지 마세요.
빈 줄이 있다면 그대로 비워두세요.

${inputText}`;

      try {
        console.log(`🚀 배치 ${batchIndex + 1}번 번역 시작`);
        const result = await model.generateContent(prompt);
        const translatedText = await result.response.text();
        console.log(`✅ 배치 ${batchIndex + 1}번 번역 완료`);

        const translatedLines = translatedText.split("\n");

        const translatedSubtitles: SubtitleItem[] = batch.map(
          (original, idx) => ({
            ...original,
            text: (translatedLines[idx] || "").trim(),
          })
        );

        return translatedSubtitles;
      } catch (error) {
        console.error(`❌ 배치 ${batchIndex + 1}번 번역 실패`, error);

        if (batch.length > 5) {
          console.log(`🔁 재시도: 배치 ${batchIndex + 1}을 분할`);
          const half = Math.ceil(batch.length / 2);
          const first = await translateAllSubtitlesSmart(
            batch.slice(0, half),
            targetLanguage,
            depth + 1
          );
          const second = await translateAllSubtitlesSmart(
            batch.slice(half),
            targetLanguage,
            depth + 1
          );
          return [...first, ...second];
        }

        return batch;
      }
    },
    { concurrency: 3 }
  );

  const result = translatedBatches.flat();

  const translatedCount = result.filter(
    (item) => item.text !== subtitles.find((s) => s.start === item.start)?.text
  ).length;

  console.log(
    `📊 번역 완료: ${translatedCount}/${result.length}개 자막 (${Math.round(
      (translatedCount / result.length) * 100
    )}%)`
  );

  return result;
}

export async function translateAllSubtitlesOnce(
  subtitles: SubtitleItem[],
  targetLanguage: string = "ko"
): Promise<SubtitleItem[]> {
  if (!subtitles || subtitles.length === 0) return [];

  // Google Cloud Translation API 클라이언트 초기화
  const translationClient = new TranslationServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
  const location = "global";

  // Gemini AI 초기화
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  console.log(
    `🔄 총 ${subtitles.length}개 자막 번역 시작 (2단계 번역 프로세스)`
  );

  try {
    // 1단계: Google Cloud Translation API를 통한 기계 번역
    console.log(`🔄 1단계: Google Cloud Translation API를 통한 번역 시작`);

    // 번역할 텍스트 배열 준비
    const textsToTranslate = subtitles.map((s) => s.text || "");

    console.log(
      `🔠 Google Cloud Translation API 요청 시작 (총 ${textsToTranslate.length}개 자막)`
    );

    // 한 번의 API 호출로 모든 자막 번역
    const [response] = await translationClient.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: textsToTranslate,
      mimeType: "text/plain",
      sourceLanguageCode: "en", // 원본 언어 (자동 감지도 가능)
      targetLanguageCode: targetLanguage,
    });

    console.log(`✅ Translation API 1차 번역 완료`);

    // 1차 번역 결과 매핑
    const firstTranslated: SubtitleItem[] = subtitles.map((original, index) => {
      const translatedText =
        response.translations?.[index]?.translatedText || original.text;
      return {
        ...original,
        text: translatedText,
      };
    });

    // 2단계: Gemini를 통한 번역 정제 - 모든 자막을 한 번에 처리
    console.log(`🔄 2단계: Gemini AI를 통한 번역 개선 시작 (단일 요청)`);

    try {
      // 모든 자막에 태그 부여
      const allSubtitlesWithTags = firstTranslated
        .map((s, idx) => `<subtitle id="${idx + 1}">${s.text}</subtitle>`)
        .join("\n");

      const prompt = `
 
        
        형식:
        - 각 자막은 <subtitle id="숫자">번역문</subtitle> 형태로 출력합니다.
        - 태그('<subtitle>', 'id')는 절대 변경하지 않습니다.
        - 모든 자막을 처리해주세요.
        
        === 자막 목록 ===
        ${allSubtitlesWithTags}
      `;

      const result = await model.generateContent(prompt);
      const refinedText = await result.response.text();
      console.log(`✅ Gemini AI 번역 개선 완료 (단일 요청)`);

      // 개선된 번역 결과 파싱
      const refinedSubtitles: SubtitleItem[] = [];

      for (let i = 0; i < firstTranslated.length; i++) {
        const original = firstTranslated[i];
        const tagPattern = new RegExp(
          `<subtitle id="${i + 1}">(.*?)</subtitle>`,
          "s"
        );
        const match = refinedText.match(tagPattern);

        if (match && match[1] !== undefined) {
          refinedSubtitles.push({
            ...original,
            text: match[1].trim(),
          });
        } else {
          // 태그를 찾지 못했다면 1차 번역 결과 유지
          console.log(`⚠️ 자막 ${i + 1} 태그 못찾음, 1차 번역 유지`);
          refinedSubtitles.push(original);
        }
      }

      console.log(`🎉 총 ${refinedSubtitles.length}개 자막 2단계 번역 완료`);

      // 번역 성공률 계산
      const emptyTranslated = refinedSubtitles.filter(
        (s) => !s.text || !s.text.trim()
      ).length;
      const translationSuccessRate =
        ((refinedSubtitles.length - emptyTranslated) /
          refinedSubtitles.length) *
        100;
      console.log(
        `📊 번역 성공률: ${translationSuccessRate.toFixed(
          2
        )}% (빈 자막: ${emptyTranslated}개)`
      );

      return refinedSubtitles;
    } catch (error) {
      console.error(`❌ Gemini 번역 개선 실패:`, error);
      // Gemini 실패 시 1차 번역 결과 사용
      console.log(`⚠️ Gemini 실패로 1차 번역 결과 반환`);
      return firstTranslated;
    }
  } catch (error) {
    console.error(`❌ 번역 프로세스 실패:`, error);
    // 오류 발생 시 원본 자막 사용
    console.log(`⚠️ 오류 발생으로 원본 자막 반환`);
    return subtitles;
  }
}

/**
 * 번역된 자막을 10자막 단위로 묶어서 반환하는 함수
 * @param translatedSubtitles 번역된 자막 배열
 * @param options 옵션 (filterEmpty: 빈 자막 필터링 여부)
 * @returns 10자막 단위로 묶인 배열 - { index, start, text } 형태
 */
export function groupSubtitlesIntoParagraphs(
  translatedSubtitles: SubtitleItem[],
  options: { filterEmpty?: boolean } = {}
): { index: number; start: string; text: string }[] {
  if (!translatedSubtitles || translatedSubtitles.length === 0) {
    return [];
  }

  const { filterEmpty = false } = options;

  // 필터링 여부에 따라 자막 선택
  let subtitlesToProcess = translatedSubtitles;
  if (filterEmpty) {
    subtitlesToProcess = translatedSubtitles.filter(
      (s) => s.text && s.text.trim().length > 0
    );
    console.log(
      `🧹 문단화 전 빈 자막 필터링: ${translatedSubtitles.length}개 → ${subtitlesToProcess.length}개`
    );
  }

  // 시간 순서대로 정렬
  const sortedSubtitles = [...subtitlesToProcess].sort(
    (a, b) => Number(a.startSeconds) - Number(b.startSeconds)
  );

  console.log(`📊 자막 정렬 완료: 총 ${sortedSubtitles.length}개 자막`);
  console.log(
    `🕒 첫 자막 시간: ${sortedSubtitles[0]?.start}, 마지막 자막 시간: ${
      sortedSubtitles[sortedSubtitles.length - 1]?.start
    }`
  );

  // 10개씩 자막 묶기
  const batches = splitIntoBatches(sortedSubtitles, 10);
  console.log(`📦 생성된 배치 수: ${batches.length}개`);

  // 각 배치를 한 문단으로 처리
  const paragraphs = batches.map((batch, index) => {
    // 배치의 첫 번째 자막의 시작 시간 사용
    const firstSubtitle = batch[0];
    const startTime = firstSubtitle ? firstSubtitle.start : "00:00";

    // 각 자막의 텍스트 합치기 (비어있지 않은 경우만)
    const nonEmptyTexts = batch
      .filter((subtitle) => subtitle.text && subtitle.text.trim().length > 0)
      .map((subtitle) => subtitle.text.trim());

    const batchText = nonEmptyTexts.join(" ");

    // 해당 배치의 자막 수와 내용 있는 자막 수 로깅 (첫 배치와 마지막 배치만)
    if (index === 0 || index === batches.length - 1) {
      console.log(
        `📝 배치 ${index + 1}: 총 ${batch.length}개 자막 중 내용 있는 자막 ${
          nonEmptyTexts.length
        }개`
      );
    }

    return {
      index: index + 1,
      start: startTime,
      text: batchText || "(자막 없음)", // 빈 문단이면 기본 텍스트 제공
    };
  });

  console.log(`✅ 문단 생성 완료: ${paragraphs.length}개 문단`);
  console.log(
    `🕒 첫 문단 시간: ${paragraphs[0]?.start}, 마지막 문단 시간: ${
      paragraphs[paragraphs.length - 1]?.start
    }`
  );

  return paragraphs;
}

export function splitParagraphsWithIndexByCharLength(
  paragraphs: string[],
  maxChars: number = 4000
): { indices: number[]; values: string[] }[] {
  const batches: { indices: number[]; values: string[] }[] = [];
  let currentBatch: string[] = [];
  let currentIndices: number[] = [];
  let currentLength = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i] || "";
    const length = text.length + 1;

    if (currentLength + length > maxChars && currentBatch.length > 0) {
      batches.push({ indices: currentIndices, values: currentBatch });
      currentBatch = [];
      currentIndices = [];
      currentLength = 0;
    }

    currentBatch.push(text);
    currentIndices.push(i);
    currentLength += length;
  }

  if (currentBatch.length > 0) {
    batches.push({ indices: currentIndices, values: currentBatch });
  }

  return batches;
}

export async function translateParagraphs(
  paragraphs: string[],
  targetLanguage: string = "ko",
  maxRetries: number = 1
): Promise<string[]> {
  if (!paragraphs || paragraphs.length === 0) return [];

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const batches = splitParagraphsWithIndexByCharLength(paragraphs, 3500);
  const results = Array(paragraphs.length).fill(null);
  let apiCallCount = 0;

  console.log(
    `🚀 총 ${paragraphs.length}개 문단 → ${batches.length}개 배치로 분할 (목표 언어: ${targetLanguage})`
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const { indices: currentBatchIndices, values: batchParagraphs } =
      batches[batchIndex];

    let attempt = 0;
    let success = false;

    while (attempt <= maxRetries && !success) {
      attempt++;

      const taggedBatch = batchParagraphs
        .map((text, i) => `<p id="${currentBatchIndices[i]}">${text || ""}</p>`)
        .join("\n");

      console.log("Tagged batch:\n", taggedBatch);

      let prompt = "";
      // 지원 언어 목록 정의 (ai.ts와 동일하게 확장)
      const supportedLanguages: { [key: string]: string } = {
        ko: "한국어", // 한국어는 프롬프트가 다르므로 여기에선 이름만 정의
        en: "English",
        ja: "Japanese",
        zh: "Chinese",
        es: "Spanish",
        fr: "French",
        de: "German",
        pt: "Portuguese",
        ru: "Russian",
        hi: "Hindi",
        ar: "Arabic",
        it: "Italian",
        tr: "Turkish",
        vi: "Vietnamese",
        th: "Thai",
        id: "Indonesian",
        nl: "Dutch",
        pl: "Polish",
        sv: "Swedish",
        el: "Greek",
        // 필요에 따라 더 많은 언어 추가 가능
      };

      if (targetLanguage === "ko") {
        prompt = `다음 문단들을 한국어(ko)로 자연스럽고 존댓말 스타일로 번역해주세요.
각 문단은 <p id="숫자">내용</p> 형식입니다.
번역 결과도 동일한 형식 <p id="숫자">번역된 내용</p> 으로 반환해주세요. 순서는 바꾸지 마세요.

${taggedBatch}`;
      } else {
        const languageName =
          supportedLanguages[targetLanguage] || targetLanguage;
        prompt = `Translate the following paragraphs into ${languageName} (${targetLanguage}).
Each paragraph is tagged like <p id="number">content</p>.
Return the translation in the exact same format, preserving the tags and order: <p id="number">translated content</p>.
Do not add any extra explanations or text outside the <p> tags.

${taggedBatch}`;
      }

      try {
        // console.log("Prompt being sent:\n", prompt); // 필요시 프롬프트 로깅 활성화
        console.log(
          `📦 배치 ${batchIndex + 1}/${
            batches.length
          } 처리 중 (시도 ${attempt}/${maxRetries + 1})`
        );

        apiCallCount++;
        const result = await model.generateContent(prompt);
        const translatedText = await result.response.text();

        console.log("Raw API response:\n", translatedText); // 필요시 응답 로깅 활성화

        const regex = /<p id="(\d+?)">(.*?)<\/p>/gs; // 슬래시 이스케이프 확인
        let match;
        const translatedInBatch = new Map<number, string>();

        while ((match = regex.exec(translatedText)) !== null) {
          const id = parseInt(match[1], 10);
          // API 응답에서 추출된 텍스트
          const text = match[2] || "";
          translatedInBatch.set(id, text);
        }

        let successCount = 0;

        for (const idx of currentBatchIndices) {
          const translated = translatedInBatch.get(idx);
          const original = paragraphs[idx];

          // 번역 결과가 존재하고, 원문과 다를 때 성공 (공백만 다른 경우는?) -> 비교 시 trim() 사용
          if (
            translated !== undefined &&
            translated.trim() !== original.trim() // 비교 시에는 trim 사용
          ) {
            // 저장 시에는 원본 API 응답(trim 안 된)을 저장할 수 있음
            results[idx] = translated;
            successCount++;
          } else {
            // 번역 실패 또는 원문과 동일한 경우 (빈 문자열 포함)
            if (translated === undefined) {
              console.warn(`⚠️ 인덱스 ${idx} 번역 누락 (API 응답에 없음)`);
            } else {
              console.warn(`⚠️ 인덱스 ${idx} 번역 실패 또는 원문과 동일`);
            }
          }
        }

        console.log(
          `✅ 번역 성공: ${successCount}/${currentBatchIndices.length}`
        );
        success = true;
      } catch (e: any) {
        console.error(`❌ Gemini API 오류 (시도 ${attempt}):`, e.message || e);
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    // 마지막까지 실패 → 원문 사용
    if (!success) {
      for (const idx of currentBatchIndices) {
        // results[idx]가 여전히 null일 때만 원문으로 채움
        if (results[idx] === null) {
          results[idx] = paragraphs[idx];
        }
      }
      console.warn(`🚫 배치 ${batchIndex + 1} 번역 완전히 실패. 원문 유지.`);
    }
  }

  // 최종 결과에서 null 채우기 및 통계
  const finalResults = results.map((res, idx) =>
    res === null ? paragraphs[idx] : res
  );

  const successful = finalResults.filter(
    (r, idx) => r !== paragraphs[idx]
  ).length;
  const failed = paragraphs.length - successful;
  const successRate =
    paragraphs.length > 0 ? (successful / paragraphs.length) * 100 : 0;

  console.table({
    전체: paragraphs.length,
    성공: successful,
    실패: failed,
    성공률: `${successRate.toFixed(1)}%`,
    호출횟수: apiCallCount,
  });

  return finalResults; // 최종적으로 null이 없는 배열 반환
}
