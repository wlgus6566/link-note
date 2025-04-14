import { NextRequest, NextResponse } from "next/server";
import { parseInstagramUrl, uploadImageToStorage } from "@/lib/utils/instagram";
import { createClient } from "@supabase/supabase-js";
import path from "path";

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage 버킷 타입 정의
interface Bucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

// Storage 버킷 확인 및 생성
async function ensureStorageBucket() {
  try {
    // 'instagram' 버킷이 있는지 확인
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("버킷 목록 조회 오류:", error);
      return;
    }

    // 'instagram' 버킷이 없으면 생성
    const instagramBucket = buckets?.find(
      (bucket: Bucket) => bucket.name === "instagram"
    );
    if (!instagramBucket) {
      console.log("instagram 버킷이 없습니다. 생성을 시도합니다.");
      const { data, error: createError } = await supabase.storage.createBucket(
        "instagram",
        {
          public: true, // 공개 액세스 허용
        }
      );

      if (createError) {
        console.error("버킷 생성 오류:", createError);
      } else {
        console.log("instagram 버킷이 생성되었습니다.");
      }
    }
  } catch (error) {
    console.error("Storage 버킷 확인 중 오류:", error);
  }
}

// 테이블 존재 여부 확인 함수
async function checkTableExists(tableName: string) {
  try {
    // 테이블에서 데이터 한 건 가져오기 시도
    const { data, error } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    if (error) {
      // 테이블이 없는 경우 ForeignKeyViolationError 또는 다른 오류 발생
      console.error(`테이블 확인 오류:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`테이블 확인 중 오류:`, error);
    return false;
  }
}

// 테이블 정보 조회 - 어떤 필드가 있는지 직접 스키마 확인
async function getTableInfo(tableName: string) {
  try {
    // 테이블 정보 쿼리 시도
    const { data, error } = await supabase.from(tableName).select("*").limit(1);

    if (error) {
      console.error("테이블 정보 조회 오류:", error);
      return null;
    }

    // 데이터가 없으면 컬럼 정보를 알 수 없음
    if (!data || data.length === 0) {
      // 샘플 데이터 삽입 시도
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([
          {
            title: "Sample Title",
            summary: "Sample Summary",
            readTime: "1 min read",
            content: "Sample Content",
            image: "/sample.jpg",
          },
        ])
        .select();

      if (insertError) {
        console.error("샘플 데이터 삽입 오류:", insertError);

        // 오류 메시지에서 필드 구조 유추
        const missingField =
          insertError.message.match(/column "([^"]+)"/) || [];
        if (missingField[1]) {
          console.log("스키마에 없는 필드:", missingField[1]);
        }
      }

      // 다시 조회 시도
      const { data: retryData, error: retryError } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (retryError || !retryData || retryData.length === 0) {
        console.error("테이블 정보 재조회 실패");
        return null;
      }

      return retryData[0] ? Object.keys(retryData[0]) : null;
    }

    // 첫 번째 레코드의 키를 반환
    return data[0] ? Object.keys(data[0]) : null;
  } catch (error) {
    console.error("테이블 정보 조회 중 오류:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Supabase 연결 확인
    console.log("Supabase 연결 확인:", {
      url: supabaseUrl ? "설정됨" : "설정되지 않음",
      key: supabaseAnonKey ? "설정됨" : "설정되지 않음",
    });

    // Storage 버킷 확인
    await ensureStorageBucket();

    // 요청 데이터 파싱
    const body = await request.json();
    const { url } = body;

    // URL 검증
    if (!url) {
      return NextResponse.json(
        { error: "URL이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // Instagram 콘텐츠 파싱
    const instagramData = await parseInstagramUrl(url);
    const { id, title, summary, image, images, author, content } =
      instagramData;

    // 이미지 업로드 및 URL 업데이트
    const uploadedImages: string[] = [];

    // 대표 이미지 업로드
    if (image) {
      const imageFileName = `${id}_main${path.extname(image) || ".jpg"}`;
      const uploadedMainImage = await uploadImageToStorage(
        image,
        imageFileName
      );
      uploadedImages.push(uploadedMainImage);
    }

    // 추가 이미지 업로드
    for (let i = 0; i < images.length; i++) {
      if (i === 0 && image === images[0]) continue; // 대표 이미지와 중복 방지

      const imageFileName = `${id}_${i}${path.extname(images[i]) || ".jpg"}`;
      const uploadedImage = await uploadImageToStorage(
        images[i],
        imageFileName
      );
      uploadedImages.push(uploadedImage);
    }

    // 테이블 존재 확인
    let tableExists = await checkTableExists("digests");
    console.log("테이블 존재 여부:", tableExists);

    let savedId: number | string = 0;
    let dbError = null;

    if (tableExists) {
      try {
        // 필수 필드만 포함하는 데이터 (title, summary)
        const digestData = {
          title: title || "Instagram 포스트",
          summary: summary || "이 콘텐츠는 Instagram에서 가져온 게시물입니다.",
          content: content || "",
          image: uploadedImages[0] || "",
          source_url: url,
          source_type: "instagram",
          read_time: "1 min read",
          author: JSON.stringify(author),
        };

        console.log("데이터 저장 시도:", digestData);

        // 데이터 저장 시도
        const { data: savedData, error: saveError } = await supabase
          .from("digests")
          .insert([digestData])
          .select();

        if (!saveError && savedData && savedData.length > 0) {
          console.log("데이터 저장 성공!");
          savedId = savedData[0].id;
        } else if (saveError) {
          console.error("데이터 저장 실패:", saveError);
          dbError = {
            message: "데이터베이스 저장 실패",
            details: saveError.message,
            code: saveError.code,
            hint: saveError.hint || "없음",
          };
        }
      } catch (dbErr: any) {
        console.error("데이터베이스 작업 중 예외 발생:", dbErr);
        dbError = {
          message: "데이터베이스 작업 중 예외",
          details: dbErr.message,
        };
      }
    } else {
      dbError = {
        message: "데이터베이스 테이블이 존재하지 않음",
        details: "digests 테이블을 찾을 수 없습니다.",
      };
    }

    // 데이터베이스 저장에 실패한 경우 임시 ID 사용
    if (dbError || !savedId) {
      console.warn("데이터베이스 오류 발생, 임시 ID 사용:", dbError);
      // 임시 ID 생성 (Unix 타임스탬프)
      savedId = `temp_${Date.now()}`;
    }

    // 저장된 데이터와 함께 응답
    return NextResponse.json({
      id: savedId,
      title,
      summary,
      image: uploadedImages[0] || "",
      images: uploadedImages,
      author,
      content,
      dbError: dbError, // 개발 모드에서만 포함
    });
  } catch (error: any) {
    console.error("Instagram 파싱 API 오류:", error);
    return NextResponse.json(
      {
        error: error.message || "Instagram 콘텐츠 파싱 실패",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
