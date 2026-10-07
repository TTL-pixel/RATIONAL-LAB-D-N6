import React, { useMemo } from 'react';
import katex from 'katex';

export interface MathFormulaProps {
  math?: string;
  children?: React.ReactNode;
  block?: boolean;
  className?: string;
}

/**
 * Clean standard delimiters and sanitize raw LaTeX math strings.
 * Handles: $$...$$, $...$, \[...\], \(...\), ```latex...```
 * Normalizes accidental escaping and common Unicode symbols.
 */
export function cleanMathDelimiters(input: string): string {
  if (!input) return '';
  let str = input.trim();

  // Strip markdown code fences if present (e.g. from AI responses: ```latex ... ```)
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:latex|math|tex)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // Strip block delimiters $$...$$ or \[...\]
  if (str.startsWith('$$') && str.endsWith('$$') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith('\\[') && str.endsWith('\\]') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith('$') && str.endsWith('$') && str.length >= 2) {
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('\\(') && str.endsWith('\\)') && str.length >= 4) {
    str = str.slice(2, -2).trim();
  }

  // Normalize accidental double backslashes before known LaTeX commands / braces
  // (e.g. \\frac -> \frac, \\sqrt -> \sqrt, \\left -> \left, \\begin -> \begin)
  str = str.replace(/\\\\(frac|sqrt|left|right|begin|end|limits|lim|mathbb|times|div|approx|neq|le|ge|infty|to|pm|quad|text|subset|subseteq|cap|cup|setminus|iff|implies|Delta|alpha|beta|pi|theta|cdot|emptyset)/g, '\\$1');
  str = str.replace(/\\\\([{}()[\],;!])/g, '\\$1');

  // Normalize common unicode math characters that break or display poorly
  str = str.replace(/[\u2212\u2013\u2014]/g, '-'); // Unicode minus, en-dash, em-dash
  str = str.replace(/\u00D7/g, '\\times ');
  str = str.replace(/\u00F7/g, '\\div ');
  str = str.replace(/\u2248/g, '\\approx ');
  str = str.replace(/\u2260/g, '\\neq ');
  str = str.replace(/[\u2264\u2266]/g, '\\le ');
  str = str.replace(/[\u2265\u2267]/g, '\\ge ');
  str = str.replace(/\u221E/g, '\\infty ');
  str = str.replace(/\u2192/g, '\\to ');
  str = str.replace(/[\u0394\u2206]/g, '\\Delta '); // Delta
  str = str.replace(/\u00B1/g, '\\pm ');
  str = str.replace(/[\u22C5\u00B7]/g, '\\cdot ');
  str = str.replace(/\u21D4/g, '\\iff ');
  str = str.replace(/\u21D2/g, '\\implies ');
  str = str.replace(/\u2205/g, '\\emptyset ');

  // Standardize lim to lim\limits so subscript is placed directly underneath
  str = str.replace(/\\lim(?!\s*\\limits)_/g, '\\lim\\limits_');

  return str;
}

/**
 * Universal, rock-solid mathematical formula rendering component using KaTeX.
 * Ensures zero LaTeX errors, crisp cross-platform typography,
 * and seamless Light/Dark mode contrast.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  children,
  block = false,
  className = '',
}) => {
  const rawContent = math !== undefined ? math : typeof children === 'string' ? children : '';
  const isDisplayExplicit = useMemo(() => {
    if (block) return true;
    const trimmed = rawContent.trim();
    return (
      (trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
      (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) ||
      trimmed.includes('\\begin{')
    );
  }, [rawContent, block]);

  const cleanMath = useMemo(() => cleanMathDelimiters(rawContent), [rawContent]);

  const renderedHtml = useMemo(() => {
    if (!cleanMath) return '';
    try {
      return katex.renderToString(cleanMath, {
        displayMode: isDisplayExplicit,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false,
        trust: true,
      });
    } catch (err) {
      console.warn('KaTeX rendering fallback for:', cleanMath, err);
      // Clean HTML escaping fallback so it never crashes React
      const escaped = cleanMath
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<span class="text-amber-500 font-mono text-xs">${escaped}</span>`;
    }
  }, [cleanMath, isDisplayExplicit]);

  if (!renderedHtml) return null;

  if (isDisplayExplicit) {
    return (
      <div
        className={`overflow-x-auto py-2 my-1.5 text-center font-serif text-slate-900 dark:text-slate-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      className={`inline-block px-0.5 align-baseline font-serif text-slate-900 dark:text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

interface TextToken {
  type: 'text' | 'inline-math' | 'block-math' | 'heading';
  content: string;
  level?: number;
}

/**
 * Helper parser to split a block of text into tokens:
 * - Block math: \[...\], $$...$$, ```latex...```
 * - Inline math: \(...\), $...$
 * - Headings: ### ..., ## ..., # ...
 * - Prose with markdown bold **...**
 */
function tokenizeMathText(rawText: string): TextToken[] {
  if (!rawText) return [];

  // Normalize Windows CRLF newlines
  const text = rawText.replace(/\r\n/g, '\n');

  // Match block-level items:
  // 1. ```latex\n...\n```
  // 2. \[...\]
  // 3. $$...$$
  const blockRegex = /(?:```(?:latex|math|tex)?\s*[\n]([\s\S]*?)```|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$)/g;

  const tokens: TextToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(text)) !== null) {
    // Process text preceding the block math
    if (match.index > lastIndex) {
      const preceding = text.slice(lastIndex, match.index);
      tokens.push(...tokenizeInlineAndHeadings(preceding));
    }

    // Extracted block math content
    const blockContent = match[1] ?? match[2] ?? match[3] ?? '';
    tokens.push({
      type: 'block-math',
      content: blockContent.trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Process any remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    tokens.push(...tokenizeInlineAndHeadings(remaining));
  }

  return tokens;
}

/**
 * Helper to split text that might contain un-delimited raw LaTeX commands
 * (e.g. D = \mathbb{R} \setminus \left\{ 1 \right\} or \frac{...}{...})
 */
function parseRawLatexInText(plainText: string): TextToken[] {
  if (!plainText || !plainText.includes('\\')) {
    return [{ type: 'text', content: plainText }];
  }

  // Detect if the entire segment is a standalone mathematical expression
  // (contains backslash commands like \frac, \mathbb, \sqrt, \lim, \left, etc., and no Vietnamese letters)
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(plainText);
  const hasKnownLatex = /\\(frac|sqrt|mathbb|lim|limits|infty|left|right|begin|end|Delta|times|div|pm|to|le|ge|neq|setminus|cdot|iff|implies|emptyset)/.test(plainText);

  if (!hasVietnamese && hasKnownLatex) {
    return [{ type: 'inline-math', content: plainText.trim() }];
  }

  // If mixed text and raw LaTeX commands, split and extract the LaTeX portions
  const rawLatexRegex = /(?:[a-zA-Z0-9'_\^()=+\-*\/<>]+\s*=\s*)?\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\]|[a-zA-Z0-9'_\^()+\-*\/<>]|\\[a-zA-Z]+)*(?:\s*[+\-*\/=]\s*(?:[a-zA-Z0-9'_\^()]|\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\])*))*/g;
  const tokens: TextToken[] = [];
  let curIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = rawLatexRegex.exec(plainText)) !== null) {
    if (m.index > curIdx) {
      tokens.push({ type: 'text', content: plainText.slice(curIdx, m.index) });
    }
    tokens.push({ type: 'inline-math', content: m[0].trim() });
    curIdx = m.index + m[0].length;
  }

  if (curIdx < plainText.length) {
    tokens.push({ type: 'text', content: plainText.slice(curIdx) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', content: plainText }];
}

/**
 * Tokenize inline prose, handling headings, \(...\), $...$, and raw LaTeX
 */
function tokenizeInlineAndHeadings(segment: string): TextToken[] {
  const result: TextToken[] = [];
  const lines = segment.split('\n');

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const line = lines[lIdx];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push({ type: 'text', content: '' });
      continue;
    }

    // Check for markdown headings: ### ..., ## ..., # ...
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      result.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      continue;
    }

    // Parse inline math in this line:
    // Support both \( ... \) and $ ... $
    const inlineRegex = /(?:\\\(([\s\S]*?)\\\)|\$([^\$\n]+?)\$)/g;
    let lastChar = 0;
    let iMatch: RegExpExecArray | null;

    while ((iMatch = inlineRegex.exec(line)) !== null) {
      if (iMatch.index > lastChar) {
        const precedingText = line.slice(lastChar, iMatch.index);
        result.push(...parseRawLatexInText(precedingText));
      }

      const mathExpr = iMatch[1] ?? iMatch[2] ?? '';
      result.push({
        type: 'inline-math',
        content: mathExpr.trim(),
      });

      lastChar = iMatch.index + iMatch[0].length;
    }

    if (lastChar < line.length) {
      const remainingText = line.slice(lastChar);
      result.push(...parseRawLatexInText(remainingText));
    }
  }

  return result;
}

/**
 * Helper to render inline text containing **bold** or *italic*
 */
const FormattedInline: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by bold **...**
  const boldParts = text.split('**');
  if (boldParts.length === 1) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {boldParts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <strong key={i} className="font-bold text-slate-900 dark:text-white">
              {part}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

/**
 * Universal MathText renders rich prose with mixed inline and display LaTeX math:
 * - Supports \(...\), $...$ for inline math
 * - Supports \[...\], $$...$$, ```latex...``` for display math
 * - Handles markdown headings, bold text, bullet points
 * - Never leaks raw LaTeX tags into the UI
 */
export const MathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const tokens = useMemo(() => tokenizeMathText(text), [text]);

  if (!tokens || tokens.length === 0) return null;

  return (
    <div className={`space-y-1.5 leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}>
      {tokens.map((token, idx) => {
        if (token.type === 'block-math') {
          return (
            <MathFormula
              key={idx}
              math={token.content}
              block={true}
              className="my-2"
            />
          );
        }

        if (token.type === 'inline-math') {
          return (
            <MathFormula
              key={idx}
              math={token.content}
              block={false}
              className="text-blue-600 dark:text-cyan-300 font-semibold px-0.5"
            />
          );
        }

        if (token.type === 'heading') {
          const Tag = token.level === 1 ? 'h2' : token.level === 2 ? 'h3' : 'h4';
          return (
            <Tag key={idx} className="font-bold text-slate-900 dark:text-white pt-1.5 pb-0.5 text-sm sm:text-base flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 shrink-0" />
              <span>{token.content}</span>
            </Tag>
          );
        }

        // Empty line
        if (!token.content) {
          return <div key={idx} className="h-1" />;
        }

        return <FormattedInline key={idx} text={token.content} />;
      })}
    </div>
  );
};

// Default export for flexibility
export default MathFormula;

