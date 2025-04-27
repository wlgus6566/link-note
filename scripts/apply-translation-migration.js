// Supabase 마이그레이션 적용 스크립트
require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// SQL 파일 경로
const migrationFile = path.join(
  __dirname,
  "../lib/migrations/update_translated_paragraphs_permissions.sql"
);

// 환경 변수 확인
if (!process.env.SUPABASE_DB_URL) {
  console.error("❌ 환경 변수 SUPABASE_DB_URL이 설정되지 않았습니다.");
  process.exit(1);
}

try {
  // SQL 파일 존재 확인
  if (!fs.existsSync(migrationFile)) {
    console.error(`❌ 마이그레이션 파일을 찾을 수 없습니다: ${migrationFile}`);
    process.exit(1);
  }

  console.log("🔄 마이그레이션 적용 중...");

  // psql을 사용하여 SQL 파일 실행
  execSync(`psql "${process.env.SUPABASE_DB_URL}" -f "${migrationFile}"`, {
    stdio: "inherit",
  });

  console.log("✅ 마이그레이션이 성공적으로 적용되었습니다.");
} catch (error) {
  console.error("❌ 마이그레이션 적용 중 오류 발생:", error.message);
  process.exit(1);
}
