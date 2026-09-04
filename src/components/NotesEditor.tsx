import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime, parseTimestampToSeconds } from '../utils/youtube';
import { 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  Quote, 
  FileDown, 
  Copy, 
  Check, 
  Clock, 
  Edit3, 
  Terminal
} from 'lucide-react';

/**
 * Converts a raw Markdown string into HTML formatted for the WYSIWYG editor.
 * Transforms [MM:SS] timestamp tags into interactive clickable buttons.
 */
function markdownToWysiwygHtml(md: string): string {
  if (!md) return '<p><br></p>';

  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        const codeContent = codeBlockLines.join('\n');
        htmlLines.push(`<pre class="bg-[#121417] text-white p-3 rounded-xl my-2 font-mono text-xs overflow-x-auto"><code>${escapeHtml(codeContent)}</code></pre>`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Heading 1 or 2
    if (line.startsWith('## ')) {
      htmlLines.push(`<h2 class="text-base font-extrabold text-[#121417] mt-3 mb-1.5">${renderInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      htmlLines.push(`<h1 class="text-lg font-black text-[#121417] mt-2 mb-2 pb-1 border-b border-[#121417]/10">${renderInline(line.substring(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      htmlLines.push(`<blockquote class="border-l-4 border-[#EBF755] pl-3 py-1 my-2 italic text-[#121417]/80 bg-[#F9F8F5] rounded-r-lg">${renderInline(line.substring(2))}</blockquote>`);
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      htmlLines.push(`<li class="ml-4 list-disc text-xs text-[#121417] my-0.5 leading-relaxed">${renderInline(line.substring(2))}</li>`);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      htmlLines.push('<p><br></p>');
      continue;
    }

    // Standard paragraph
    htmlLines.push(`<p class="text-xs text-[#121417] my-1 leading-relaxed">${renderInline(line)}</p>`);
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    htmlLines.push(`<pre class="bg-[#121417] text-white p-3 rounded-xl my-2 font-mono text-xs overflow-x-auto"><code>${escapeHtml(codeBlockLines.join('\n'))}</code></pre>`);
  }

  return htmlLines.join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  let res = escapeHtml(text);

  // Replace timestamps [04:15] or [1:23:45] with interactive pills
  res = res.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (_match, timeStr) => {
    const sec = parseTimestampToSeconds(timeStr) || 0;
    return `<button type="button" class="timestamp-pill inline-flex items-center gap-1 font-mono font-black text-[11px] px-2 py-0.5 rounded-full bg-[#EBF755] text-black border border-[#121417]/30 shadow-xs cursor-pointer hover:bg-[#E2EF43] mx-1 transition-transform active:scale-95 select-none" data-sec="${sec}" contenteditable="false">▶ [${timeStr}]</button>`;
  });

  // Bold
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#121417]/10 rounded font-mono text-[11px] text-[#121417] font-semibold">$1</code>');

  return res;
}

/**
 * Converts DOM tree inside contentEditable back into a clean Markdown string.
 */
function wysiwygHtmlToMarkdown(element: HTMLElement): string {
  const traverse = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Check for timestamp button
    if (el.classList.contains('timestamp-pill')) {
      const match = el.textContent?.match(/\[(.*?)\]/);
      return match ? `[${match[1]}]` : (el.textContent || '');
    }

    if (tag === 'strong' || tag === 'b') {
      return `**${Array.from(el.childNodes).map(traverse).join('')}**`;
    }

    if (tag === 'em' || tag === 'i') {
      return `*${Array.from(el.childNodes).map(traverse).join('')}*`;
    }

    if (tag === 'code' && el.parentElement?.tagName.toLowerCase() !== 'pre') {
      return `\`${el.textContent}\``;
    }

    if (tag === 'pre') {
      return `\n\`\`\`\n${el.textContent || ''}\n\`\`\`\n`;
    }

    if (tag === 'h1') {
      return `\n# ${Array.from(el.childNodes).map(traverse).join('')}\n`;
    }

    if (tag === 'h2') {
      return `\n## ${Array.from(el.childNodes).map(traverse).join('')}\n`;
    }

    if (tag === 'blockquote') {
      return `\n> ${Array.from(el.childNodes).map(traverse).join('')}\n`;
    }

    if (tag === 'li') {
      return `\n- ${Array.from(el.childNodes).map(traverse).join('')}`;
    }

    if (tag === 'p' || tag === 'div') {
      const childText: string = Array.from(el.childNodes).map(traverse).join('');
      return childText ? `\n${childText}` : '\n';
    }

    if (tag === 'br') {
      return '\n';
    }

    return Array.from(el.childNodes).map(traverse).join('');
  };

  const rawMarkdown: string = Array.from(element.childNodes).map(traverse).join('');
  // Normalize consecutive linebreaks
  return rawMarkdown.replace(/\n{3,}/g, '\n\n').trim();
}

export const NotesEditor: React.FC = () => {
  const {
    activeCourse,
    activeVideo,
    getNoteForCurrentVideo,
    saveNoteForCurrentVideo,
    isNoteSaving,
    lastSavedTime,
    getCurrentPlayerTime,
    seekTo,
    isNotesOpen,
  } = useApp();

  const editorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const isInternalChangeRef = useRef<boolean>(false);

  // Initialize and sync content when active video changes
  useEffect(() => {
    if (!editorRef.current) return;
    const rawNote = getNoteForCurrentVideo();
    isInternalChangeRef.current = true;
    editorRef.current.innerHTML = markdownToWysiwygHtml(rawNote);
    isInternalChangeRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideo?.id, activeCourse?.id]);

  // Handle content modification in contentEditable
  const handleInput = useCallback(() => {
    if (!editorRef.current || isInternalChangeRef.current) return;
    const md = wysiwygHtmlToMarkdown(editorRef.current);
    saveNoteForCurrentVideo(md);
  }, [saveNoteForCurrentVideo]);

  // Intercept click on timestamp pills to seek video
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const pill = target.closest('.timestamp-pill');
    if (pill) {
      e.preventDefault();
      e.stopPropagation();
      const secAttr = pill.getAttribute('data-sec');
      if (secAttr) {
        const sec = parseInt(secAttr, 10);
        if (!isNaN(sec)) {
          seekTo(sec);
        }
      } else {
        const match = pill.textContent?.match(/\[(.*?)\]/);
        if (match) {
          const parsed = parseTimestampToSeconds(match[1]);
          if (parsed !== null) {
            seekTo(parsed);
          }
        }
      }
    }
  }, [seekTo]);

  // Command Exec Helper for formatting
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Insert Interactive Timestamp node at cursor
  const handleInsertTimestamp = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const currentSec = getCurrentPlayerTime();
    const formatted = formatTime(currentSec);
    const pillHtml = `<button type="button" class="timestamp-pill inline-flex items-center gap-1 font-mono font-black text-[11px] px-2 py-0.5 rounded-full bg-[#EBF755] text-black border border-[#121417]/30 shadow-xs cursor-pointer hover:bg-[#E2EF43] mx-1 transition-transform active:scale-95 select-none" data-sec="${currentSec}" contenteditable="false">▶ [${formatted}]</button>&nbsp;`;

    document.execCommand('insertHTML', false, pillHtml);
    handleInput();
  };

  // Insert Code Snippet
  const handleInsertCodeSnippet = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const snippetHtml = `<pre class="bg-[#121417] text-white p-3 rounded-xl my-2 font-mono text-xs overflow-x-auto"><code>// Code snippet\nSystem.out.println("DevTrack learning!");</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, snippetHtml);
    handleInput();
  };

  // Copy Markdown
  const handleCopyNotes = async () => {
    if (!editorRef.current) return;
    try {
      const md = wysiwygHtmlToMarkdown(editorRef.current);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Export as .md
  const handleExportMarkdown = () => {
    if (!editorRef.current) return;
    const md = wysiwygHtmlToMarkdown(editorRef.current);
    const courseTitle = activeCourse?.title || 'Course';
    const filename = `${courseTitle} - ${activeVideo?.title || 'Notes'}.md`.replace(/[/\\?%*:|"<>]/g, '-');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as .txt
  const handleExportText = () => {
    if (!editorRef.current) return;
    const md = wysiwygHtmlToMarkdown(editorRef.current);
    const courseTitle = activeCourse?.title || 'Course';
    const filename = `${courseTitle} - ${activeVideo?.title || 'Notes'}.txt`.replace(/[/\\?%*:|"<>]/g, '-');
    const blob = new Blob([md], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isNotesOpen) return null;

  if (!activeVideo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-12 h-12 rounded-2xl bg-[#D4E4FC] border-2 border-[#121417] text-[#121417] flex items-center justify-center mb-3 shadow-solid">
          <Edit3 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-extrabold text-[#121417] mb-1">Contextual Notes</h3>
        <p className="text-xs text-[#121417]/60 max-w-[200px] leading-relaxed">
          Select a lecture from the course index to start taking rich timestamped notes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Top Action Toolbar */}
      <div className="p-2.5 border-b border-[#121417]/10 bg-[#F9F8F5] flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Interactive Timestamp Insertion Button */}
          <button
            onClick={handleInsertTimestamp}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-[#EBF755] hover:bg-[#E2EF43] text-black border border-[#121417]/30 shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Insert current video timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timestamp</span>
          </button>

          <div className="w-[1px] h-4 bg-[#121417]/20 mx-0.5" />

          {/* Text Formatting Toolbar */}
          <button
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleInsertCodeSnippet}
            className="p-1.5 rounded-lg text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Code Snippet"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-save & Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#121417]/60">
          <span className={`w-1.5 h-1.5 rounded-full ${isNoteSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>{isNoteSaving ? 'Saving...' : lastSavedTime ? `Saved ${lastSavedTime}` : 'Auto-saved'}</span>
        </div>
      </div>

      {/* Single-Pane WYSIWYG Content Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={handleEditorClick}
        className="flex-1 p-4 lg:p-5 overflow-y-auto outline-none font-sans text-xs text-[#121417] leading-relaxed selection:bg-[#EBF755] selection:text-black focus:ring-0 cursor-text"
        style={{ minHeight: '180px' }}
        suppressContentEditableWarning
      />

      {/* Bottom Export & Utility Bar */}
      <div className="p-2.5 border-t border-[#121417]/10 bg-[#F9F8F5] flex items-center justify-between text-xs font-bold text-[#121417]/70">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#121417]/15 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#121417]/50 hidden sm:inline">Export:</span>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#121417]/15 hover:bg-slate-50 text-[11px]"
            title="Download as Markdown (.md)"
          >
            <FileDown className="w-3 h-3" />
            <span>.md</span>
          </button>
          <button
            onClick={handleExportText}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#121417]/15 hover:bg-slate-50 text-[11px]"
            title="Download as Plain Text (.txt)"
          >
            <FileDown className="w-3 h-3" />
            <span>.txt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
