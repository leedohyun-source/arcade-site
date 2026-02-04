import fs from "fs";
import path from "path";

export type PostKind = "lab" | "article";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD 권장
  summary?: string;
  tags?: string[];
  source?: string; // article에서 사용 가능
};

export type Post = PostMeta & {
  body: string;
  html: string;
};

function contentDir(kind: PostKind) {
  return path.join(process.cwd(), "content", kind);
}

function safeReadDir(dir: string) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; body: string } {
  // 매우 단순한 frontmatter 파서 (--- ... ---)
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const fm = m[1];
  const body = m[2] ?? "";
  const meta: Record<string, any> = {};

  for (const line of fm.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();

    // 문자열 따옴표 제거
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // tags: ["a","b"] 형태를 매우 단순 지원
    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      if (!inner) {
        meta[key] = [];
      } else {
        meta[key] = inner
          .split(",")
          .map((s) => s.trim())
          .map((s) => {
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
            return s;
          });
      }
      continue;
    }

    meta[key] = val;
  }

  return { meta, body };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mdToHtmlLite(md: string) {
  // 의존성 없이 동작하는 '가벼운' 마크다운 렌더
  // - MDX(jsx) 사용은 권장하지 않음 (텍스트/마크다운 위주로 작성)
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      closeList();
      html += "<div style=\"height:12px\"></div>";
      continue;
    }

    // headings
    if (line.startsWith("### ")) {
      closeList();
      html += `<h3>${escapeHtml(line.slice(4).trim())}</h3>`;
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${escapeHtml(line.slice(3).trim())}</h2>`;
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      html += `<h1>${escapeHtml(line.slice(2).trim())}</h1>`;
      continue;
    }

    // list items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${escapeHtml(line.slice(2).trim())}</li>`;
      continue;
    }

    closeList();
    html += `<p>${escapeHtml(line)}</p>`;
  }

  closeList();
  return html;
}

function fileToSlug(filename: string) {
  return filename.replace(/\.(md|mdx)$/i, "");
}

export function getAllPostMeta(kind: PostKind): PostMeta[] {
  const dir = contentDir(kind);
  const files = safeReadDir(dir).filter((f) => /\.(md|mdx)$/i.test(f));

  const metas: PostMeta[] = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, "utf8");
    const { meta } = parseFrontmatter(raw);
    const slug = fileToSlug(f);
    metas.push({
      slug,
      title: String(meta.title || slug),
      date: String(meta.date || ""),
      summary: meta.summary ? String(meta.summary) : undefined,
      tags: Array.isArray(meta.tags) ? meta.tags.map(String) : undefined,
      source: meta.source ? String(meta.source) : undefined,
    });
  }

  // 최신 날짜가 위로
  metas.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return metas;
}

export function getPost(kind: PostKind, slug: string): Post {
  const dir = contentDir(kind);
  const candidates = [path.join(dir, `${slug}.mdx`), path.join(dir, `${slug}.md`)];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) {
    // Next에서 notFound()를 호출하는 쪽에서 처리하도록 throw
    throw new Error(`POST_NOT_FOUND:${kind}:${slug}`);
  }

  const raw = fs.readFileSync(file, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const html = mdToHtmlLite(body);

  return {
    slug,
    title: String(meta.title || slug),
    date: String(meta.date || ""),
    summary: meta.summary ? String(meta.summary) : undefined,
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : undefined,
    source: meta.source ? String(meta.source) : undefined,
    body,
    html,
  };
}
