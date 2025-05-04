# TubeNote

**TubeNote**는 유튜브 링크를 입력하면 AI가 영상의 핵심 내용을 자동으로 요약하고, 블로그 형식으로 정리해주는 스마트 콘텐츠 툴입니다.  
중요한 장면을 타임라인으로 복습하고, 전 세계 언어로 자연스럽게 번역된 콘텐츠를 언제 어디서나 확인할 수 있습니다.

## 주요 기능

- 유튜브 링크 입력 시 자동 요약 블로그 생성
- AI 기반 핵심 내용 요약
- 타임라인 제공
- 태그 자동 생성
- 전 세계 언어로 자연스럽게 번역 지원

## 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/link-digest.git
cd link-digest
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

3. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 필요한 API 키를 입력합니다.

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 다음 변수를 설정합니다:

- `YOUTUBE_API_KEY`: YouTube Data API 키
- `OPENAI_API_KEY`: OpenAI API 키

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

## 사용 방법

1. 홈페이지에서 유튜브 링크를 입력합니다.
2. "요약하기" 버튼을 클릭합니다.
3. 요약 생성이 완료되면 자동으로 요약 페이지로 이동합니다.
4. 생성된 블로그 형식의 내용을 확인합니다.

## API 키 설정 방법

### YouTube Data API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 새 프로젝트를 생성합니다.
3. YouTube Data API v3를 사용 설정합니다.
4. API 키를 생성합니다.
5. `.env.local` 파일에 `YOUTUBE_API_KEY=발급받은_키`를 추가합니다.

### OpenAI API 키 발급

1. [OpenAI 플랫폼](https://platform.openai.com/)에 계정을 생성합니다.
2. API 키를 생성합니다.
3. `.env.local` 파일에 `OPENAI_API_KEY=발급받은_키`를 추가합니다.

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- YouTube Data API
- youtube-transcript-api

## 라이센스

[MIT 라이센스](LICENSE)
