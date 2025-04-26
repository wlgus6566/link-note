import { createClient } from "@/lib/supabase/server";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  try {
    const supabase = await createClient();
    const migrationSql = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/migrations/add_translated_paragraphs_table.sql"
      ),
      "utf8"
    );

    // SQL 스크립트 실행
    const { error } = await supabase.rpc("pgcs_sql", { query: migrationSql });

    if (error) {
      console.error("마이그레이션 실행 오류:", error);
      process.exit(1);
    } else {
      console.log("마이그레이션 성공적으로 실행됨");
      process.exit(0);
    }
  } catch (error) {
    console.error("마이그레이션 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트 실행
runMigration();
