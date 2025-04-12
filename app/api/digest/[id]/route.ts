import { NextRequest, NextResponse } from "next/server";

// 임시 저장소 가져오기 (실제로는 데이터베이스 조회로 변경 필요)
// 주의: 서버 재시작 시 데이터가 초기화됩니다
import { digests } from "../save/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15에서는 params가 Promise로 변경됨
    // 하지만 await은 사용하지 않음 (params가 이미 해결된 객체임)
    const idStr = params?.id || "";
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 ID입니다.",
        },
        { status: 400 }
      );
    }

    // 디버깅을 위한 로그 추가
    console.log("요청된 ID:", id);
    console.log(
      "현재 저장된 다이제스트:",
      digests.map((d) => `ID: ${d.id}, 제목: ${d.title}`)
    );

    // ID로 데이터 찾기
    const digest = digests.find((d) => d.id === id);

    if (!digest) {
      // ID가 존재하지 않는 경우, 더미 데이터 생성
      const dummyDigest = {
        id,
        title: `데모 다이제스트 ${id}`,
        summary: "이 다이제스트는 임시 데이터로 생성되었습니다.",
        readTime: "3분 소요",
        tags: ["데모", "임시", "테스트"],
        content: `
          <h2>임시 생성된 다이제스트</h2>
          <p>이 다이제스트는 실제로 저장소에 존재하지 않아 임시로 생성되었습니다. 서버가 재시작되면 데이터가 초기화되어 이전에 생성된 다이제스트를 찾을 수 없는 경우가 발생합니다.</p>
          <p>실제 프로덕션 환경에서는 데이터베이스를 사용하여 데이터가 영구적으로 저장되도록 해야 합니다.</p>
        `,
        sourceUrl: "https://example.com",
        sourceType: "Other",
        date: new Date().toISOString(),
        author: {
          name: "시스템",
          role: "자동 생성",
          avatar: "/placeholder.svg",
        },
        image: "/placeholder.svg?height=400&width=800",
        image_suggestions: [
          {
            caption: "임시 이미지",
            placement: "도입부 후",
          },
        ],
      };

      // 임시 데이터를 digests 배열에 추가 (다음 요청에서 사용 가능하도록)
      digests.push(dummyDigest);

      return NextResponse.json({
        success: true,
        data: dummyDigest,
      });
    }

    return NextResponse.json({
      success: true,
      data: digest,
    });
  } catch (error) {
    console.error("요약 조회 API 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
