import rehypeRaw from "rehype-raw";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
// import { useRouter } ... 이 줄이 에러의 원인이었으므로 삭제했습니다!

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LabDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  if (!slug) return notFound();

  const decodedSlug = decodeURIComponent(slug);
  const contentPath = path.join(process.cwd(), 'content', 'lab');
  
  if (!fs.existsSync(contentPath)) return notFound();

  const fileNames = fs.readdirSync(contentPath);
  const targetFile = fileNames.find((f) => 
    f.replace(/\.(mdx|md)$/i, '').toLowerCase() === decodedSlug.toLowerCase()
  );

  if (!targetFile) return notFound();

  const fileContents = fs.readFileSync(path.join(contentPath, targetFile), 'utf8');
  const { data, content } = matter(fileContents);

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* 배경: AI 메인과 동일 */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: "url(/images/contents_bg.jpg)" }}
      />

      {/* 메인 컨테이너 */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 py-10 text-white flex flex-col">
        
        {/* 상단 헤더: AI 메인 페이지 구조 복사 */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <div className="text-xs tracking-[0.22em] text-white/70 uppercase">CATEGORY</div>
            <h1 className="text-2xl mt-1 uppercase font-normal">AI CONTENTS</h1>
            
            {/* 상단 서브 메뉴 */}
            <nav className="mt-4 flex gap-6 text-sm tracking-[0.18em] uppercase">
              <Link href="/ai" className="text-white/50 hover:text-white/80 transition">Work</Link>
              <Link href="/ai/lab" className="text-white">Lab</Link>
              <Link href="/ai/article" className="text-white/50 hover:text-white/80 transition">Article</Link>
            </nav>
          </div>

          {/* BACK 버튼: Link 태그 사용 (router.push 대신 안전한 방식) */}
          <Link
            href="/ai/lab"
            className="cursor-pointer px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition text-sm"
          >
            BACK
          </Link>
        </div>

        {/* 본문 영역 */}
        <div className="mt-8 flex-1 overflow-auto pr-1 custom-scrollbar">
          <article className="max-w-4xl">
            <header className="mb-10 border-b border-white/10 pb-6">
              <p className="text-white/50 font-mono text-sm mb-2">{data.date}</p>
              <h2 className="text-3xl font-bold">{data.title}</h2>
              {data.summary && <p className="text-white/70 mt-4 text-lg leading-relaxed">{data.summary}</p>}
            </header>
            
            {/* 본문 디자인 */}
            <div className="prose prose-invert max-w-none 
  prose-p:text-white/80 prose-p:leading-8 prose-p:mb-6
  prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6
  prose-strong:text-yellow-400 prose-ul:list-disc prose-li:text-white/70">
  
  {/* 👇👇 [여기만 바뀝니다] rehypePlugins 속성을 추가해 주세요 */}
  <ReactMarkdown rehypePlugins={[rehypeRaw] as any}>
    {content}
  </ReactMarkdown>

</div>
          </article>
          <div className="h-20" /> 
        </div>
      </div>
    </main>
  );
}