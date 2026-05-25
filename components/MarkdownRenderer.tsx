"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-slate-50 prose-a:text-cyan-300 prose-code:text-cyan-100 prose-pre:bg-slate-950 prose-pre:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 underline underline-offset-2"
            />
          ),

          pre: ({ ...props }) => (
            <pre
              {...props}
              className="overflow-x-auto rounded-2xl bg-slate-950 p-4"
            />
          ),

          code: ({ className, children, ...props }) => {
            const isInline =
              !className?.includes("language-");

            return isInline ? (
              <code
                {...props}
                className="rounded bg-slate-900 px-1 py-0.5 text-cyan-100"
              >
                {children}
              </code>
            ) : (
              <code
                {...props}
                className="block overflow-x-auto text-sm"
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
}