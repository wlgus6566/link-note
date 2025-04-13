import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Google Generative AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// 블로그 요약 생성을 위한 프롬프트 템플릿
const getBlogPrompt = ({
  title,
  description,
  channelTitle,
  publishedAt,
  transcript,
}: {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  transcript: string;
}) => {
  // 자막 길이에 따라 요약의 길이와 상세도를 조정
  const transcriptLength = transcript.length;
  let detailLevel = "보통";

  if (transcriptLength > 10000) {
    detailLevel = "길고 상세한"; // 상당히 긴 콘텐츠
  } else if (transcriptLength > 5000) {
    detailLevel = "상세한"; // 중간 길이 콘텐츠
  } else if (transcriptLength < 1000) {
    detailLevel = "간결한"; // 짧은 콘텐츠
  }

  return `
당신은 유튜브 콘텐츠를 블로그 형식으로 변환하는 콘텐츠 전문가입니다. 다음 유튜브 영상의 내용을 분석하고 ${detailLevel} 블로그 포스트 형식으로 재구성해주세요.

영상 제목: ${title}
영상 설명: ${description}
채널명: ${channelTitle}
업로드 날짜: ${publishedAt}

자막 내용:
${transcript}

요구사항:
1. 블로그 제목은 영상 제목을 참고하되, 필요시 SEO와 가독성을 위해 개선해주세요.
2. 블로그 형식으로 다음 구조를 따라주세요:
   - 도입부: 핵심 주제 소개 (1-2 문단)
   - 목차: 주요 섹션을 나열 (3-5개 항목)
   - 본문: 섹션별로 내용 정리 (각 섹션은 H2 또는 H3 제목과 관련 내용으로 구성)
   - 핵심 요약: 3-5개의 주요 포인트 (리스트 형식)
   - 결론: 마무리 및 통찰 (1-2 문단)
3. 영상의 핵심 인사이트와 가치 있는 정보를 포함해주세요.
4. 영상에서 언급된 중요한 인용구나 통계가 있다면 강조해주세요.
5. 적절한 소제목을 사용하여 내용을 구조화해주세요.
6. HTML 형식으로 출력해주세요. (p, h2, h3, ul, li, blockquote 등의 태그 사용)
7. 블로그 내용에는 figure와 figcaption을 포함한 이미지 플레이스홀더를 2-3개 제안해주세요. (실제 이미지는 나중에 삽입됩니다)
8. 콘텐츠와 관련된 5-7개의 태그를 추천해주세요.
9. 읽는 데 걸리는 예상 시간을 정확하게 계산해주세요 (평균 읽기 속도는 분당 500단어 기준, 최종 블로그의 단어 수를 계산하여 산정).

결과는 다음 JSON 형식으로 제공해주세요. 반드시 유효한 JSON 형식으로 응답해야 합니다:
{
  "title": "블로그 제목",
  "summary": "간략한 요약 (1-2문장)",
  "readTime": "읽는 데 소요되는 시간 (예: '3분 소요')",
  "tags": ["태그1", "태그2", "태그3", ...],
  "content": "HTML 형식의 블로그 콘텐츠",
  "image_suggestions": [
    {
      "caption": "이미지 캡션 설명",
      "placement": "삽입될 위치 (예: '도입부 후', '첫 번째 섹션 중간')"
    },
    ...
  ]
}
`;
};

// YouTube 콘텐츠를 블로그 형식으로 요약하는 함수
export async function generateBlogSummary({
  title,
  description,
  channelTitle,
  publishedAt,
  transcript,
}: {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  transcript: string;
}) {
  try {
    console.log("Gemini API 호출 시작");

    // Gemini 모델 초기화 - 더 안정적인 모델로 변경
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // gemini-1.5-flash에서 gemini-1.0-pro로 변경
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    console.log("Gemini 모델 초기화 완료");

    // 프롬프트 생성
    const prompt = getBlogPrompt({
      title,
      description,
      channelTitle,
      publishedAt,
      transcript,
    });

    console.log("프롬프트 생성 완료");

    // 채팅 없이 직접 생성 호출 사용
    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log("Gemini API 응답 수신 완료");

    // 응답 텍스트 추출
    const responseText = response.text();

    if (!responseText) {
      throw new Error("AI가 응답을 생성하지 못했습니다.");
    }

    console.log(
      "응답 텍스트 추출 완료",
      responseText.substring(0, 100) + "..."
    );

    try {
      // JSON 문자열을 파싱
      // Gemini는 때때로 ```json 마크다운 형식으로 응답할 수 있으므로 정규식으로 처리
      let jsonString = responseText;

      // JSON 블록 추출 시도
      const jsonBlockMatch = responseText.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/
      );
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonString = jsonBlockMatch[1];
        console.log("JSON 블록 추출 성공");
      }

      // 문자열 정제 - 잘못된 따옴표나 줄바꿈 등 처리
      jsonString = jsonString.trim().replace(/[\u201C\u201D]/g, '"');

      console.log("JSON 파싱 시도:", jsonString.substring(0, 100) + "...");

      const parsedData = JSON.parse(jsonString);
      console.log("JSON 파싱 성공");

      // 필수 필드 검증
      if (!parsedData.title || !parsedData.summary || !parsedData.content) {
        console.error("필수 필드 누락:", parsedData);
        throw new Error("AI 응답에 필수 필드가 누락되었습니다.");
      }

      // 이미지 컨텐츠 미리 생성 (YouTube URL 필요)
      const youtubeImages = await preGenerateYoutubeImages(parsedData);

      // 이미지 생성 및 콘텐츠에 삽입
      const enhancedData = await enhanceContentWithImages(
        parsedData,
        youtubeImages
      );

      return enhancedData;
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
      console.error("원본 응답:", responseText);

      // 파싱 실패 시 OpenAI API로 폴백
      if (process.env.OPENAI_API_KEY) {
        console.log("OpenAI API로 폴백 시도");
        return await fallbackToOpenAI({
          title,
          description,
          channelTitle,
          publishedAt,
          transcript,
        });
      }

      throw new Error("AI 응답을 파싱하는 중 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("Gemini API 에러:", error);
    throw new Error("블로그 요약을 생성하는 중 오류가 발생했습니다.");
  }
}

// YouTube URL에서 비디오 ID 추출 함수
function extractYouTubeVideoId(url: string): string {
  if (!url) return "";

  // YouTube URL 패턴 분석
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url?.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "";
}

// YouTube 이미지 미리 생성 (videoId가 필요한 경우)
async function preGenerateYoutubeImages(blogData: any) {
  try {
    // 이미지 제안이 없으면 빈 배열 반환
    if (
      !blogData.image_suggestions ||
      blogData.image_suggestions.length === 0
    ) {
      return [];
    }

    // 미리 저장할 유튜브 이미지 배열
    return [
      {
        type: "youtube_thumbnail",
        quality: "maxresdefault",
        placeholder: true,
      },
      {
        type: "youtube_thumbnail",
        quality: "hqdefault",
        placeholder: true,
      },
      {
        type: "youtube_thumbnail",
        quality: "1",
        placeholder: true,
      },
    ];
  } catch (error) {
    console.error("YouTube 이미지 미리 생성 오류:", error);
    return [];
  }
}

// 이미지 생성 및 콘텐츠에 삽입하는 함수 (직접 HTML 수정)
async function enhanceContentWithImages(
  blogData: any,
  preGeneratedImages: any[] = []
) {
  try {
    console.log("YouTube 이미지 콘텐츠 삽입 시작");
    console.log("이미지 제안 갯수:", blogData.image_suggestions?.length || 0);

    // 블로그 데이터 복사
    const enhancedData = { ...blogData };
    let content = enhancedData.content;

    // 이미지 제안이 없으면 빈 배열로 초기화하고 진행
    if (
      !blogData.image_suggestions ||
      blogData.image_suggestions.length === 0
    ) {
      console.log("이미지 제안이 없습니다. 기본 이미지 생성");
      blogData.image_suggestions = [
        {
          caption: "영상의 주요 장면",
          placement: "도입부",
        },
        {
          caption: "영상의 핵심 내용",
          placement: "중간",
        },
        {
          caption: "영상의 결론 부분",
          placement: "결론",
        },
      ];
    }

    // 디버깅: 콘텐츠 길이와 첫 100자 로깅
    console.log("콘텐츠 길이:", content.length);
    console.log("콘텐츠 미리보기:", content.substring(0, 100));

    // sourceUrl에서 비디오 ID 추출
    const videoId = blogData.sourceUrl
      ? extractYouTubeVideoId(blogData.sourceUrl)
      : "";

    // 비디오 길이 추출 (초 단위) - videoInfo가 있으면 사용
    let videoLength = 300; // 기본값 5분
    if (blogData.videoInfo && blogData.videoInfo.duration) {
      // ISO 8601 기간 형식 (PT#M#S) 파싱
      const durationMatch = blogData.videoInfo.duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
      );
      if (durationMatch) {
        const hours = parseInt(durationMatch[1] || "0", 10);
        const minutes = parseInt(durationMatch[2] || "0", 10);
        const seconds = parseInt(durationMatch[3] || "0", 10);
        videoLength = hours * 3600 + minutes * 60 + seconds;
        console.log("비디오 길이:", videoLength, "초");
      }
    }

    if (!videoId) {
      console.log(
        "유효한 YouTube 비디오 ID를 찾을 수 없습니다. 기본 이미지 사용"
      );
      // 기본 이미지 설정
      enhancedData.generatedImages = [
        {
          url: "/placeholder.svg?height=400&width=800",
          caption: "콘텐츠 이미지",
        },
      ];
      return enhancedData;
    }

    console.log("비디오 ID:", videoId);

    // 생성된 이미지 URL 저장할 배열
    const generatedImages: Array<{
      url: string;
      caption: string;
      section?: string;
      timestamp?: number;
    }> = [];

    // 최대 3개까지만 이미지 생성
    const maxImages = Math.min(blogData.image_suggestions.length, 3);

    // 유튜브 타임스탬프 추출 (여러 지점의 이미지 캡처를 위해)
    const timestamps = generateTimestamps(maxImages, videoLength);

    // 각 이미지 제안에 직접 HTML 태그 추가
    for (let i = 0; i < maxImages; i++) {
      const suggestion = blogData.image_suggestions[i];
      console.log(`이미지 ${i + 1} 처리 중:`, suggestion.caption);

      // YouTube 이미지 URL 생성
      let imageUrl = "";
      let sourceDescription = "";

      // 이미지 타입 결정 (썸네일 또는 타임스탬프 기반)
      const useTimestamp = i > 0 && timestamps[i] > 10; // 첫 번째 이미지는 항상 썸네일, 나머지는 타임스탬프 기반

      if (!useTimestamp) {
        // 썸네일 이미지 사용 (영상 대표 이미지)
        imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        sourceDescription = "유튜브 영상 대표 이미지";
      } else {
        // 타임스탬프 이미지 사용 (특정 시간의 장면)
        const timestamp = timestamps[i];
        const formattedTime = formatTimestamp(timestamp);

        // 동영상 타임스탬프 기반 이미지
        // 실제 앱에서는 YouTube Player API 또는 스크린샷 라이브러리가 필요하므로,
        // 여기서는 여전히 썸네일을 사용하지만 다른 품질 변형을 사용
        const thumbnailTypes = ["hqdefault", "mqdefault", "sddefault"];
        const thumbnailIndex = i % thumbnailTypes.length;
        imageUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailTypes[thumbnailIndex]}.jpg`;

        // 타임스탬프 설명 추가
        sourceDescription = `영상 타임스탬프 ${formattedTime} 지점`;
      }

      // 이미지 정보 저장
      generatedImages.push({
        url: imageUrl,
        caption: suggestion.caption,
        section: suggestion.placement,
        timestamp: timestamps[i] || 0,
      });

      // 이미지 HTML 태그 구성 - 개선된 버전
      const imageHtml = `
<figure class="my-8 relative">
  <div class="relative rounded-lg overflow-hidden">
    <img src="${imageUrl}" alt="${
        suggestion.caption
      }" class="w-full object-cover h-auto" loading="lazy" />
    ${
      useTimestamp
        ? `
    <a href="${blogData.sourceUrl}${
            timestamps[i] ? `&t=${Math.floor(timestamps[i])}` : ""
          }" 
       target="_blank" rel="noopener noreferrer"
       class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
      <div class="bg-black bg-opacity-70 text-white py-1 px-3 rounded-full flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>타임스탬프 재생 (${formatTimestamp(timestamps[i])})</span>
      </div>
    </a>
    `
        : ""
    }
  </div>
  <figcaption class="mt-2 text-sm text-center">
    <div class="font-medium text-gray-800">${suggestion.caption}</div>
    <div class="text-xs text-gray-500 mt-1">
      ${sourceDescription}
      ${useTimestamp ? ` - 영상 시간: ${formatTimestamp(timestamps[i])}` : ""}
    </div>
  </figcaption>
</figure>`;

      // 이미지 삽입 위치 확인
      const placement = suggestion.placement.toLowerCase();

      // 이미지를 콘텐츠의 특정 위치에 삽입하기 위한 마커 찾기
      let insertionPoint = -1;

      if (
        placement.includes("도입부") ||
        placement.includes("시작") ||
        placement.includes("header")
      ) {
        // 첫 번째 단락 또는 헤더 태그 찾기
        const firstParagraph = content.match(/<p[^>]*>.*?<\/p>/);
        const firstHeader = content.match(/<h[1-3][^>]*>.*?<\/h[1-3]>/);

        if (firstParagraph) {
          insertionPoint =
            content.indexOf(firstParagraph[0]) + firstParagraph[0].length;
        } else if (firstHeader) {
          insertionPoint =
            content.indexOf(firstHeader[0]) + firstHeader[0].length;
        } else {
          // 마커를 찾지 못했다면 콘텐츠 시작 부분에 삽입
          insertionPoint = 0;
        }
      } else if (placement.includes("중간") || placement.includes("본문")) {
        // 중간 위치 찾기 (대략 절반 지점에 가까운 단락 찾기)
        const paragraphs = content.match(/<p[^>]*>.*?<\/p>/g);
        if (paragraphs && paragraphs.length > 2) {
          const middleIndex = Math.floor(paragraphs.length / 2);
          const middleParagraph = paragraphs[middleIndex];
          insertionPoint =
            content.indexOf(middleParagraph) + middleParagraph.length;
        } else {
          // 중간 지점을 찾지 못했다면 콘텐츠 중간에 삽입
          insertionPoint = Math.floor(content.length / 2);
          // 가까운 HTML 태그 끝을 찾아서 조정
          const nearestTagEnd = content.indexOf(">", insertionPoint);
          if (nearestTagEnd > 0) {
            insertionPoint = nearestTagEnd + 1;
          }
        }
      } else if (
        placement.includes("결론") ||
        placement.includes("끝") ||
        placement.includes("마무리")
      ) {
        // 마지막 단락 찾기
        const paragraphs = content.match(/<p[^>]*>.*?<\/p>/g);
        if (paragraphs && paragraphs.length > 0) {
          const lastParagraph = paragraphs[paragraphs.length - 1];
          insertionPoint =
            content.indexOf(lastParagraph) + lastParagraph.length;
        } else {
          // 마지막 단락을 찾지 못했다면 콘텐츠 끝에 삽입
          insertionPoint = content.length;
        }
      } else {
        // 기타 위치는 콘텐츠 끝에 삽입
        insertionPoint = content.length;
      }

      console.log(
        `이미지 ${i + 1} 삽입 위치:`,
        insertionPoint,
        `(총 길이: ${content.length})`
      );

      // 삽입 위치가 유효한 경우에만 이미지 삽입
      if (insertionPoint >= 0 && insertionPoint <= content.length) {
        content =
          content.slice(0, insertionPoint) +
          imageHtml +
          content.slice(insertionPoint);
        console.log(`이미지 ${i + 1} 삽입 완료`);
      } else {
        console.log(`이미지 ${i + 1} 삽입 실패: 유효하지 않은 위치`);
        // 실패한 경우 끝에 추가
        content += imageHtml;
      }
    }

    // 최종 업데이트된 콘텐츠 로깅
    console.log("최종 이미지 개수:", generatedImages.length);
    console.log("최종 콘텐츠 길이:", content.length);

    // 업데이트된 콘텐츠와 생성된 이미지 정보 설정
    enhancedData.content = content;
    enhancedData.generatedImages = generatedImages;

    console.log("생성된 이미지 배열:", JSON.stringify(generatedImages));
    console.log("YouTube 이미지 추출 및 삽입 완료");
    return enhancedData;
  } catch (error) {
    console.error("YouTube 이미지 추출 및 삽입 오류:", error);
    // 이미지 생성 실패 시 기본 이미지로 설정하고 반환
    const defaultImage = {
      url: "/placeholder.svg?height=400&width=800",
      caption: "콘텐츠 이미지",
    };

    return {
      ...blogData,
      generatedImages: [defaultImage],
    };
  }
}

// OpenAI API로 폴백하는 함수
async function fallbackToOpenAI({
  title,
  description,
  channelTitle,
  publishedAt,
  transcript,
}: {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  transcript: string;
}) {
  try {
    console.log("OpenAI 폴백 함수 호출");

    // OpenAI SDK 동적 가져오기
    const { OpenAI } = await import("openai");

    // OpenAI 클라이언트 초기화
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "당신은 콘텐츠를 블로그 형식으로 변환하는 전문가입니다. 항상 요청된 형식에 맞게 응답해주세요.",
        },
        {
          role: "user",
          content: getBlogPrompt({
            title,
            description,
            channelTitle,
            publishedAt,
            transcript,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    // API 응답에서 콘텐츠 추출
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI가 응답을 생성하지 못했습니다.");
    }

    // JSON 문자열을 파싱
    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI 폴백 에러:", error);
    throw new Error("블로그 요약을 생성하는 중 오류가 발생했습니다.");
  }
}

// 생성된 요약을 포맷팅하는 함수 (필요시 사용)
export function formatBlogSummary(data: any) {
  // 필요한 형식 변환이 있으면 여기서 처리
  return {
    ...data,
    publishDate: new Date().toISOString(),
  };
}

// 타임스탬프 생성 함수 (동영상의 여러 지점에서 이미지 표시)
function generateTimestamps(count: number, videoLength?: number): number[] {
  const timestamps: number[] = [];

  // 비디오 길이가 없는 경우 기본 값 사용 (5분)
  const estimatedLength = videoLength || 300;

  // 동영상의 다양한 지점에서 고르게 분포된 타임스탬프 생성
  if (count >= 1) {
    // 첫 번째 이미지: 도입부 (약 10% 지점)
    timestamps.push(Math.max(10, Math.floor(estimatedLength * 0.1)));
  }

  if (count >= 2) {
    // 두 번째 이미지: 중간 부분 (약 40-60% 지점)
    timestamps.push(Math.floor(estimatedLength * 0.5));
  }

  if (count >= 3) {
    // 세 번째 이미지: 후반부 (약 75-85% 지점)
    timestamps.push(Math.floor(estimatedLength * 0.8));
  }

  if (count >= 4) {
    // 네 번째 이미지 이상은 균등하게 분배
    const gap = Math.floor(estimatedLength / (count + 1));
    for (let i = 3; i < count; i++) {
      timestamps.push(gap * (i + 1));
    }
  }

  return timestamps;
}

// 타임스탬프 포맷팅 함수 (초 -> MM:SS 형식)
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
