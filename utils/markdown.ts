import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function renderMarkdown(raw: string): string {
  if (!raw.trim()) return "";
  const html = marked.parse(raw, { breaks: true, gfm: true }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "pre",
      "code",
      "input",
      "del",
      "s",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ["class"],
      pre: ["class"],
      img: ["src", "alt", "title"],
      input: ["type", "checked", "disabled"],
      span: ["class"],
      div: ["class"],
    },
  });
}
