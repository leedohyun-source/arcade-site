import fs from "fs";
import path from "path";
import Link from "next/link";

// 1. 타입 정의에 externalUrl 추가
type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  externalUrl?: string; // 외부 링크용 필드
};

type PostFull = PostMeta & { body: string };

function parseFrontmatter(raw: string): { data: Record<string, any>; body: string } {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { data: {}, body: raw };
  const fmBlock = m[1];
  const body = raw.slice(m[0].length);

  const data: Record<string, any> = {};
  for (const line of fmBlock.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf(":");
    if (idx < 0) continue;
    const key = t.slice(0, idx).trim();
    let val = t.slice(idx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      const parts = inner
        ? inner
            .split(",")
            .map((p) => p.trim().replace(/^\"|\"$/g, "").replace(/^'|'$/g, ""))
            .filter(Boolean)
        : [];
      data[key] = parts;
      continue;
    }

    data[key] = val;
  }

  return { data, body };
}

function dateValue(d: string) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function isPostFile(f: string) {
  const lower = f.toLowerCase();
  return lower.endsWith(".mdx") || lower.endsWith(".md");
}

function getPosts(dir: "lab" | "article"): PostMeta[] {
  const base = path.join(process.cwd(), "content", dir);
  if (!fs.existsSync(base)) return [];

  const files = fs.readdirSync(base).filter(isPostFile);
  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(base, file), "utf8");
    const { data } = parseFrontmatter(raw);
    const slug = file.replace(/\.(mdx|md)$/i, "");

    posts.push({
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || "",
      summary: (data.summary as string) || "",
      tags: (data.tags as string[]) || [],
      // 2. 외부 링크 데이터 가져오기
      externalUrl: (data.externalUrl as string) || "",
    });
  }

  posts.sort((a, b) => dateValue(b.date) - dateValue(a.date));
  return posts;
}

function HeaderNav({ active }: { active: "work" | "lab" | "article" }) {
  return (
    <nav className="mt-4 flex gap-6 text-sm tracking-[0.18em] uppercase">
      <Link
        href="/ai"
        className={
          active === "work"
            ? "cursor-pointer transition text-white"
            : "cursor-pointer transition text-white/50 hover:text-white/80"
        }
      >
        Work
      </Link>
      <Link
        href="/ai/lab"
        className={
          active === "lab"
            ? "cursor-pointer transition text-white"
            : "cursor-pointer transition text-white/50 hover:text-white/80"
        }
      >
        Lab
      </Link>
      <Link
        href="/ai/article"
        className={
          active === "article"
            ? "cursor-pointer transition text-white"
            : "cursor-pointer transition text-white/50 hover:text-white/80"
        }
      >
        Article
      </Link>
    </nav>
  );
}

export default function Page() {
  const posts = getPosts("article");

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: "url(/images/contents_bg.jpg)" }}
      />

      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 py-10 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs tracking-[0.22em] text-white/70">CATEGORY</div>
            <h1 className="text-2xl mt-1">AI CONTENTS</h1>
            <HeaderNav active="article" />
          </div>

          <Link
            href="/?select=1"
            className="cursor-pointer px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition"
          >
            BACK
          </Link>
        </div>

        <div className="mt-8 h-[calc(100%-5.5rem)] overflow-auto pr-1">
          <div className="grid grid-cols-1 gap-4">
            {posts.length === 0 ? (
              <div className="text-white/70 text-sm">
                아직 글이 없어요. <span className="text-white/90">content/article</span>에 mdx 파일을 추가하면 자동으로 표시됩니다.
              </div>
            ) : (
              posts.map((p) => {
                // 3. 외부 링크 여부에 따라 태그 결정
                const isExternal = !!p.externalUrl;
                
                // 외부 링크면 <a> 태그(새창), 내부 글이면 Next.js <Link> 태그
                const Wrapper = isExternal ? 'a' : Link;
                const props = isExternal 
                  ? { href: p.externalUrl, target: "_blank", rel: "noopener noreferrer" } 
                  : { href: `/ai/article/${p.slug}` };

                return (
                  // @ts-ignore
                  <Wrapper
                    key={p.slug}
                    {...props}
                    className="cursor-pointer rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md p-5 hover:bg-black/35 transition group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm tracking-wide text-white/70">{p.date}</div>
                      
                      {/* 외부 링크 아이콘 표시 (화살표 ↗) */}
                      {isExternal && (
                        <svg className="w-5 h-5 text-white/30 group-hover:text-yellow-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="mt-2 text-lg font-bold group-hover:text-yellow-400 transition-colors">
                      {p.title}
                    </div>
                    {p.summary ? <div className="mt-2 text-sm text-white/70">{p.summary}</div> : null}
                  </Wrapper>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}