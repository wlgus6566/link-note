import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 모든 쿠키 가져오기
    const cookies = req.cookies.getAll();

    // 쿠키 이름과 값 출력
    const cookieDetails = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value.substring(0, 10) + "...",
    }));

    // Supabase 관련 쿠키 찾기
    const supabaseCookies = cookies.filter(
      (cookie) =>
        cookie.name.startsWith("sb-") || cookie.name.includes("supabase")
    );

    // CURL 명령어 생성
    const cookieString = supabaseCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const curlCommand = `curl -v -X PUT -H "Content-Type: application/json" -H "Cookie: ${cookieString}" -d '{"memo":"테스트 메모"}' http://localhost:3002/api/timelines/4/memo`;

    return NextResponse.json({
      message: "쿠키 정보",
      allCookies: cookieDetails,
      supabaseCookies: supabaseCookies.map((c) => c.name),
      curlCommand,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "쿠키 정보를 가져오는 중 오류가 발생했습니다: " + error.message,
      },
      { status: 500 }
    );
  }
}
