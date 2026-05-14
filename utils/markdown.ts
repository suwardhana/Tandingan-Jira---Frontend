import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(raw: string): string {
  if (!raw.trim()) return "";
  const html = marked.parse(raw, { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
}
