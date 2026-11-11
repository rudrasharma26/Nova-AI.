import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDark = false }) => {
  // Parse blocks: code blocks, tables, headings, blockquotes, lists, paragraphs
  const renderBlocks = () => {
    const blocks: React.ReactNode[] = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced Code Block
      if (line.trim().startsWith('```')) {
        const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
        const lang = langMatch ? langMatch[1] : '';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        // Skip closing ```
        if (i < lines.length) i++;
        blocks.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeLines.join('\n')}
            language={lang || 'plaintext'}
            isDark={isDark}
          />
        );
        continue;
      }

      // Markdown Table (starts with |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        blocks.push(<TableBlock key={`table-${i}`} lines={tableLines} isDark={isDark} />);
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="text-xl font-semibold tracking-tight text-[#15161A] dark:text-[#EDECE8] mt-4 mb-2">
            {renderInline(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-lg font-semibold tracking-tight text-[#15161A] dark:text-[#EDECE8] mt-4 mb-2">
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-base font-semibold tracking-tight text-[#15161A] dark:text-[#EDECE8] mt-3 mb-1.5">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('> ')) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        blocks.push(
          <blockquote
            key={`quote-${i}`}
            className="border-l-2 border-[#5B47E0] dark:border-[#8577FF] pl-3.5 my-2.5 text-sm italic text-[#5A5C66] dark:text-[#9A9CA6]"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx}>{renderInline(ql)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Unordered list
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }
        blocks.push(
          <ul key={`ul-${i}`} className="list-disc list-outside pl-5 my-2 space-y-1 text-sm text-[#15161A] dark:text-[#EDECE8]">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line.trim())) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        blocks.push(
          <ol key={`ol-${i}`} className="list-decimal list-outside pl-5 my-2 space-y-1 text-sm text-[#15161A] dark:text-[#EDECE8]">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // Standard paragraph
      blocks.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed text-[#15161A] dark:text-[#EDECE8] my-2">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return blocks;
  };

  return <div className="space-y-1 text-sm leading-relaxed">{renderBlocks()}</div>;
};

/**
 * Render inline tokens: bold, italic, code, links
 */
function renderInline(text: string): React.ReactNode {
  // Regex to match code `...`, bold **...**, italic *...*
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded text-xs font-mono bg-[#E4E2DC]/50 dark:bg-[#24262D] text-[#15161A] dark:text-[#EDECE8] border border-[#E4E2DC] dark:border-[#24262D]"
        >
          {code}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-[#15161A] dark:text-[#EDECE8]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#5A5C66] dark:text-[#9A9CA6]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/**
 * Fenced Code Block component with copy feedback and language tag
 */
interface CodeBlockProps {
  code: string;
  language: string;
  isDark?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 rounded-lg border border-[#E4E2DC] dark:border-[#24262D] bg-[#FFFFFF] dark:bg-[#121318] overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E4E2DC] dark:border-[#24262D] bg-[#F7F6F3] dark:bg-[#0B0C10] text-[#5A5C66] dark:text-[#9A9CA6]">
        <span className="font-mono text-xs">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs hover:bg-[#E4E2DC]/60 dark:hover:bg-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6] transition-colors"
          title="Copy code"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed text-[#15161A] dark:text-[#EDECE8]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

/**
 * Markdown Table component with neat cell boundaries
 */
interface TableBlockProps {
  lines: string[];
  isDark?: boolean;
}

const TableBlock: React.FC<TableBlockProps> = ({ lines }) => {
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
  };

  const headerRow = parseRow(lines[0]);
  const hasDivider = lines.length > 1 && lines[1].includes('---');
  const bodyRows = (hasDivider ? lines.slice(2) : lines.slice(1)).map(parseRow);

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-[#E4E2DC] dark:border-[#24262D]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-[#F7F6F3] dark:bg-[#0B0C10] border-b border-[#E4E2DC] dark:border-[#24262D]">
            {headerRow.map((cell, idx) => (
              <th
                key={idx}
                className="px-3 py-2 font-semibold text-[#15161A] dark:text-[#EDECE8]"
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E2DC] dark:divide-[#24262D] bg-[#FFFFFF] dark:bg-[#121318]">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#F7F6F3]/50 dark:hover:bg-[#0B0C10]/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-[#15161A] dark:text-[#EDECE8]">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
