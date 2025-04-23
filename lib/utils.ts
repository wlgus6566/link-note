import { useUserStore } from "@/store/userStore";
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
 * 사용자 이름에서 이니셜을 가져오는 함수
 */
export const getUserInitials = (): string => {
  const { user, isAuthenticated } = useUserStore.getState();

  if (!isAuthenticated || !user || !user.name) return "게";

  // 한글 이름이면 성만, 영문 이름이면 첫 글자만
  if (/^[가-힣]+$/.test(user.name)) {
    // 한글 이름
    return user.name.charAt(0);
  } else {
    // 영문 이름 또는 기타
    const names = user.name.split(" ");
    if (names.length > 1) {
      // 이름이 공백으로 구분되어 있으면 첫 번째와 두 번째 단어의 첫 글자
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    } else {
      // 한 단어 이름이면 첫 글자
      return names[0].charAt(0).toUpperCase();
    }
  }
};

/**
 * 조회수를 포맷팅하는 함수
 * @param viewCount 조회수
 * @returns 포맷팅된 조회수 문자열 (예: 1.2만회, 3.5천회)
 */
export const formatViewCount = (viewCount: number): string => {
  if (viewCount >= 10000) {
    return `${(viewCount / 10000).toFixed(1)}만회`;
  } else if (viewCount >= 1000) {
    return `${(viewCount / 1000).toFixed(1)}천회`;
  } else {
    return `${viewCount}회`;
  }
};

/**
 * 날짜를 상대적 시간으로 변환하는 함수
 * @param dateString ISO 8601 형식의 날짜 문자열
 * @returns 상대적 시간 문자열 (예: 1일 전, 2주 전, 3개월 전)
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // 시간 단위 (밀리초)
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    return "방금 전";
  } else if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes}분 전`;
  } else if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}시간 전`;
  } else if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days}일 전`;
  } else if (diffMs < month) {
    const weeks = Math.floor(diffMs / week);
    return `${weeks}주 전`;
  } else if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `${months}개월 전`;
  } else {
    const years = Math.floor(diffMs / year);
    return `${years}년 전`;
  }
};

/**
 * 날짜 포맷 함수 - YYYY-MM-DD -> MM월 DD일
 */
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}
