import { BookmarkItem, SortType } from "@/types/digest";
import { convertISO8601ToSeconds } from "./utils";

/**
 * 북마크 정렬 함수
 *
 * @param bookmarks 정렬할 북마크 배열
 * @param sortType 정렬 타입 ('latest', 'oldest', 'popular', 'duration')
 * @returns 정렬된 북마크 배열
 */
export function sortBookmarks(
  bookmarks: BookmarkItem[],
  sortType: SortType
): BookmarkItem[] {
  let sorted = [...bookmarks];

  switch (sortType) {
    case "latest":
      // 최신순 정렬 (생성일 기준 내림차순)
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case "oldest":
      // 오래된순 정렬 (생성일 기준 오름차순)
      sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;
    case "popular":
      // 인기순 정렬 (조회수 기준 내림차순)
      sorted.sort((a, b) => {
        const viewCountA = Number(a.digests.video_info?.viewCount || 0);
        const viewCountB = Number(b.digests.video_info?.viewCount || 0);
        return viewCountB - viewCountA;
      });
      break;
    case "duration":
      // 길이순 정렬 (영상 길이 기준 내림차순)
      sorted.sort((a, b) => {
        const durationA = convertISO8601ToSeconds(
          a.digests.video_info?.duration || ""
        );
        const durationB = convertISO8601ToSeconds(
          b.digests.video_info?.duration || ""
        );
        return durationB - durationA;
      });
      break;
  }

  return sorted;
}
