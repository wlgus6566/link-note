declare module "youtube-captions-scraper" {
  export interface CaptionItem {
    start: number;
    dur: number;
    text: string;
  }

  export interface CaptionsOptions {
    videoID?: string;
    lang?: string;
  }

  export function getSubtitles(
    options: CaptionsOptions
  ): Promise<CaptionItem[]>;
}
