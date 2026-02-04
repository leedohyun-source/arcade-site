import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getPostsData(category: 'lab' | 'article') {
  const contentPath = path.join(process.cwd(), 'content', category);

  if (!fs.existsSync(contentPath)) return [];

  const fileNames = fs.readdirSync(contentPath);

  const allPostsData = fileNames
    .filter((fileName) => /\.(mdx|md)$/i.test(fileName))
    .map((fileName) => {
      const slug = fileName.replace(/\.(mdx|md)$/i, '');
      const fullPath = path.join(contentPath, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '2026-01-01',
        summary: data.summary || '',
        ...data,
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}