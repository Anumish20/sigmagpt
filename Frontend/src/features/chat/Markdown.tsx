import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const lang = /language-(\w+)/.exec(className || "")?.[1];
  const text = String(children ?? "");

  const copy = () => {
    navigator.clipboard.writeText(text.replace(/\n$/, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div className="group/code my-3 overflow-hidden rounded-lg border border-line bg-[#0C0C11]">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] text-ink-lo transition hover:text-ink-hi"
        >
          {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[13px] leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

/**
 * Small models (e.g. phi3) sometimes wrap their *entire* reply in a
 * ```markdown … ``` fence, which would render as one big code block.
 * Strip that wrapper so the answer renders as normal prose — even while
 * streaming (the closing fence may not have arrived yet).
 */
function unwrapMarkdownFence(s: string): string {
  if (!/^\s*```(?:markdown|md)\b/i.test(s)) return s;
  return s.replace(/^\s*```(?:markdown|md)[^\n]*\n?/i, "").replace(/```\s*$/, "");
}

export const Markdown = memo(function Markdown({ content }: { content: string }) {
  content = unwrapMarkdownFence(content);
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-7 prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none prose-a:text-violet-400 prose-headings:text-ink-hi prose-strong:text-ink-hi prose-li:marker:text-ink-faint">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
            return (
              <code
                className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
