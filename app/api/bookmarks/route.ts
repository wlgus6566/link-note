import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// 요청 스키마 정의
const bookmarkRequestSchema = z.object({
  digest_id: z.union([z.number(), z.string()]).transform((val) => val),
  folder_id: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => val),
});

export async function POST(req: Request) {
  console.log("북마크 저장 API 요청 수신");

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const requestData = await req.json();
    console.log("요청 데이터:", JSON.stringify(requestData));

    const validatedData = bookmarkRequestSchema.safeParse(requestData);

    if (!validatedData.success) {
      console.error("유효성 검사 실패:", validatedData.error);
      return NextResponse.json(
        { success: false, error: "유효하지 않은 북마크 데이터" },
        { status: 400 }
      );
    }

    const { digest_id, folder_id } = validatedData.data;
    const userId = session.user.id;

    console.log("북마크 저장 요청:", {
      digest_id,
      folder_id,
      userId,
      digest_id_type: typeof digest_id,
      folder_id_type: folder_id ? typeof folder_id : "undefined",
    });

    // 이미 저장된 북마크가 있는지 확인
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select()
      .eq("user_id", userId as any)
      .eq("digest_id", digest_id as any)
      .maybeSingle();

    let bookmarkId;

    if (existingBookmark) {
      // 타입 단언을 사용
      const bookmark = existingBookmark as Record<string, any>;
      bookmarkId = bookmark.id;
      console.log("이미 저장된 북마크 사용:", bookmarkId);
    } else {
      // 북마크 저장
      const { data: bookmark, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: userId,
          digest_id: digest_id,
          created_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) {
        console.error("북마크 저장 오류:", error);
        return NextResponse.json(
          { success: false, error: "북마크 저장 중 오류 발생" },
          { status: 500 }
        );
      }

      if (bookmark) {
        // 타입 단언을 사용
        const newBookmark = bookmark as Record<string, any>;
        bookmarkId = newBookmark.id;
        console.log("새 북마크 생성 완료:", bookmarkId);
      } else {
        console.error("북마크 생성 응답에 ID가 없습니다");
        return NextResponse.json(
          { success: false, error: "북마크 생성 실패: ID가 없습니다" },
          { status: 500 }
        );
      }
    }

    // folder_id가 제공된 경우, 폴더-북마크 관계 생성
    if (folder_id) {
      try {
        // 이미 해당 폴더에 북마크가 있는지 확인
        const { data: existingRelation, error: checkError } = await supabase
          .from("folder_bookmarks")
          .select()
          .eq("folder_id", folder_id as any)
          .eq("bookmark_id", bookmarkId as any)
          .maybeSingle();

        if (checkError) {
          console.error("폴더-북마크 관계 확인 오류:", checkError);
          console.log("오류 세부 정보:", checkError.message, checkError.code);

          // 테이블이 없는 경우 대응, 폴더-북마크 관계를 만들지 않고 진행
          if (checkError.code === "42P01") {
            // relation does not exist
            console.log(
              "folder_bookmarks 테이블이 없습니다. 북마크 저장만 진행합니다."
            );
            return NextResponse.json({
              success: true,
              message:
                "북마크가 저장되었습니다. (폴더 연결 기능은 현재 비활성화)",
              bookmarkId,
            });
          }
        }

        if (existingRelation) {
          console.log("이미 폴더에 북마크가 저장되어 있습니다.");
        } else {
          try {
            console.log("폴더-북마크 관계 생성 요청:", {
              folder_id,
              bookmarkId,
            });

            // 폴더-북마크 관계 생성
            const { data: folderBookmark, error: folderError } = await supabase
              .from("folder_bookmarks")
              .insert({
                folder_id: folder_id as any,
                bookmark_id: bookmarkId as any,
                created_at: new Date().toISOString(),
              } as any)
              .select()
              .single();

            if (folderError) {
              console.error("폴더-북마크 관계 저장 오류:", folderError);
              console.error("오류 메시지:", folderError.message);
              console.error("오류 코드:", folderError.code);
              console.error("오류 상세:", folderError.details);

              // 북마크는 이미 저장되었지만 폴더 관계 저장에 실패한 경우
              return NextResponse.json(
                {
                  success: true,
                  message: "북마크는 저장되었으나 폴더에 추가하지 못했습니다.",
                  error: folderError.message,
                  bookmarkId,
                },
                { status: 207 } // 207 Multi-Status - 부분적으로 성공
              );
            }

            console.log(
              `북마크를 폴더(${folder_id})에 저장 완료:`,
              folderBookmark
            );

            // 성공적으로 폴더-북마크 관계 생성
            return NextResponse.json({
              success: true,
              message: "북마크가 폴더에 저장되었습니다.",
              bookmarkId,
              folderBookmarkId: folderBookmark
                ? (folderBookmark as Record<string, any>).id
                : null,
            });
          } catch (relationError) {
            console.error("폴더-북마크 관계 생성 중 예외 발생:", relationError);
            return NextResponse.json(
              {
                success: true,
                message: "북마크는 저장되었으나 폴더에 추가하지 못했습니다.",
                error:
                  relationError instanceof Error
                    ? relationError.message
                    : "알 수 없는 오류",
                bookmarkId,
              },
              { status: 207 }
            );
          }
        }
      } catch (folderError) {
        console.error("폴더 처리 중 예외 발생:", folderError);
        // 북마크 저장은 성공했지만 폴더 관계 저장 중 오류 발생
        return NextResponse.json(
          {
            success: true,
            message: "북마크는 저장되었으나 폴더에 추가하지 못했습니다.",
            error:
              folderError instanceof Error
                ? folderError.message
                : "알 수 없는 오류",
            bookmarkId,
          },
          { status: 207 }
        );
      }
    }

    // 폴더 ID가 제공되지 않았거나, 관계가 이미 존재하는 경우
    return NextResponse.json({
      success: true,
      message: "북마크가 저장되었습니다.",
      bookmarkId,
    });
  } catch (error) {
    console.error("북마크 저장 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 저장 중 오류 발생" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  console.log("북마크 삭제 API 요청 수신");

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const digestId = url.searchParams.get("digestId");

    if (!digestId || isNaN(Number(digestId))) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 digestId 값입니다." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 북마크 삭제
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId as any)
      .eq("digest_id", Number(digestId) as any);

    if (error) {
      console.error("북마크 삭제 오류:", error);
      return NextResponse.json(
        { success: false, error: "북마크 삭제 중 오류 발생" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "북마크가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("북마크 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 삭제 중 오류 발생" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log("북마크 조회 API 요청 수신");

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const digestId = url.searchParams.get("digestId");
    const userId = session.user.id;

    if (digestId) {
      // 특정 다이제스트의 북마크 상태 확인
      const { data: bookmark } = await supabase
        .from("bookmarks")
        .select()
        .eq("user_id", userId as any)
        .eq("digest_id", Number(digestId) as any)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        isBookmarked: !!bookmark,
        bookmark,
      });
    } else {
      // 사용자의 모든 북마크 불러오기 (folder 조인 제거됨)
      try {
        const { data: bookmarks, error } = await supabase
          .from("bookmarks")
          .select(
            `
            id,
            user_id,
            digest_id,
            folder_id,
            created_at,
            digests (
              id,
              title,
              summary,
              tags,
              source_type,
              source_url,
              created_at,
              date,
              image,
              video_info
            )
          `
          )
          .eq("user_id", userId as any)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("북마크 목록 조회 오류:", error);

          return NextResponse.json(
            { success: false, error: "북마크 목록 조회 중 오류 발생" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          bookmarks,
        });
      } catch (error) {
        console.error("북마크 조회 전체 오류:", error);
        return NextResponse.json(
          { success: false, error: "북마크 목록 조회 중 오류 발생" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("북마크 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}
