import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 요청 스키마 정의
const requestSchema = z.object({
  title: z.string(),
  summary: z.string(),
  readTime: z.string(),
  tags: z.array(z.string()),
  content: z.string(),
  image_suggestions: z
    .array(
      z.object({
        caption: z.string(),
        placement: z.string(),
      })
    )
    .optional(),
  sourceUrl: z.string().url(),
  sourceType: z.enum(["YouTube", "Instagram", "Medium", "Other"]),
});

// 임시 저장소 (실제로는 데이터베이스를 사용해야 함)
// 기본 샘플 데이터를 추가하여 서버 재시작 시에도 최소 하나의 요약이 있도록 함
export let digests: any[] = [
  {
    id: 1,
    title: "인공지능의 미래: 2025년 전망",
    summary:
      "이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.",
    readTime: "5분 소요",
    tags: ["AI", "기술", "미래", "트렌드"],
    content: `
      <h2>인공지능 기술의 현재와 미래</h2>
      <p>2025년 인공지능 기술은 이전보다 더욱 발전된 형태로 우리 일상에 깊숙이 자리 잡게 될 것으로 예상됩니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.</p>
      
      <p>최근 몇 년간 인공지능 기술은 놀라운 속도로 발전해왔습니다. GPT와 같은 대규모 언어 모델은 인간과 거의 구분할 수 없는 텍스트를 생성할 수 있게 되었고, 이미지 생성 AI는 예술가들의 작업을 보완하거나 때로는 대체하기도 합니다.</p>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="AI 생성 이미지 예시" />
        <figcaption>AI로 생성된 이미지 예시. 기술이 발전함에 따라 더욱 정교한 이미지 생성이 가능해질 것입니다.</figcaption>
      </figure>
      
      <h3>주요 발전 분야</h3>
      <p>여러 분야에서 빠른 발전이 이루어지고 있습니다:</p>
      <ul>
        <li>생성형 AI의 고도화: 텍스트, 이미지를 넘어 동영상, 3D 콘텐츠 생성까지 확장</li>
        <li>의료 AI: 질병 진단 및 신약 개발 분야에서의 혁신적 발전</li>
        <li>자율주행: 레벨 4 이상의 자율주행 기술 상용화 확대</li>
        <li>개인화된 AI 비서: 일상 생활 전반에 걸친 지능형 비서 서비스</li>
      </ul>
      
      <p>특히 생성형 AI의 발전은 콘텐츠 제작 산업에 혁명적인 변화를 가져올 것으로 예상됩니다. 현재 텍스트와 이미지 생성에 주로 사용되는 AI 기술이 앞으로는 고품질의 동영상과 3D 모델까지 생성할 수 있게 될 것입니다. 이는 영화, 게임, 광고 등 다양한 산업에 큰 영향을 미칠 것입니다.</p>
      
      <blockquote>
        <p>"AI는 단순한 도구가 아니라 창의적 파트너로 진화하고 있습니다. 앞으로 5년 내에 우리는 AI와 인간의 협업이 만들어내는 놀라운 결과물들을 보게 될 것입니다."</p>
        <cite>- 김인공, AI 연구소장</cite>
      </blockquote>
      
      <h3>산업에 미치는 영향</h3>
      <p>AI 기술의 발전은 다양한 산업 분야에 혁신을 가져올 것으로 예상됩니다. 특히 제조업, 의료, 금융, 교육 분야에서 큰 변화가 예상됩니다.</p>
      
      <p>의료 분야에서는 AI를 활용한 질병 진단 시스템이 더욱 정확해지고, 신약 개발 과정이 크게 단축될 것입니다. 이미 일부 AI 시스템은 특정 질병의 진단에서 인간 의사보다 높은 정확도를 보이고 있으며, 이러한 추세는 더욱 강화될 것입니다.</p>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="의료 AI 시스템" />
        <figcaption>의료 AI 시스템은 방대한 의료 데이터를 분석하여 정확한 진단을 내리는 데 도움을 줍니다.</figcaption>
      </figure>
      
      <p>금융 분야에서는 AI 기반 투자 자문과 리스크 관리 시스템이 보편화될 것이며, 교육 분야에서는 개인화된 학습 경험을 제공하는 AI 튜터가 널리 사용될 것입니다.</p>
      
      <h3>윤리적 고려사항</h3>
      <p>기술의 발전과 함께 AI 윤리, 개인정보 보호, 일자리 변화 등에 대한 사회적 논의도 활발해질 것으로 보입니다.</p>
      
      <p>AI 기술이 발전함에 따라 데이터 프라이버시, 알고리즘 편향성, 자동화로 인한 일자리 감소 등의 문제가 더욱 중요해질 것입니다. 이에 대응하기 위해 국제적인 규제 프레임워크와 윤리 지침이 마련될 필요가 있습니다.</p>
      
      <p>또한 AI 기술의 혜택이 사회 전체에 고르게 분배되도록 하는 정책적 노력도 중요해질 것입니다. 기술 발전으로 인한 생산성 향상이 소수에게만 집중되지 않도록 하는 사회적 합의가 필요할 것입니다.</p>
      
      <h3>결론</h3>
      <p>2025년까지 AI 기술은 우리 삶의 거의 모든 측면에 영향을 미치게 될 것입니다. 이러한 변화에 적응하고 혜택을 최대화하기 위해서는 기술적 발전뿐만 아니라 사회적, 윤리적 측면에서의 준비도 필요합니다. AI의 미래는 밝지만, 그 여정에는 신중한 접근이 요구됩니다.</p>
    `,
    sourceUrl: "https://youtube.com/watch?v=example",
    sourceType: "YouTube",
    date: new Date().toISOString(),
    author: {
      name: "AI 요약",
      role: "자동 생성",
      avatar: "/placeholder.svg",
    },
    image: "/placeholder.svg?height=400&width=800",
    image_suggestions: [
      {
        caption: "AI 생성 이미지 예시",
        placement: "도입부 후",
      },
      {
        caption: "의료 AI 시스템",
        placement: "산업에 미치는 영향 섹션",
      },
    ],
  },
  {
    id: 2,
    title: "건강한 식습관을 위한 10가지 팁",
    summary:
      "영양사가 추천하는 건강한 식습관을 위한 10가지 실천 가능한 팁을 소개합니다. 균형 잡힌 식단과 규칙적인 식사 시간의 중요성이 강조됩니다.",
    readTime: "4분 소요",
    tags: ["건강", "식습관", "영양", "웰빙", "생활습관"],
    content: `
      <h2>건강한 식습관의 중요성</h2>
      <p>매일 우리가 섭취하는 음식은 신체 건강뿐만 아니라 정신 건강에도 큰 영향을 미칩니다. 균형 잡힌 식단은 에너지를 유지하고, 면역력을 강화하며, 다양한 질병을 예방하는 데 도움이 됩니다.</p>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="다양한 건강식 재료들" />
        <figcaption>다양한 색의 과일과 채소를 포함하는 것이 건강한 식단의 기본입니다.</figcaption>
      </figure>
      
      <h3>건강한 식습관을 위한 10가지 팁</h3>
      <ol>
        <li><strong>다양한 색의 과일과 채소 섭취하기</strong> - 서로 다른 색상의 과일과 채소는 각각 다른 영양소를 제공합니다.</li>
        <li><strong>규칙적인 식사 시간 유지하기</strong> - 일정한 시간에 식사를 하면 대사 건강에 도움이 됩니다.</li>
        <li><strong>단백질 균형 맞추기</strong> - 육류, 생선, 콩류, 견과류 등 다양한 단백질 공급원을 활용하세요.</li>
        <li><strong>가공식품 줄이기</strong> - 가공식품은 대체로 나트륨, 설탕, 불필요한 첨가물이 많습니다.</li>
        <li><strong>물 충분히 마시기</strong> - 하루 약 2리터의 물을 마시는 것이 이상적입니다.</li>
        <li><strong>천천히 꼭꼭 씹어 먹기</strong> - 식사 속도가 빠르면 과식하기 쉽습니다.</li>
        <li><strong>통곡물 선택하기</strong> - 백미나 흰 밀가루보다 통곡물이 영양가가 높습니다.</li>
        <li><strong>건강한 지방 섭취하기</strong> - 올리브 오일, 아보카도, 견과류의 불포화지방을 선택하세요.</li>
        <li><strong>설탕 섭취 제한하기</strong> - 음료수나 디저트의 당분은 건강에 부정적인 영향을 미칠 수 있습니다.</li>
        <li><strong>식품 라벨 읽는 습관 들이기</strong> - 무엇을 먹는지 정확히 알고 선택하는 것이 중요합니다.</li>
      </ol>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="균형 잡힌 한 끼 식사" />
        <figcaption>균형 잡힌 식사 접시는 절반은 채소, 1/4은 단백질, 1/4은 통곡물로 구성하는 것이 좋습니다.</figcaption>
      </figure>
      
      <h3>작은 변화로 시작하기</h3>
      <p>모든 변화를 한 번에 시도하지 마세요. 한 번에 한 가지씩 작은 변화를 시작하면 지속 가능한 식습관을 형성할 수 있습니다. 예를 들어, 첫 주에는 물을 더 많이 마시는 것부터 시작하고, 다음 주에는 과일과 채소를 한 가지씩 더 추가해 보세요.</p>
      
      <blockquote>
        <p>"건강한 식습관은 하루아침에 형성되지 않습니다. 작은 변화의 지속적인 실천이 중요합니다."</p>
        <cite>- 김영양, 영양학 전문가</cite>
      </blockquote>
      
      <h3>결론</h3>
      <p>건강한 식습관은 복잡하거나 어려운 것이 아닙니다. 균형 잡힌 식단, 적절한 양, 다양성이 핵심입니다. 오늘부터 위의 팁들을 하나씩 실천하며 건강한 식습관을 만들어보세요. 당신의 몸은 분명 긍정적인 변화로 응답할 것입니다.</p>
    `,
    sourceUrl: "https://youtube.com/watch?v=healthfood-example",
    sourceType: "YouTube",
    date: new Date().toISOString(),
    author: {
      name: "AI 요약",
      role: "자동 생성",
      avatar: "/placeholder.svg",
    },
    image: "/placeholder.svg?height=400&width=800",
    image_suggestions: [
      {
        caption: "다양한 건강식 재료들",
        placement: "도입부 후",
      },
      {
        caption: "균형 잡힌 한 끼 식사",
        placement: "10가지 팁 목록 후",
      },
    ],
  },
  {
    id: 3,
    title: "효과적인 시간 관리 방법: 생산성 높이기",
    summary:
      "바쁜 현대 생활에서 시간을 효율적으로 관리하는 방법에 대한 실용적인 팁을 제공합니다. 우선순위 설정과 집중력 향상 기법이 중점적으로 다루어집니다.",
    readTime: "6분 소요",
    tags: ["생산성", "시간관리", "자기계발", "집중력", "효율성"],
    content: `
      <h2>효과적인 시간 관리의 중요성</h2>
      <p>시간은 누구에게나 공평하게 주어지는 자원이지만, 어떻게 활용하느냐에 따라 삶의 질과 성취도가 크게 달라집니다. 효과적인 시간 관리는 단순히 더 많은 일을 처리하는 것이 아니라, 중요한 일에 집중하여 더 의미 있는 결과를 만들어내는 것입니다.</p>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="시간 관리 도구들" />
        <figcaption>디지털 도구와 아날로그 방식을 결합한 시간 관리 시스템이 효과적입니다.</figcaption>
      </figure>
      
      <h3>효과적인 시간 관리를 위한 핵심 원칙</h3>
      <ol>
        <li><strong>우선순위 설정하기</strong> - 아이젠하워 매트릭스를 활용해 중요하고 긴급한 일부터 처리하세요.</li>
        <li><strong>작업 시간 예측하기</strong> - 각 작업에 소요되는 시간을 현실적으로 예측하고 버퍼 시간을 추가하세요.</li>
        <li><strong>시간 블록 활용하기</strong> - 유사한 작업을 묶어서 처리하면 전환 비용을 줄일 수 있습니다.</li>
        <li><strong>방해 요소 제거하기</strong> - 집중 작업 시 알림을 끄고 방해받지 않는 환경을 조성하세요.</li>
        <li><strong>포모도로 기법 활용하기</strong> - 25분 집중, 5분 휴식의 리듬으로 작업 효율성을 높이세요.</li>
        <li><strong>에너지 관리하기</strong> - 자신의 에너지가 가장 높은 시간대에 중요한 일을 배치하세요.</li>
        <li><strong>위임하는 법 배우기</strong> - 모든 일을 직접 할 필요는 없습니다. 적절히 위임하고 협업하세요.</li>
        <li><strong>일정 정기적으로 검토하기</strong> - 주간, 월간 단위로 일정을 검토하고 조정하세요.</li>
      </ol>
      
      <figure>
        <img src="/placeholder.svg?height=400&width=800" alt="포모도로 기법 다이어그램" />
        <figcaption>포모도로 기법은 집중과 휴식의 균형을 통해 지속적인 생산성을 유지하는 데 도움이 됩니다.</figcaption>
      </figure>
      
      <h3>디지털 도구 활용하기</h3>
      <p>다양한 디지털 도구가 시간 관리를 도울 수 있습니다. 할 일 목록 앱, 캘린더 앱, 포모도로 타이머, 프로젝트 관리 도구 등을 자신의 업무 스타일에 맞게 활용하세요. 중요한 것은 도구 자체가 아니라, 일관된 시스템을 구축하고 유지하는 것입니다.</p>
      
      <blockquote>
        <p>"시간 관리는 실제로는 자기 관리입니다. 우리의 선택, 우선순위, 그리고 행동이 시간을 어떻게 사용할지 결정합니다."</p>
        <cite>- 피터 드러커, 경영학자</cite>
      </blockquote>
      
      <h3>나쁜 습관 극복하기</h3>
      <p>시간 관리를 방해하는 가장 큰 요소 중 하나는 나쁜 습관입니다. 미루는 습관, 과도한 완벽주의, 멀티태스킹 등이 대표적입니다. 이러한 습관을 인식하고 작은 단계부터 개선해 나가는 것이 중요합니다.</p>
      
      <h3>결론</h3>
      <p>효과적인 시간 관리는 단기간에 완성되는 것이 아니라 지속적인 실천과 개선을 통해 발전시켜 나가는 기술입니다. 자신에게 맞는 시스템을 찾고, 꾸준히 실천하며, 정기적으로 점검하는 과정을 통해 더 생산적이고 균형 잡힌 삶을 만들어 나갈 수 있습니다.</p>
    `,
    sourceUrl: "https://youtube.com/watch?v=timemanagement-example",
    sourceType: "YouTube",
    date: new Date().toISOString(),
    author: {
      name: "AI 요약",
      role: "자동 생성",
      avatar: "/placeholder.svg",
    },
    image: "/placeholder.svg?height=400&width=800",
    image_suggestions: [
      {
        caption: "시간 관리 도구들",
        placement: "도입부 후",
      },
      {
        caption: "포모도로 기법 다이어그램",
        placement: "핵심 원칙 목록 후",
      },
    ],
  },
];

let nextId = 4; // 샘플 데이터 다음 ID부터 시작

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();

    // 요청 검증
    const digest = requestSchema.parse(body);

    // 임시 ID 생성 및 저장 (실제로는 데이터베이스에 저장)
    const savedDigest = {
      id: nextId++,
      ...digest,
      date: new Date().toISOString(),
      author: {
        name: "AI 요약",
        role: "자동 생성",
        avatar: "/placeholder.svg",
      },
    };

    digests.push(savedDigest);

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        id: savedDigest.id,
        title: savedDigest.title,
      },
    });
  } catch (error) {
    console.error("요약 저장 API 에러:", error);

    // 에러 응답 반환
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 400 }
    );
  }
}

// 저장된 모든 요약 가져오기 (테스트용)
export async function GET() {
  return NextResponse.json({
    success: true,
    data: digests,
  });
}
