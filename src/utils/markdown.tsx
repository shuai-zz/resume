import { marked } from 'marked';

// 配置 marked，禁用不安全的 HTML 标签
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
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
