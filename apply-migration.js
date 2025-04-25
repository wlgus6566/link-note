const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
require("dotenv").config();

async function applyMigration() {
  try {
    // 환경 변수 확인
    console.log("🔑 환경 변수 확인 중...");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase URL 또는 Service Role Key가 없습니다.");
      return;
    }

    // 마이그레이션 파일 읽기
    console.log("📄 마이그레이션 파일 읽는 중...");
    const migrationSql = fs.readFileSync(
      "./supabase/migrations/0007_thick_killmonger.sql",
      "utf8"
    );
    console.log("ℹ️ 마이그레이션 SQL:\n", migrationSql);

    // Supabase 클라이언트 생성
    console.log("🔌 Supabase에 연결 중...");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      db: { schema: "public" },
    });

    // 데이터베이스 연결 확인 (user_id 컬럼을 제외하고 확인)
    console.log("🔍 데이터베이스 연결 확인 중...");
    const { data: digestsData, error: digestsError } = await supabase
      .from("digests")
      .select("id")
      .limit(1);

    if (digestsError) {
      console.error("❌ 데이터베이스 연결 오류:", digestsError);
      return;
    }

    console.log("✅ 데이터베이스 연결 확인 완료");

    // 각 digest에 해당하는 user_id 설정
    console.log("🔄 북마크에서 user_id 정보 수집 중...");
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("digest_id, user_id")
      .limit(1000);

    if (bookmarksError) {
      console.error("❌ 북마크 조회 오류:", bookmarksError);
      return;
    }

    console.log(`📊 업데이트할 북마크 후보 수: ${bookmarks.length}`);

    // 1. 첫 번째로 user_id 컬럼 존재 확인
    console.log("🔄 user_id 컬럼 존재 확인을 위한 테스트 업데이트 시도...");

    if (bookmarks.length > 0) {
      // 테스트 업데이트로 컬럼 존재 여부 확인
      const testDigestId = bookmarks[0].digest_id;
      const testUserId = bookmarks[0].user_id;

      const { data: updateResult, error: updateTestError } = await supabase
        .from("digests")
        .update({ user_id: testUserId })
        .eq("id", testDigestId)
        .select();

      if (updateTestError) {
        // 컬럼이 없는 경우
        if (
          updateTestError.message &&
          updateTestError.message.includes(
            'column "user_id" of relation "digests" does not exist'
          )
        ) {
          console.log(
            "❗ user_id 컬럼이 존재하지 않습니다. 마이그레이션이 필요합니다."
          );
          console.log("⚠️ 이 스크립트는 컬럼을 자동으로 생성할 수 없습니다.");
          console.log(
            "💡 Supabase 대시보드에서 SQL 에디터를 사용하여 마이그레이션을 수동으로 실행하세요."
          );
          console.log(
            "💡 실행할 SQL: ALTER TABLE digests ADD COLUMN IF NOT EXISTS user_id text;"
          );
          return;
        } else {
          console.error(
            "❌ 테스트 업데이트 중 알 수 없는 오류:",
            updateTestError
          );
          return;
        }
      }

      console.log("✅ user_id 컬럼이 존재합니다. 업데이트를 진행합니다.");

      // 2. 업데이트 시도
      // 북마크별 다이제스트 업데이트
      let updateCount = 0;
      let errorCount = 0;
      let skipCount = 0;

      for (const bookmark of bookmarks) {
        if (bookmark.digest_id && bookmark.user_id) {
          const { data, error: updateError } = await supabase
            .from("digests")
            .update({ user_id: bookmark.user_id })
            .eq("id", bookmark.digest_id)
            .is("user_id", null);

          if (updateError) {
            console.error(
              `❌ ID ${bookmark.digest_id} 업데이트 오류:`,
              updateError
            );
            errorCount++;
          } else {
            if (data && data.length > 0) {
              updateCount++;
              if (updateCount % 10 === 0) {
                console.log(`⏳ ${updateCount}개 다이제스트 업데이트 완료...`);
              }
            } else {
              skipCount++; // 이미 user_id가 설정된 경우
            }
          }
        }
      }

      console.log(
        `✅ 업데이트 결과: 성공 ${updateCount}개, 실패 ${errorCount}개, 건너뜀 ${skipCount}개`
      );
    } else {
      console.log("⚠️ 북마크가 없어 업데이트할 데이터가 없습니다");
    }

    console.log("✅ 마이그레이션이 완료되었습니다");
  } catch (err) {
    console.error("❌ 실행 중 오류가 발생했습니다:", err);
  }
}

console.log("🚀 마이그레이션 스크립트 시작...");
applyMigration().then(() => {
  console.log("🏁 마이그레이션 스크립트 완료");
});
