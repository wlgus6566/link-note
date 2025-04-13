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

      return parsedData;
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
