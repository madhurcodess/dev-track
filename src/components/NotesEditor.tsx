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
    const courseTitle = activeCourse?.title || 'Course';
    const filename = `${courseTitle} - ${activeVideo?.title || 'Notes'}.md`.replace(/[/\\?%*:|"<>]/g, '-');
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
    const courseTitle = activeCourse?.title || 'Course';
    const filename = `${courseTitle} - ${activeVideo?.title || 'Notes'}.txt`.replace(/[/\\?%*:|"<>]/g, '-');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
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
      <section className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 h-[calc(100vh-4rem)] flex flex-col border-l border-[#121417]/10 bg-white p-8 items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#D4E4FC] border-2 border-[#121417] text-[#121417] flex items-center justify-center mb-4 shadow-solid">
          <Edit3 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-[#121417] mb-1.5">Contextual Notes</h3>
        <p className="text-xs text-[#121417]/70 max-w-[220px] font-medium leading-relaxed">
          Add a course and select a lecture to start taking timestamped notes and code snippets.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 h-[calc(100vh-4rem)] flex flex-col border-l border-[#121417]/10 bg-white">
      {/* Notes Top Header */}
      <div className="p-4 border-b border-[#121417]/10 bg-[#F9F8F5]/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#121417]" />
          <h2 className="text-xs font-extrabold text-[#121417] uppercase tracking-wider">
            Contextual Notes
          </h2>
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#121417]/60 font-semibold">
          <span className={`w-2 h-2 rounded-full ${isNoteSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{isNoteSaving ? 'Saving...' : lastSavedTime ? `Saved at ${lastSavedTime}` : 'Auto-saved'}</span>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-3.5 py-2 border-b border-[#121417]/10 bg-[#F9F8F5] flex items-center justify-between gap-1 flex-wrap">
        {/* Text Actions */}
        <div className="flex items-center gap-1">
          {/* Timestamp Button */}
          <button
            onClick={handleInsertTimestamp}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] border border-[#121417]/20 text-[#121417] text-xs font-bold transition-all shadow-sm hover:scale-105"
            title="Insert current video timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Timestamp</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('### ', '', 'Header')}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Heading (###)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Bullet list (- )"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleInsertCodeSnippet}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Insert Code Block"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertFormatting('> ', '', 'Quote note')}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
            title="Blockquote (> )"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 bg-white p-1 rounded-full border border-[#121417]/15 shadow-sm">
          <button
            onClick={() => setViewMode('edit')}
            className={`p-1 px-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'edit' ? 'bg-[#121417] text-[#EBF755]' : 'text-slate-600 hover:text-black'
            }`}
            title="Editor view"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-1 px-1.5 rounded-full text-xs font-bold transition-all hidden sm:block ${
              viewMode === 'split' ? 'bg-[#121417] text-[#EBF755]' : 'text-slate-600 hover:text-black'
            }`}
            title="Split view (Edit + Preview)"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-1 px-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'preview' ? 'bg-[#121417] text-[#EBF755]' : 'text-slate-600 hover:text-black'
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
            className="w-full h-full p-4 bg-white text-[#121417] text-xs font-mono resize-none focus:outline-none placeholder-slate-400 leading-relaxed overflow-y-auto"
          />
        )}

        {viewMode === 'preview' && (
          <div className="w-full h-full p-4 overflow-y-auto">
            <InteractiveMarkdown content={content} onTimestampClick={seekTo} />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="w-full h-full flex flex-col divide-y divide-[#121417]/10">
            {/* Editor half */}
            <div className="h-1/2 flex flex-col">
              <div className="px-3 py-1.5 bg-[#F9F8F5] text-[10px] uppercase font-bold tracking-wider text-[#121417]/60 border-b border-[#121417]/10">
                Markdown Editor
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Type notes here..."
                className="flex-1 p-3 bg-white text-[#121417] text-xs font-mono resize-none focus:outline-none placeholder-slate-400 leading-relaxed overflow-y-auto"
              />
            </div>

            {/* Preview half */}
            <div className="h-1/2 flex flex-col bg-[#F9F8F5]/40">
              <div className="px-3 py-1.5 bg-[#F9F8F5] text-[10px] uppercase font-bold tracking-wider text-[#121417]/60 border-b border-[#121417]/10 flex items-center justify-between">
                <span>Interactive Live Preview</span>
                <span className="text-[10px] text-[#121417] font-bold">Click [00:00] to seek video</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto text-xs">
                <InteractiveMarkdown content={content} onTimestampClick={seekTo} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export & Action Footer */}
      <div className="p-3 border-t border-[#121417]/10 bg-[#F9F8F5] flex items-center justify-between gap-2 text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#121417] border border-[#121417]/20 shadow-sm transition-all"
            title="Copy notes to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#121417]/60 mr-1">Export:</span>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/20 text-[11px] shadow-sm transition-all"
            title="Export as Markdown .md file"
          >
            <FileDown className="w-3 h-3" />
            <span>.md</span>
          </button>
          <button
            onClick={handleExportText}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#121417] border border-[#121417]/20 text-[11px] shadow-sm transition-all"
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

// Interactive Markdown component with editorial lime timestamp chips
const InteractiveMarkdown: React.FC<{
  content: string;
  onTimestampClick: (seconds: number) => void;
}> = ({ content, onTimestampClick }) => {
  if (!content.trim()) {
    return <p className="text-slate-400 italic text-xs font-medium">Notes are empty. Start typing above...</p>;
  }

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  return (
    <div className="space-y-2 text-[#121417]">
      {lines.map((line, idx) => {
        if (line.startsWith('```')) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const codeText = codeBuffer.join('\n');
            codeBuffer = [];
            return (
              <pre key={idx} className="my-2.5 p-3 rounded-2xl bg-[#121417] border border-black font-mono text-[11px] overflow-x-auto text-[#EBF755] shadow-sm">
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
          return <h1 key={idx} className="text-base font-extrabold text-[#121417] mt-2 mb-1">{renderInlineText(line.replace('# ', ''), onTimestampClick)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-sm font-bold text-[#121417] mt-2 mb-1">{renderInlineText(line.replace('## ', ''), onTimestampClick)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-xs font-extrabold text-[#121417] mt-1.5 mb-1">{renderInlineText(line.replace('### ', ''), onTimestampClick)}</h3>;
        }

        // Horizontal Rule
        if (line.trim() === '---' || line.trim() === '***') {
          return <hr key={idx} className="border-[#121417]/15 my-2" />;
        }

        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-3 border-[#121417] pl-2.5 text-[#121417]/70 italic text-xs my-1 font-medium">
              {renderInlineText(line.replace('> ', ''), onTimestampClick)}
            </blockquote>
          );
        }

        // Checkbox list
        if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
          const isChecked = line.startsWith('- [x] ');
          const label = line.slice(6);
          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#121417] my-0.5 font-medium">
              <input type="checkbox" checked={isChecked} readOnly className="rounded border-black text-black focus:ring-0" />
              <span className={isChecked ? 'line-through text-slate-400' : ''}>{renderInlineText(label, onTimestampClick)}</span>
            </div>
          );
        }

        // Bullet list
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#121417] my-0.5 font-medium">
              <span className="text-[#121417] font-black">•</span>
              <div className="flex-1">{renderInlineText(line.substring(2), onTimestampClick)}</div>
            </div>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs text-[#121417] leading-relaxed my-0.5 font-medium">
            {renderInlineText(line, onTimestampClick)}
          </p>
        );
      })}
    </div>
  );
};

// Replace [mm:ss] or [hh:mm:ss] with vibrant lime clickable buttons
function renderInlineText(text: string, onTimestampClick: (seconds: number) => void): React.ReactNode {
  const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = timestampRegex.exec(text)) !== null) {
    const start = match.index;
    const end = timestampRegex.lastIndex;

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
        className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1 rounded-full bg-[#EBF755] hover:bg-[#E2EF43] text-black border border-[#121417] font-mono text-[11px] font-extrabold cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95 group"
        title={`Jump video to ${timeStr}`}
      >
        <Clock className="w-2.5 h-2.5 text-black" />
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
