import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";

export default function DigestPage({ params }: { params: { id: string } }) {
  // 샘플 데이터 (실제로는 ID를 기반으로 데이터를 가져와야 함)
  const digest = {
    id: params.id,
    title: "인공지능의 미래: 2025년 전망",
    source: "YouTube",
    sourceUrl: "https://youtube.com/watch?v=example",
    date: "2025년 4월 10일",
    author: {
      name: "테크 인사이트",
      role: "AI 전문가",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    readTime: "5분 소요",
    tags: ["AI", "기술", "미래", "트렌드"],
    image: "/placeholder.svg?height=400&width=800",
    summary:
      "이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.",
    keyPoints: [
      "생성형 AI는 텍스트와 이미지를 넘어 동영상 및 3D 콘텐츠 생성으로 확장될 것",
      "의료 AI는 질병 진단 및 신약 개발 분야에서 획기적인 발전을 이룰 것",
      "레벨 4 이상의 자율주행 기술이 더 넓은 상업적 채택을 볼 것",
      "개인화된 AI 비서가 일상 생활의 모든 측면으로 확장될 것",
    ],
    content: `
      <h2>인공지능 기술의 현재와 미래</h2>
      <p>2025년 인공지능 기술은 이전보다 더욱 발전된 형태로 우리 일상에 깊숙이 자리 잡게 될 것으로 예상됩니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.</p>
      
      <p>최근 몇 년간 인공지능 기술은 놀라운 속도로 발전해왔습니다. GPT와 같은 대규모 언어 모델은 인간과 거의 구분할 수 없는 텍스트를 생성할 수 있게 되었고, 이미지 생성 AI는 예술가들의 작업을 보완하거나 때로는 대체하기도 합니다.</p>
      
      <h3>주요 발전 분야</h3>
      <p>여러 분야에서 빠른 발전이 이루어지고 있습니다:</p>
      <ul>
        <li>생성형 AI의 고도화: 텍스트, 이미지를 넘어 동영상, 3D 콘텐츠 생성까지 확장</li>
        <li>의료 AI: 질병 진단 및 신약 개발 분야에서의 혁신적 발전</li>
        <li>자율주행: 레벨 4 이상의 자율주행 기술 상용화 확대</li>
        <li>개인화된 AI 비서: 일상 생활 전반에 걸친 지능형 비서 서비스</li>
      </ul>
      
      <p>특히 생성형 AI의 발전은 콘텐츠 제작 산업에 혁명적인 변화를 가져올 것으로 예상됩니다. 현재 텍스트와 이미지 생성에 주로 사용되는 AI 기술이 앞으로는 고품질의 동영상과 3D 모델까지 생성할 수 있게 될 것입니다. 이는 영화, 게임, 광고 등 다양한 산업에 큰 영향을 미칠 것입니다.</p>
      
      <h3>산업에 미치는 영향</h3>
      <p>AI 기술의 발전은 다양한 산업 분야에 혁신을 가져올 것으로 예상됩니다. 특히 제조업, 의료, 금융, 교육 분야에서 큰 변화가 예상됩니다.</p>
      
      <p>의료 분야에서는 AI를 활용한 질병 진단 시스템이 더욱 정확해지고, 신약 개발 과정이 크게 단축될 것입니다. 이미 일부 AI 시스템은 특정 질병의 진단에서 인간 의사보다 높은 정확도를 보이고 있으며, 이러한 추세는 더욱 강화될 것입니다.</p>
      
      <p>금융 분야에서는 AI 기반 투자 자문과 리스크 관리 시스템이 보편화될 것이며, 교육 분야에서는 개인화된 학습 경험을 제공하는 AI 튜터가 널리 사용될 것입니다.</p>
      
      <h3>윤리적 고려사항</h3>
      <p>기술의 발전과 함께 AI 윤리, 개인정보 보호, 일자리 변화 등에 대한 사회적 논의도 활발해질 것으로 보입니다.</p>
      
      <p>AI 기술이 발전함에 따라 데이터 프라이버시, 알고리즘 편향성, 자동화로 인한 일자리 감소 등의 문제가 더욱 중요해질 것입니다. 이에 대응하기 위해 국제적인 규제 프레임워크와 윤리 지침이 마련될 필요가 있습니다.</p>
      
      <p>또한 AI 기술의 혜택이 사회 전체에 고르게 분배되도록 하는 정책적 노력도 중요해질 것입니다. 기술 발전으로 인한 생산성 향상이 소수에게만 집중되지 않도록 하는 사회적 합의가 필요할 것입니다.</p>
      
      <h3>결론</h3>
      <p>2025년까지 AI 기술은 우리 삶의 거의 모든 측면에 영향을 미치게 될 것입니다. 이러한 변화에 적응하고 혜택을 최대화하기 위해서는 기술적 발전뿐만 아니라 사회적, 윤리적 측면에서의 준비도 필요합니다. AI의 미래는 밝지만, 그 여정에는 신중한 접근이 요구됩니다.</p>
    `,
    relatedPosts: [
      {
        id: 2,
        title: "AI와 일자리의 미래: 위협인가, 기회인가?",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        id: 3,
        title: "생성형 AI의 윤리적 문제와 해결 방안",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        id: 4,
        title: "의료 AI의 현재와 미래: 진단부터 치료까지",
        image: "/placeholder.svg?height=200&width=400",
      },
    ],
    comments: [
      {
        id: 1,
        author: "김기술",
        avatar: "/placeholder.svg?height=50&width=50",
        date: "2025년 4월 11일",
        content: "정말 유익한 글이네요. 특히 의료 AI 부분이 흥미로웠습니다.",
        likes: 12,
      },
      {
        id: 2,
        author: "이미래",
        avatar: "/placeholder.svg?height=50&width=50",
        date: "2025년 4월 12일",
        content:
          "AI 윤리에 대한 부분이 더 자세히 다뤄졌으면 좋겠어요. 기술 발전만큼 중요한 부분이라고 생각합니다.",
        likes: 8,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-5">
          <Button variant="ghost" size="sm" className="p-0" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-5 py-8">
          {/* 태그 및 메타데이터 */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {digest.tags.map((tag) => (
              <Link href={`/tag/${tag}`} key={tag}>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  {tag}
                </span>
              </Link>
            ))}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {digest.title}
          </h1>

          {/* 저자 정보 및 메타데이터 */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={digest.author.avatar || "/placeholder.svg"}
                alt={digest.author.name}
              />
              <AvatarFallback>{digest.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{digest.author.name}</div>
              <div className="text-sm text-gray-500">{digest.author.role}</div>
            </div>
            <div className="flex flex-col items-end text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{digest.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{digest.readTime}</span>
              </div>
            </div>
          </div>

          {/* 메인 이미지 */}
          <div className="relative h-64 md:h-80 w-full mb-8 rounded-xl overflow-hidden">
            <Image
              src={digest.image || "/placeholder.svg"}
              alt={digest.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 요약 */}
          <div className="mb-8 p-5 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-base italic text-gray-700">{digest.summary}</p>
          </div>

          {/* 목차 */}
          <div className="mb-8 p-5 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">목차</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <Link
                  href="#current-future"
                  className="text-blue-600 hover:underline"
                >
                  인공지능 기술의 현재와 미래
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <Link
                  href="#key-areas"
                  className="text-blue-600 hover:underline"
                >
                  주요 발전 분야
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <Link
                  href="#industry-impact"
                  className="text-blue-600 hover:underline"
                >
                  산업에 미치는 영향
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <Link
                  href="#ethical-considerations"
                  className="text-blue-600 hover:underline"
                >
                  윤리적 고려사항
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <Link
                  href="#conclusion"
                  className="text-blue-600 hover:underline"
                >
                  결론
                </Link>
              </li>
            </ul>
          </div>

          {/* 본문 콘텐츠 */}
          <div
            className="prose prose-blue prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: digest.content }}
          />

          {/* 키 포인트 */}
          <div className="mb-8 p-5 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">핵심 포인트</h3>
            <ul className="space-y-3">
              {digest.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-medium text-blue-700">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 소셜 공유 및 반응 */}
          <div className="flex items-center justify-between py-4 border-t border-b mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>좋아요</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span>공유하기</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>
          </div>

          {/* 원본 콘텐츠 링크 */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">원본 콘텐츠</h3>
            <Link
              href={digest.sourceUrl}
              target="_blank"
              className="flex items-center justify-center w-full p-3.5 bg-gray-100 rounded-xl text-sm text-blue-600 font-medium hover:bg-gray-200 transition-colors"
            >
              원본 보기
            </Link>
          </div>
        </article>
      </main>

      <BottomNav />
    </div>
  );
}
