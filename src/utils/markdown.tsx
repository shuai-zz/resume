import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked，禁用不安全的 HTML 标签
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(text: string): string {
  if (!text) return '';
  const raw = marked.parse(text, { async: false }) as string;
  // marked 不做 sanitize，导入他人 JSON 时 description 里可能藏 <script>/onerror，
  // 必须在塞进 dangerouslySetInnerHTML 之前过一遍。
  return DOMPurify.sanitize(raw);
}

// React 组件用的 wrapper
export function MarkdownContent({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  const html = renderMarkdown(text);
  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
