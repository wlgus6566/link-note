import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Instagram oEmbed API URL
const INSTAGRAM_OEMBED_URL = "https://api.instagram.com/oembed";

// API 응답 타입 정의
interface InstagramOEmbedResponse {
  version?: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  author_id?: string;
  media_id?: string;
  provider_name?: string;
  provider_url?: string;
  type?: string;
  width?: number;
  height?: number;
  html?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

/**
 * Instagram URL이 유효한지 확인
 */
export function isValidInstagramUrl(url: string): boolean {
  const instagramUrlPattern =
    /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/([^/?#&]+)/;
  return instagramUrlPattern.test(url);
}

/**
 * Instagram 포스트 ID 추출
 */
function extractInstagramId(url: string): string {
  const match = url.match(/instagram\.com\/(p|reel)\/([^/?#&]+)/);
  return match ? match[2] : "";
}

/**
 * Instagram 포스트 유형 추출 (post 또는 reel)
 */
function extractPostType(url: string): string {
  const match = url.match(/instagram\.com\/(p|reel)\/([^/?#&]+)/);
  return match && match[1] === "reel" ? "Reel" : "Post";
}

/**
 * Instagram URL에서 추가 정보 추출 (예: img_index)
 */
function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (e) {
    console.error("URL 파싱 에러:", e);
  }
  return params;
}

/**
 * Instagram oEmbed API로 포스트 정보 가져오기
 */
async function fetchInstagramOEmbed(
  url: string
): Promise<InstagramOEmbedResponse | null> {
  try {
    // URL 인코딩
    const encodedUrl = encodeURIComponent(url);
    const oEmbedUrl = `https://api.instagram.com/oembed/?url=${encodedUrl}`;

    const response = await fetch(oEmbedUrl);

    if (!response.ok) {
      // oEmbed API가 실패하면 표준 oEmbed API 시도
      const alternativeUrl = `https://oembed.com/providers/instagram/endpoint?url=${encodedUrl}`;
      const altResponse = await fetch(alternativeUrl);

      if (!altResponse.ok) {
        console.warn(
          "Instagram oEmbed API 호출 실패:",
          response.status,
          response.statusText
        );
        return null;
      }

      return await altResponse.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Instagram oEmbed API 호출 중 오류:", error);
    return null;
  }
}

/**
 * Instagram 포스트 콘텐츠 파싱
 */
export async function parseInstagramUrl(url: string) {
  if (!isValidInstagramUrl(url)) {
    throw new Error("유효하지 않은 Instagram URL입니다.");
  }

  try {
    // Instagram 포스트 ID 추출
    const postId = extractInstagramId(url);

    if (!postId) {
      throw new Error("Instagram 포스트 ID를 추출할 수 없습니다.");
    }

    // 포스트 유형 확인
    const postType = extractPostType(url);

    // URL 파라미터 추출 (img_index 등)
    const urlParams = extractUrlParams(url);

    // 현재 날짜 가져오기
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`;

    // 게시물 제목 생성 (포스트 유형 반영)
    const title = `Instagram ${postType} (${formattedDate})`;

    // 썸네일 이미지
    const mainImage = `/placeholder.svg?height=800&width=600&text=Instagram_${postId}`;
    const images = [mainImage];

    // 작성자 정보
    const author = {
      name: "Instagram 사용자",
      avatar: "",
      url: "",
    };

    // 게시물 유형에 따른 설명 생성
    let description = "이 콘텐츠는 ";
    if (postType === "Reel") {
      description += "Instagram Reel 영상입니다.";
    } else {
      description += "Instagram에서 가져온 게시물입니다.";
    }

    if (urlParams.img_index) {
      description += ` (이미지 ${urlParams.img_index})`;
    }

    // 개선된 임베드 HTML
    const embedHtml = `
      <blockquote 
        class="instagram-media" 
        data-instgrm-captioned 
        data-instgrm-permalink="${url}" 
        data-instgrm-version="14"
        style="
          background:#FFF; 
          border:0; 
          border-radius:3px; 
          box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); 
          margin: 1px; 
          max-width:540px; 
          min-width:326px; 
          padding:0; 
          width:99.375%; 
          width:-webkit-calc(100% - 2px); 
          width:calc(100% - 2px);"
      >
        <div style="padding:16px;">
          <a 
            href="${url}" 
            style="
              background:#FFFFFF; 
              line-height:0; 
              padding:0 0; 
              text-align:center; 
              text-decoration:none; 
              width:100%;" 
            target="_blank"
          >
            <div style="display:flex; align-items:center;">
              <div style="
                background-color:#F4F4F4; 
                border-radius:50%; 
                flex-grow:0; 
                height:40px; 
                margin-right:14px; 
                width:40px;">
              </div>
              <div style="
                display:flex; 
                flex-direction:column; 
                flex-grow:1; 
                justify-content:center;">
                <div style="
                  background-color:#F4F4F4; 
                  border-radius:4px; 
                  flex-grow:0; 
                  height:14px; 
                  margin-bottom:6px; 
                  width:100px;">
                </div>
                <div style="
                  background-color:#F4F4F4; 
                  border-radius:4px; 
                  flex-grow:0; 
                  height:14px; 
                  width:60px;">
                </div>
              </div>
            </div>
            <div style="padding:19% 0;"></div>
            <div style="
              display:block; 
              height:50px; 
              margin:0 auto 12px; 
              width:50px;">
              <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                    <g>
                      <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div style="padding-top:8px;">
              <div style="
                color:#3897f0; 
                font-family:Arial,sans-serif; 
                font-size:14px; 
                font-style:normal; 
                font-weight:550; 
                line-height:18px;">
                Instagram에서 보기
              </div>
            </div>
          </a>
        </div>
      </blockquote>
      <script async src="//www.instagram.com/embed.js"></script>
    `;

    // 완전한 HTML 콘텐츠 생성
    const content = `
      <div class="instagram-post">
        <header class="post-header">
          <h2>${title}</h2>
          <div class="author">By ${author.name}</div>
        </header>
        
        <div class="post-content">
          <div class="instagram-embed">
            ${embedHtml}
          </div>
          
          <div class="caption">
            <p>${description}</p>
            <p><strong>원본 링크:</strong> <a href="${url}" target="_blank">${url}</a></p>
          </div>
        </div>
      </div>
    `;

    // 응답 객체 생성
    const result = {
      id: `instagram_${postId}_${new Date().getTime()}`,
      title,
      summary: description,
      image: mainImage,
      images,
      author,
      content,
      originalUrl: url,
      postType,
      postId,
    };

    return result;
  } catch (error) {
    console.error("Instagram 콘텐츠 파싱 에러:", error);
    throw error;
  }
}

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImageToStorage(imageUrl: string, fileName: string) {
  try {
    // 이미지 URL이 /placeholder.svg로 시작하면 외부 이미지 사용
    if (imageUrl.startsWith("/placeholder.svg")) {
      // 플레이스홀더 이미지의 경우 기본 경로 반환
      return imageUrl;
    }

    // 이미지 가져오기 시도
    try {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("instagram")
        .upload(`images/${fileName}`, imageBuffer, {
          contentType: "image/jpeg", // 또는 적절한 MIME 타입
          upsert: true,
        });

      if (error) {
        console.error("Storage 업로드 오류:", error);
        // 업로드 실패 시 원본 URL 반환
        return imageUrl;
      }

      // 업로드된 이미지의 공개 URL 반환
      const { data: publicUrlData } = supabase.storage
        .from("instagram")
        .getPublicUrl(`images/${fileName}`);

      return publicUrlData.publicUrl || imageUrl;
    } catch (fetchError) {
      console.error("이미지 가져오기 오류:", fetchError);
      // 이미지 가져오기 실패 시 기본 이미지 반환
      return `/placeholder.svg?height=800&width=600&text=Error_${encodeURIComponent(
        fileName
      )}`;
    }
  } catch (error) {
    console.error("이미지 업로드 에러:", error);
    // 심각한 오류 시 기본 이미지 반환
    return `/placeholder.svg?height=800&width=600&text=Error_${encodeURIComponent(
      fileName
    )}`;
  }
}
