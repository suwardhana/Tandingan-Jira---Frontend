import React, { useState, useRef, useCallback } from "react";
import { renderMarkdown } from "../../utils/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  headerRight?: React.ReactNode;
}

type ToolbarAction = {
  icon: string;
  title: string;
  prefix: string;
  suffix: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: "format_bold", title: "Add bold text", prefix: "**", suffix: "**" },
  { icon: "format_italic", title: "Add italic text", prefix: "_", suffix: "_" },
  { icon: "code_blocks", title: "Add code block", prefix: "\n```\n", suffix: "\n```\n" },
  { icon: "format_list_bulleted", title: "Add a bulleted list", prefix: "\n- ", suffix: "" },
  { icon: "format_list_numbered", title: "Add a numbered list", prefix: "\n1. ", suffix: "" },
  { icon: "checklist", title: "Add a task list", prefix: "\n- [ ] ", suffix: "" },
];

function insertMarkdown(textarea: HTMLTextAreaElement, prefix: string, suffix: string): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const selectedText = value.substring(selectionStart, selectionEnd);
  const replacement = prefix + selectedText + suffix;
  textarea.focus();
  document.execCommand("insertText", false, replacement);

  if (selectionStart === selectionEnd) {
    // For multi-line blocks (like code blocks), place cursor between prefix and suffix
    const innerStart = selectionStart + prefix.length;
    textarea.setSelectionRange(innerStart, innerStart + selectedText.length);
  } else {
    // After wrapping selected text, select the whole result for easy adjustment
    const newStart = selectionStart + prefix.length;
    textarea.setSelectionRange(newStart, newStart + selectedText.length);
  }
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something...",
  rows = 8,
  headerRight,
}) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolbarAction = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      insertMarkdown(textarea, prefix, suffix);
      // Trigger React onChange after execCommand modifies the textarea
      onChange(textarea.value);
    },
    [onChange],
  );

  const handleImageButton = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const alt = file.name.replace(/\.[^.]+$/, "");
        const md = `![${alt}](${reader.result as string})`;
        insertMarkdown(textarea, md, "");
        onChange(textarea.value);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [onChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const md = `![image](${reader.result as string})`;
            insertMarkdown(textarea, md, "");
            onChange(textarea.value);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [onChange],
  );

  const renderedPreview =
    value.trim() !== ""
      ? renderMarkdown(value)
      : '<p class="text-sm italic text-slate-400 dark:text-slate-500">Nothing to preview</p>';

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-dark-border">
      {/* Write / Preview Tabs + optional right actions */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-bg">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "write"
              ? "border-b-2 border-blue-500 bg-white text-blue-600 dark:bg-dark-surface dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-blue-500 bg-white text-blue-600 dark:bg-dark-surface dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Preview
        </button>
        {headerRight && <div className="ml-auto flex items-center gap-2 pr-2">{headerRight}</div>}
      </div>

      {/* Toolbar (Write mode only) */}
      {activeTab === "write" && (
        <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50/50 px-2 py-1.5 dark:border-dark-border dark:bg-dark-bg/50">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              onClick={() => handleToolbarAction(action.prefix, action.suffix)}
              className="inline-flex items-center justify-center rounded p-1.5 text-slate-600 transition-colors hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
              title={action.title}
            >
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
            </button>
          ))}
          <div className="mx-0.5 h-5 w-px bg-gray-300 dark:bg-slate-600" />
          <button
            type="button"
            onClick={handleImageButton}
            className="inline-flex items-center justify-center rounded p-1.5 text-slate-600 transition-colors hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Attach an image"
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
          </button>
        </div>
      )}

      {/* Editor / Preview */}
      {activeTab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-y border-none bg-transparent p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-300 dark:placeholder:text-slate-500"
        />
      ) : (
        <div
          className="prose prose-sm max-w-none p-3 text-sm dark:prose-invert"
          style={{ minHeight: `${rows * 24 + 24}px` }}
          dangerouslySetInnerHTML={{ __html: renderedPreview }}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
