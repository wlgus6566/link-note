import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// 다이제스트 테이블 정의
export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  readTime: varchar("read_time", { length: 50 }).notNull(),
  tags: jsonb("tags").notNull().default([]),
  content: text("content").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceType: varchar("source_type", { length: 20 }).notNull(),
  date: timestamp("date").defaultNow(),
  image: text("image"),
  imageSuggestions: jsonb("image_suggestions").default([]),
  author: jsonb("author").default({}),
  videoInfo: jsonb("video_info").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 사용자 테이블 정의 (미래에 인증 시스템 추가 시 사용)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Supabase Auth ID
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 북마크 테이블 정의 (사용자가 저장한 다이제스트)
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  digestId: integer("digest_id")
    .notNull()
    .references(() => digests.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 타입 정의
export type Digest = typeof digests.$inferSelect;
export type NewDigest = typeof digests.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
