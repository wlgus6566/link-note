import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const isReset = requestUrl.searchParams.get("reset") === "true";
  const callbackUrl = requestUrl.searchParams.get("callbackUrl") || "/";
  const decodedCallbackUrl = callbackUrl
    ? decodeURIComponent(callbackUrl)
    : "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options ₩});
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);

    // 비밀번호 재설정인 경우 새 비밀번호 설정 페이지로 이동
    if (isReset) {
      return NextResponse.redirect(
        new URL("/reset-password", requestUrl.origin)
      );
    }

    // 로그인 후 사용자 정보가 users 테이블에 없는 경우 추가
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", session.user.id)
        .single();

      if (!existingUser) {
        // 사용자 정보를 users 테이블에 추가
        const { error } = await supabase.from("users").insert([
          {
            auth_id: session.user.id,
            email: session.user.email,
            name:
              session.user.user_metadata.name ||
              session.user.user_metadata.full_name ||
              "사용자",
          },
        ]);

        if (error) {
          console.error("Error creating user profile:", error);
        }
      }
    }
  }

  // 로그인 후 콜백 URL로 리다이렉션 (기본: 홈)
  return NextResponse.redirect(new URL(decodedCallbackUrl, requestUrl.origin));
}
