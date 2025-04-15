## 📥 Step 1: 자막 원본 수집

### 방법:

- `youtube-caption-scraper` (Node.js)

### 수집 형태 예시:

```json
[
  {
    "start": 3.5,
    "duration": 2.0,
    "text": "안녕하세요, 오늘은 GPT에 대해 이야기해보겠습니다."
  },
  {
    "start": 6.0,
    "duration": 2.5,
    "text": "GPT는 자연어 처리 모델입니다."
  }
]
```

---

## 🧮 Step 2: 자막 파싱 → 타임라인 분할

## 🧠 타임라인(5분 단위)으로 자막 나누는 방식

```
const TIMELINE_SECONDS = 5 * 60; // 300초

const timelineMap = {};

captions.forEach(caption => {
  const groupIndex = Math.floor(caption.start / TIMELINE_SECONDS);
  const startTime = groupIndex * TIMELINE_SECONDS;
  const endTime = startTime + TIMELINE_SECONDS;

  const rangeLabel = `${secondsToTimestamp(startTime)} - ${secondsToTimestamp(endTime)}`;

  if (!timelineMap[rangeLabel]) {
    timelineMap[rangeLabel] = [];
  }

  timelineMap[rangeLabel].push({
    start: secondsToTimestamp(caption.start),
    end: secondsToTimestamp(caption.start + caption.dur),
    startSeconds: caption.start,
    text: caption.text
  });
});

```

### `secondsToTimestamp()` 유틸 예시:

```
function secondsToTimestamp(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

```

- `grouped`는 다음과 같은 구조가 됩니다:

```
{
  "00:00 - 05:00": [
    { start: "00:03", end: "00:05", text: "안녕하세요..." },
    ...
  ],
  "05:00 - 10:00": [ ... ]
}

```

---

## ✅ 최종 데이터 예시

```
[
  {
    range: "00:00 - 05:00",
    subtitles: [
      { start: "00:01", end: "00:03", text: "안녕하세요...", startSeconds: 1.5 },
      ...
    ]
  },
  {
    range: "05:00 - 10:00",
    subtitles: [
      { start: "05:10", end: "05:13", text: "GPT 구조를 살펴보자...", startSeconds: 310.0 },
      ...
    ]
  }
]

```

이 데이터를 아코디언 그룹 UI에 그대로 전달하면 됩니다.

---

## ✅ 정확한 타임라인 분할 기준

| 기준                           | 설명                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| 5분 = 300초                    | 자막의 `start` 기준으로 그룹 구분                              |
| `start`는 포함, `end`는 미포함 | 예: 299.9초까지는 `00:00 - 05:00`, 300초부터는 `05:00 - 10:00` |
| 길이 0인 자막은 제외           | 보통 잘린 자막이므로 제거하는 것이 좋음                        |

## ✅ 타임라인 기능 구조 정의

### 🎯 원하는 형태

▼ 00:00 - 5:00
[00:00 - 00:20] "안녕하세요, 오늘은 GPT에 대해 이야기해보겠습니다." 🔖
[00:20 - 00:45] "GPT는 자연어 처리 모델로, 다양한 언어 작업에 사용됩니다." 🔖

▼ 05:00 - 10:00
[05:00 - 05:30] "이제 GPT의 구조에 대해 알아보겠습니다." 🔖
[05:30 - 6:00] "먼저, 입력 토큰이 임베딩 레이어를 통과합니다." 🔖

```

---

## ✅ 전체 흐름 요약

```

A[YouTube 자막 원본 수집 (srt, transcript)] --> B[자막 파싱: startTime, endTime, text]
B --> C[5분 단위 타임라인 그룹핑]
C --> D[타임라인 내 개별 자막 블록 정리]
D --> E[프론트에서 타임라인/자막 렌더링]

````

### 🔹 [2] 타임라인 아코디언 (시간대별 그룹)

- **컴포넌트**: `TimelineAccordion.tsx`
- **사용 컴포넌트**: ShadCN `<Accordion />`, `<AccordionItem />`
- **시간대 그룹 (예: 00:00~5:00)** 단위로 아코디언 구분

```tsx
<Accordion type="multiple">
  {timelineGroups.map((group) => (
    <AccordionItem value={group.range}>
      <AccordionTrigger>{group.range}</AccordionTrigger>
      <AccordionContent>
        {group.subtitles.map((block) => (
          <SubtitleBlock key={block.start} {...block} />
        ))}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>

````
