import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

// 사용자 테이블 정의
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // 기본 ID (자동 증가 번호)
  auth_id: text("auth_id").notNull().unique(), // Supabase Auth ID
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 다이제스트 테이블 정의
export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.auth_id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  readTime: varchar("read_time", { length: 50 }).notNull(),
  tags: jsonb("tags").notNull().default([]),
  content: text("content").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceType: varchar("source_type", { length: 20 }).notNull(),
  date: timestamp("date").defaultNow(),
  image: text("image"),
  author: jsonb("author").default({}),
  videoInfo: jsonb("video_info").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 북마크 테이블 정의 (사용자가 저장한 다이제스트)
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.auth_id, { onDelete: "cascade" }),
  digestId: integer("digest_id")
    .notNull()
    .references(() => digests.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 타임라인 북마크 테이블 정의 (사용자가 비디오 내 특정 시간에 추가한 북마크)
export const timelineBookmarks = pgTable("timeline_bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.auth_id, { onDelete: "cascade" }),
  digestId: integer("digest_id")
    .notNull()
    .references(() => digests.id, { onDelete: "cascade" }),
  timelineId: varchar("timeline_id", { length: 50 }).notNull(),
  seconds: decimal("seconds").notNull(),
  text: text("text").notNull(),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 폴더 테이블 정의 (사용자의 북마크 폴더)
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.auth_id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 폴더-북마크 관계 테이블 정의
export const folderBookmarks = pgTable("folder_bookmarks", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  bookmarkId: integer("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 타임라인 테이블 정의 (유튜브 영상의 타임라인 데이터)
export const timelines = pgTable("timelines", {
  id: serial("id").primaryKey(),
  digestId: integer("digest_id")
    .notNull()
    .references(() => digests.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(), // TimelineGroup[] 형태의 JSON 데이터
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 타입 정의
export type Digest = typeof digests.$inferSelect;
export type NewDigest = typeof digests.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type TimelineBookmark = typeof timelineBookmarks.$inferSelect;
export type NewTimelineBookmark = typeof timelineBookmarks.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type FolderBookmark = typeof folderBookmarks.$inferSelect;
export type NewFolderBookmark = typeof folderBookmarks.$inferInsert;

export type Timeline = typeof timelines.$inferSelect;
export type NewTimeline = typeof timelines.$inferInsert;
