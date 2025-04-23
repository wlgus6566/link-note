import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * ISO 8601 형식의 duration을 mm:ss 또는 hh:mm:ss 형식으로 변환하는 함수
 */
export function formatDuration(isoDuration: string): string {
  if (!isoDuration) return "00:00";

  // PT1H30M20S와 같은 형식에서 시간, 분, 초 추출
  const hourMatch = isoDuration.match(/(\d+)H/);
  const minuteMatch = isoDuration.match(/(\d+)M/);
  const secondMatch = isoDuration.match(/(\d+)S/);

  const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0;
  const seconds = secondMatch ? Number.parseInt(secondMatch[1]) : 0;

  // 시간이 있는 경우: hh:mm:ss
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // 시간이 없는 경우: mm:ss
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * ISO8601 형식의 duration을 초로 변환하는 함수
 */
export function convertISO8601ToSeconds(duration: string): number {
  if (!duration) return 0;

  let seconds = 0;

  // 시간 추출
  const hourMatch = duration.match(/(\d+)H/);
  if (hourMatch) {
    seconds += parseInt(hourMatch[1]) * 60 * 60;
  }

  // 분 추출
  const minuteMatch = duration.match(/(\d+)M/);
  if (minuteMatch) {
    seconds += parseInt(minuteMatch[1]) * 60;
  }

  // 초 추출
  const secondMatch = duration.match(/(\d+)S/);
  if (secondMatch) {
    seconds += parseInt(secondMatch[1]);
  }

  return seconds;
}

/**
 * 조회수 포맷 함수 - 10000 -> 1만회, 1000 -> 1천회
 */
export function formatViewCount(count: string): string {
  if (!count) return "0";

  const num = Number.parseInt(count, 10);
  if (isNaN(num)) return "0";

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만회`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}천회`;
  }

  return `${num}회`;
}

/**
 * 날짜 포맷 함수 - YYYY-MM-DD -> MM월 DD일
 */
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}
