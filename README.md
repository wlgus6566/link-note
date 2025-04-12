# Link Digest

콘텐츠 링크를 스마트하게 정리하고 블로그 형식으로 요약해주는 서비스입니다.

## 주요 기능

- 유튜브 링크 입력 시 영상 콘텐츠를 자동으로 블로그 형식으로 변환
- AI를 활용한 핵심 내용 요약
- 태그 자동 생성
- 주요 장면 프레임 캡처 (준비 중)
- 다양한 플랫폼 지원 (인스타그램, Medium 등 - 준비 중)

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
