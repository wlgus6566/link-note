import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { folders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 새 폴더 생성 스키마
const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "폴더 이름은 필수입니다")
    .max(50, "폴더 이름은 최대 50자까지 가능합니다"),
  description: z
    .string()
    .max(200, "설명은 최대 200자까지 가능합니다")
    .nullable()
    .optional(),
});

// 폴더 수정 스키마
const updateFolderSchema = z.object({
  id: z.string().uuid("유효한 폴더 ID가 아닙니다"),
  name: z
    .string()
    .min(1, "폴더 이름은 필수입니다")
    .max(50, "폴더 이름은 최대 50자까지 가능합니다"),
  description: z
    .string()
    .max(200, "설명은 최대 200자까지 가능합니다")
    .nullable()
    .optional(),
});

// GET: 사용자의 폴더 목록 조회
export async function GET(request: NextRequest) {
  console.log("GET 요청 시작 - 폴더 목록 조회");

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("GET - 인증되지 않은 요청 거부");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("GET - 사용자 ID:", userId);

    // 사용자 정보 확인 및 없으면 생성
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", userId as any)
      .single();

    if (userError) {
      // 사용자 정보가 없으면 생성
      const { error: createUserError } = await supabase.from("users").insert([
        {
          auth_id: userId as any,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            "사용자",
          avatar: session.user.user_metadata?.avatar_url,
        },
      ] as any);

      if (createUserError) {
        console.error("사용자 프로필 생성 오류:", createUserError);
        return NextResponse.json(
          { error: "사용자 프로필을 생성하는데 실패했습니다" },
          { status: 500 }
        );
      }
    }

    // 사용자의 모든 폴더 조회
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId as any)
      .order("created_at", { ascending: false });

    if (folderError) {
      console.error("GET - 폴더 조회 상세 오류:", folderError);
      console.error("오류 메시지:", folderError.message);
      console.error("오류 코드:", folderError.code);
      console.error("오류 상세:", folderError.details);

      return NextResponse.json(
        { error: "폴더 목록을 조회하는데 실패했습니다" },
        { status: 500 }
      );
    }

    console.log(`GET - 폴더 조회 성공: ${folderData.length}개 폴더 발견`);
    console.log("GET - 폴더 목록 반환:", folderData.length);
    return NextResponse.json({ folders: folderData });
  } catch (error) {
    console.error("GET - 폴더 목록 조회 중 예외 발생:", error);
    return NextResponse.json(
      { error: "폴더 목록을 조회하는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST: 새 폴더 생성
export async function POST(request: NextRequest) {
  console.log("POST 요청 시작 - 새 폴더 생성");

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("POST - 인증되지 않은 요청 거부");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("POST - 사용자 ID:", userId);

    // 요청 본문 파싱
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      console.error("POST - 요청 본문 파싱 오류:", e);
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다" },
        { status: 400 }
      );
    }

    console.log("POST - 요청 본문:", requestBody);

    try {
      const { name, description } = createFolderSchema.parse(requestBody);

      if (!name) {
        console.log("POST - 필수 필드 누락: 폴더 이름 없음");
        return NextResponse.json(
          { error: "폴더 이름은 필수입니다" },
          { status: 400 }
        );
      }

      console.log("POST - 폴더 생성 시도:", { name, description, userId });

      // 사용자가 존재하는지 확인
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", userId as any)
        .single();

      if (userError) {
        console.error("POST - 사용자 조회 오류:", userError);
        return NextResponse.json(
          { error: "사용자 정보를 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      // 폴더명 중복 검사
      const { data: existingFolder, error: checkError } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", userId as any)
        .ilike("name", name)
        .maybeSingle();

      if (checkError) {
        console.error("POST - 폴더명 중복 검사 오류:", checkError);
        return NextResponse.json(
          { error: "폴더 중복 확인 중 오류가 발생했습니다" },
          { status: 500 }
        );
      }

      if (existingFolder) {
        console.log("POST - 중복된 폴더명 발견:", name);
        return NextResponse.json(
          { error: "이미 존재하는 폴더명입니다" },
          { status: 409 }
        );
      }

      // 스키마 테이블 구조 확인
      try {
        // 폴더 생성
        const { data: folder, error: folderError } = await supabase
          .from("folders")
          .insert([
            {
              name,
              user_id: userId as any,
            },
          ] as any)
          .select("*")
          .single();

        if (folderError) {
          console.error("POST - 폴더 생성 상세 오류:", folderError);
          console.error("오류 메시지:", folderError.message);
          console.error("오류 코드:", folderError.code);
          console.error("오류 상세:", folderError.details);

          return NextResponse.json(
            { error: "폴더를 생성하는데 실패했습니다" },
            { status: 500 }
          );
        }

        console.log("POST - 폴더 생성 성공:", folder);
        return NextResponse.json({ folder });
      } catch (dbError) {
        console.error("POST - 데이터베이스 상세 오류:", dbError);
        return NextResponse.json(
          { error: "데이터베이스 작업 중 오류가 발생했습니다" },
          { status: 500 }
        );
      }
    } catch (validationError) {
      console.error("POST - 유효성 검사 오류:", validationError);
      return NextResponse.json(
        { error: "폴더 정보가 유효하지 않습니다" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST - 폴더 생성 중 예외 발생:", error);
    return NextResponse.json(
      { error: "폴더를 생성하는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// PUT: 폴더 수정
export async function PUT(request: NextRequest) {
  console.log("PUT 요청 시작 - 폴더 수정");

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("PUT - 인증되지 않은 요청 거부");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("PUT - 사용자 ID:", userId);

    // 요청 본문 파싱
    const requestBody = await request.json();
    console.log("PUT - 요청 본문:", requestBody);

    try {
      const { id, name, description } = updateFolderSchema.parse(requestBody);
      console.log("PUT - 폴더 수정 시도:", { id, name, description });

      // 폴더 소유자 확인
      const { data: folderData, error: folderCheckError } = await supabase
        .from("folders")
        .select("*")
        .eq("id", id as any)
        .eq("user_id", userId as any)
        .single();

      if (folderCheckError || !folderData) {
        console.log(
          "PUT - 폴더 소유권 확인 실패:",
          folderCheckError || "폴더를 찾을 수 없음"
        );
        return NextResponse.json(
          { error: "폴더를 찾을 수 없거나 수정 권한이 없습니다" },
          { status: 403 }
        );
      }

      // 폴더 수정 - description 필드가 있는지 확인
      let updateData = { name };

      try {
        // 폴더 수정
        const { data: updatedFolder, error: updateError } = await supabase
          .from("folders")
          .update(updateData as any)
          .eq("id", id as any)
          .eq("user_id", userId as any)
          .select()
          .single();

        if (updateError) {
          console.error("PUT - 폴더 수정 상세 오류:", updateError);
          console.error("오류 메시지:", updateError.message);
          console.error("오류 코드:", updateError.code);
          console.error("오류 상세:", updateError.details);

          return NextResponse.json(
            { error: "폴더를 수정하는데 실패했습니다" },
            { status: 500 }
          );
        }

        console.log("PUT - 폴더 수정 성공:", updatedFolder);
        return NextResponse.json({ folder: updatedFolder });
      } catch (dbError) {
        console.error("PUT - 데이터베이스 상세 오류:", dbError);
        return NextResponse.json(
          { error: "데이터베이스 작업 중 오류가 발생했습니다" },
          { status: 500 }
        );
      }
    } catch (validationError) {
      console.error("PUT - 유효성 검사 오류:", validationError);
      return NextResponse.json(
        { error: "폴더 정보가 유효하지 않습니다" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("PUT - 폴더 수정 중 예외 발생:", error);
    return NextResponse.json(
      { error: "폴더를 수정하는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 폴더 삭제
export async function DELETE(request: NextRequest) {
  console.log("DELETE 요청 시작 - 폴더 삭제");

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("DELETE - 인증되지 않은 요청 거부");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("DELETE - 사용자 ID:", userId);

    // URL에서 폴더 ID 추출
    const url = new URL(request.url);
    const folderId = url.searchParams.get("id");

    if (!folderId) {
      console.log("DELETE - 필수 매개변수 누락: 폴더 ID 없음");
      return NextResponse.json(
        { error: "폴더 ID는 필수입니다" },
        { status: 400 }
      );
    }

    console.log("DELETE - 폴더 삭제 시도:", { folderId });

    // 폴더 소유자 확인
    const { data: folderData, error: folderCheckError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId as any)
      .eq("user_id", userId as any)
      .single();

    if (folderCheckError || !folderData) {
      console.log(
        "DELETE - 폴더 소유권 확인 실패:",
        folderCheckError || "폴더를 찾을 수 없음"
      );
      return NextResponse.json(
        { error: "폴더를 찾을 수 없거나 삭제 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 폴더에 북마크가 있는지 확인
    const { count: bookmarkCount, error: countError } = await supabase
      .from("folder_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("folder_id", folderId as any);

    if (countError) {
      console.error("DELETE - 북마크 카운트 오류:", countError);
      return NextResponse.json(
        { error: "폴더 내 북마크를 확인하는데 실패했습니다" },
        { status: 500 }
      );
    }

    console.log("DELETE - 폴더 내 북마크 수:", bookmarkCount);

    // 폴더 내 북마크 삭제
    if (bookmarkCount && bookmarkCount > 0) {
      console.log("DELETE - 폴더 내 북마크 삭제 시도");
      const { error: bookmarkDeleteError } = await supabase
        .from("folder_bookmarks")
        .delete()
        .eq("folder_id", folderId as any);

      if (bookmarkDeleteError) {
        console.error("DELETE - 북마크 삭제 오류:", bookmarkDeleteError);
        return NextResponse.json(
          { error: "폴더 내 북마크를 삭제하는데 실패했습니다" },
          { status: 500 }
        );
      }
      console.log("DELETE - 폴더 내 북마크 삭제 성공");
    }

    // 폴더 삭제
    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId as any)
      .eq("user_id", userId as any);

    if (deleteError) {
      console.error("DELETE - 폴더 삭제 상세 오류:", deleteError);
      console.error("오류 메시지:", deleteError.message);
      console.error("오류 코드:", deleteError.code);
      console.error("오류 상세:", deleteError.details);

      return NextResponse.json(
        { error: "폴더를 삭제하는데 실패했습니다" },
        { status: 500 }
      );
    }

    console.log("DELETE - 폴더 삭제 성공:", { folderId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE - 폴더 삭제 중 예외 발생:", error);
    return NextResponse.json(
      { error: "폴더를 삭제하는데 실패했습니다" },
      { status: 500 }
    );
  }
}
