import React, { useState, useRef, useEffect } from 'react';
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
  Eye, 
  Edit3, 
  Columns, 
  Terminal
} from 'lucide-react';

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

  const [content, setContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content when active video changes
  useEffect(() => {
    setContent(getNoteForCurrentVideo());
  }, [activeVideo?.id, activeCourse?.id, getNoteForCurrentVideo]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    saveNoteForCurrentVideo(val);
  };

  // Helper to insert markdown formatting at selection
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);
    saveNoteForCurrentVideo(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Capture current video timestamp and insert into editor
  const handleInsertTimestamp = () => {
    const currentSec = getCurrentPlayerTime();
    const formatted = formatTime(currentSec);
    const tag = `[${formatted}] `;

    const textarea = textareaRef.current;
    if (!textarea) {
      const updated = content + `\n- ${tag}`;
      setContent(updated);
      saveNoteForCurrentVideo(updated);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const isLineStart = start === 0 || content[start - 1] === '\n';
    const insertion = isLineStart ? `- ${tag}` : ` ${tag}`;

    const newContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);
    saveNoteForCurrentVideo(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + insertion.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  // Insert Java Code Snippet template
  const handleInsertCodeSnippet = () => {
    const snippet = `\n\`\`\`java\n// Code example\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Result: " + 42);\n    }\n}\n\`\`\`\n`;
    insertFormatting(snippet, '', '');
  };

  // Copy to clipboard
  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Export as .md
  const handleExportMarkdown = () => {
    const filename = `${activeCourse.title} - ${activeVideo?.title || 'Notes'}.md`.replace(/[/\\?%*:|"<>]/g, '-');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as .txt
  const handleExportText = () => {
    const filename = `${activeCourse.title} - ${activeVideo?.title || 'Notes'}.txt`.replace(/[/\\?%*:|"<>]/g, '-');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isNotesOpen) return null;

  return (
    <section className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 h-[calc(100vh-4rem)] flex flex-col border-l border-slate-800 bg-slate-950/70 backdrop-blur-xl">
      {/* Notes Top Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Contextual Notes
          </h2>
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isNoteSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span>{isNoteSaving ? 'Saving...' : lastSavedTime ? `Saved at ${lastSavedTime}` : 'Auto-saved'}</span>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-1 flex-wrap">
        {/* Text Actions */}
        <div className="flex items-center gap-1">
          {/* Timestamp Button */}
          <button
            onClick={handleInsertTimestamp}
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
            title="Insert current video timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Timestamp</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('### ', '', 'Header')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Heading (###)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Bullet list (- )"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleInsertCodeSnippet}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Insert Java / Code Block"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('> ', '', 'Quote note')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Blockquote (> )"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('edit')}
            className={`p-1 rounded text-xs transition-all ${
              viewMode === 'edit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Editor view"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-1 rounded text-xs transition-all hidden sm:block ${
              viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split view (Edit + Preview)"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-1 rounded text-xs transition-all ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Live interactive preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {viewMode === 'edit' && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Type notes, code snippets, or click 'Timestamp' to mark video points..."
            className="w-full h-full p-4 bg-transparent text-slate-200 text-sm font-mono resize-none focus:outline-none placeholder-slate-600 leading-relaxed overflow-y-auto"
          />
        )}

        {viewMode === 'preview' && (
          <div className="w-full h-full p-4 overflow-y-auto markdown-body">
            <InteractiveMarkdown content={content} onTimestampClick={seekTo} />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="w-full h-full flex flex-col divide-y divide-slate-800">
            {/* Editor half */}
            <div className="h-1/2 flex flex-col">
              <div className="px-3 py-1 bg-slate-900/60 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800/40">
                Markdown Editor
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Type notes here..."
                className="flex-1 p-3 bg-transparent text-slate-200 text-xs font-mono resize-none focus:outline-none placeholder-slate-600 leading-relaxed overflow-y-auto"
              />
            </div>

            {/* Preview half */}
            <div className="h-1/2 flex flex-col bg-slate-950/50">
              <div className="px-3 py-1 bg-slate-900/60 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800/40 flex items-center justify-between">
                <span>Interactive Live Preview</span>
                <span className="text-[9px] text-indigo-400 font-normal">Click any [00:00] to seek video</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto markdown-body text-xs">
                <InteractiveMarkdown content={content} onTimestampClick={seekTo} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export & Action Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Copy notes to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1">Export:</span>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium transition-colors"
            title="Export as Markdown .md file"
          >
            <FileDown className="w-3 h-3" />
            <span>.md</span>
          </button>
          <button
            onClick={handleExportText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium transition-colors"
            title="Export as Plain text .txt file"
          >
            <FileDown className="w-3 h-3" />
            <span>.txt</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// Interactive Markdown component: detects [mm:ss] and renders clickable jump chips
const InteractiveMarkdown: React.FC<{
  content: string;
  onTimestampClick: (seconds: number) => void;
}> = ({ content, onTimestampClick }) => {
  if (!content.trim()) {
    return <p className="text-slate-400 italic text-xs">Notes are empty. Start typing above...</p>;
  }

  // Parse lines into simple markdown elements + interactive timestamp chips
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        // Code block start/end
        if (line.startsWith('```')) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const codeText = codeBuffer.join('\n');
            codeBuffer = [];
            return (
              <pre key={idx} className="my-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] overflow-x-auto text-indigo-200">
                <code>{codeText}</code>
              </pre>
            );
          } else {
            inCodeBlock = true;
            return null;
          }
        }

        if (inCodeBlock) {
          codeBuffer.push(line);
          return null;
        }

        // Headings
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-base font-bold text-white mt-2 mb-1">{renderInlineText(line.replace('# ', ''), onTimestampClick)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-sm font-semibold text-slate-100 mt-2 mb-1">{renderInlineText(line.replace('## ', ''), onTimestampClick)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-xs font-semibold text-indigo-300 mt-1.5 mb-1">{renderInlineText(line.replace('### ', ''), onTimestampClick)}</h3>;
        }

        // Horizontal Rule
        if (line.trim() === '---' || line.trim() === '***') {
          return <hr key={idx} className="border-slate-800 my-2" />;
        }

        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-indigo-500 pl-2 text-slate-400 italic text-xs my-1">
              {renderInlineText(line.replace('> ', ''), onTimestampClick)}
            </blockquote>
          );
        }

        // Checkbox list
        if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
          const isChecked = line.startsWith('- [x] ');
          const label = line.slice(6);
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 my-0.5">
              <input type="checkbox" checked={isChecked} readOnly className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" />
              <span className={isChecked ? 'line-through text-slate-500' : ''}>{renderInlineText(label, onTimestampClick)}</span>
            </div>
          );
        }

        // Bullet list
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-0.5">
              <span className="text-indigo-400 font-bold">•</span>
              <div className="flex-1">{renderInlineText(line.substring(2), onTimestampClick)}</div>
            </div>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs text-slate-300 leading-relaxed my-0.5">
            {renderInlineText(line, onTimestampClick)}
          </p>
        );
      })}
    </div>
  );
};

// Replace [mm:ss] or [hh:mm:ss] with interactive buttons that jump video playback
function renderInlineText(text: string, onTimestampClick: (seconds: number) => void): React.ReactNode {
  // Regex to match [00:00] or [00:00:00]
  const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = timestampRegex.exec(text)) !== null) {
    const start = match.index;
    const end = timestampRegex.lastIndex;

    // Push text before the match
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }

    const timeStr = match[1];
    const totalSeconds = parseTimestampToSeconds(timeStr);

    parts.push(
      <button
        key={`ts-${start}`}
        onClick={() => {
          if (totalSeconds !== null) {
            onTimestampClick(totalSeconds);
          }
        }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-100 border border-indigo-500/30 font-mono text-[11px] font-semibold cursor-pointer transition-all active:scale-95 group"
        title={`Jump video to ${timeStr}`}
      >
        <Clock className="w-2.5 h-2.5 text-indigo-400 group-hover:text-indigo-200" />
        <span>{timeStr}</span>
      </button>
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
