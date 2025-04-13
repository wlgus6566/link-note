## 백엔드 기능명세서: 인스타그램 콘텐츠 수집 & 정리 API

### 1. **API 정의**

- **엔드포인트**: `POST /app/api/instagram/parse/route.ts`
- **기술 스택**: Next.js Route Handler
- **입력**:

  ```
  {
    url: string
  }

  ```

- **응답**:

  ```
  {
    id: string;
    title: string;
    summary: string;
    image: string; // 대표 이미지 (og:image)
    images: string[]; // carousel (최대 3장)
    author: {
      name: string;
      avatar: string;
    };
    content: string; // HTML or Markdown block
  }

  ```

### 2. **처리 로직**

1. HTML 파싱 (cheerio, puppeteer 등) 또는 비공식 scraping
2. 수집 항목:
   - `og:image` or 첫 번째 이미지 → 대표 이미지
   - carousel 이미지 최대 3장
   - 작성자 이름 및 프로필 이미지 (meta tag or HTML tag에서 추출)
   - 캡션 전체 (본문 내용)
3. Markdown or HTML 포맷으로 콘텐츠 구성
   - 도입부 + 이미지 + 캡션 나열 + 작성자 정보
4. 이미지 → Supabase Storage에 업로드
5. 전체 콘텐츠 → DB 저장 (`posts` 테이블)

### 3. **데이터베이스 설계 (`db/schema.ts`)**

```
// posts 테이블 예시
{
  id: string;
  source: 'instagram';
  url: string;
  title: string;
  caption: string;
  summary: string;
  image: string;
  images: string[];
  author_name: string;
  author_avatar: string;
  content: string; // HTML or Markdown
  created_at: timestamp;
}

```

### 4. **테스트 항목**

- [ ] 대표 이미지(og:image) 추출 여부
- [ ] 캡션 전체 수집 여부
- [ ] carousel 이미지 수집 여부
- [ ] 작성자 정보 수집 여부
- [ ] Supabase Storage 이미지 업로드 성공 여부
- [ ] 블로그 콘텐츠 포맷(JSON or Markdown) 포함 여부
- [ ] DB 저장 정상 동작 여부
- [ ] 비공개/삭제된 링크 에러 처리 여부
