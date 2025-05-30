
# 🚀 TubeNote – 유튜브 요약 & 다국어 타임라인 학습 도구

**TubeNote**는 유튜브 영상을 AI가 자동으로 요약하고, 영상의 중요한 장면을 타임라인으로 저장하고 복습할 수 있도록 도와주는 스마트한 콘텐츠 정리 도구입니다.  
AI가 자막을 분석하여 **자연스럽고 정확한 다국어 번역**까지 제공하여, 전 세계 누구나 언어 장벽 없이 유익한 영상을 학습할 수 있게 지원합니다.

---

## 🎯 주요 기능 소개

| 기능                             | 설명                                                                 |
|----------------------------------|----------------------------------------------------------------------|
| 🔗 유튜브 링크 입력              | 영상 링크만 넣으면 요약이 뚝딱!                                      |
| ✨ AI 자동 요약                  | 자막 기반으로 중요한 핵심 내용을 요약                                |
| 🧭 타임라인 저장 기능            | 유익한 장면을 타임라인으로 저장하고 클릭 시 영상 해당 시점으로 이동 |
| 📝 블로그 스타일 요약 페이지     | 요약 + 타임라인 + 번역을 보기 좋게 정리                              |
| 🌍 전 세계 언어 번역 지원       | 자막 언어 자동 감지 및 사용자가 선택한 언어로 자연스럽게 번역       |
| 🔖 태그 자동 생성 및 검색        | 콘텐츠의 주제를 자동으로 추출하고 필터링 가능                        |
| 💾 마이페이지 콘텐츠 관리        | 내가 요약한 영상들을 저장하고 다시 볼 수 있는 개인 공간 제공         |
| 📤 공유 기능                     | 타인과 요약 및 타임라인 정보를 쉽게 공유할 수 있음                   |

---

## 👀 사용 예시

1. TubeNote 홈페이지에 접속하여 유튜브 링크를 입력합니다.
2. AI가 자막을 분석하여 자동 요약을 생성합니다.
3. 요약된 블로그 페이지에서 타임라인을 확인하고 원하는 지점을 저장합니다.
4. 번역 언어를 선택하여 자막을 자연스럽게 확인하고 학습합니다.
5. 저장된 콘텐츠는 마이페이지에서 다시 열람하거나 공유할 수 있습니다.

---

## 🛠️ 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/yourusername/link-digest.git
cd link-digest
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local`로 만들고, 필요한 API 키를 설정합니다.

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에는 다음 정보를 입력합니다:

```env
YOUTUBE_API_KEY=여기에_발급받은_유튜브_API_키
OPENAI_API_KEY=여기에_발급받은_OpenAI_API_키
```

> ❗ **주의:** `.env.local` 파일은 외부에 공개되지 않도록 주의하세요!

### 4. 개발 서버 실행

```bash
npm run dev
```

→ 개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

---

## 🔐 API 키 발급 가이드

### 🎥 YouTube Data API Key

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. YouTube Data API v3 사용 설정
4. API 키 생성 → `.env.local`에 추가

### 💡 OpenAI API Key

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 및 로그인
3. API 키 발급 → `.env.local`에 추가

---

## 🧱 기술 스택

| 항목             | 내용                                             |
|------------------|--------------------------------------------------|
| 프레임워크        | [Next.js](https://nextjs.org/)                  |
| 스타일링         | [Tailwind CSS](https://tailwindcss.com/)        |
| 언어             | TypeScript                                       |
| AI 요약/번역     | OpenAI GPT / Gemini API 사용                     |
| 자막 수집        | youtube-transcript-api                           |
| 상태 관리 / API  | React Query, REST API                            |

---

## 📚 개발자 참고 사항

- 코드 구조는 `app/`, `components/`, `lib/` 등으로 분리되어 있으며, 각 기능별로 깔끔하게 나뉘어 있습니다.
- 타임라인 저장 시 `localStorage`를 기반으로 저장하며, 로그인 기능이 추가될 경우 DB 연동도 가능합니다.
- 자동 요약/번역 처리에는 비용이 발생할 수 있으니, 호출 빈도나 캐싱 전략에 유의하세요.

---

## ✅ 라이센스

본 프로젝트는 [MIT License](./LICENSE)를 따릅니다.  
자유롭게 사용하시되, 라이센스를 지켜주세요!

---

## 🙌 기여하기

이 프로젝트는 오픈소스로, 누구나 환영입니다!

1. 이슈 생성 → 버그나 개선 사항을 자유롭게 올려주세요
2. 포크 → 기능 추가 또는 개선 후 PR 요청
3. 함께 더 나은 TubeNote를 만들어가요!

---

## 💌 문의

궁금한 점이 있다면 언제든지 [issues](https://github.com/yourusername/link-digest/issues)를 통해 문의주세요!
