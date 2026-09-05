import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotesEditor, PRESET_NOTE_COLORS } from './NotesEditor';
import { 
  Folder, Pin, Search, Plus, Trash2, 
  Copy, BookOpen, Layers, FileText, 
  Clock, Check, Tv, LayoutGrid, List as ListIcon,
  Play, CheckCircle2, Edit3, ChevronDown, ChevronRight
} from 'lucide-react';
import type { VideoNote, VideoItem, Course } from '../types';

export const NotesView: React.FC = () => {
  const {
    courses,
    notes,
    saveNote,
    deleteNote,
    createGeneralNote,
    setActiveCourseId,
    setActiveVideoId,
    setCurrentView,
  } = useApp();

  // If there are courses, default to the first course folder, otherwise 'all'
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => {
    return courses[0]?.id || 'all';
  });

  // Track which folders are expanded in the sidebar accordion tree
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { general: true };
    courses.forEach(c => {
      initial[c.id] = true;
    });
    return initial;
  });

  const toggleFolderExpand = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setFilterMode('all');
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: true
    }));
  };

  // Automatically update selected folder if courses change and nothing is selected
  useEffect(() => {
    if (selectedFolderId !== 'all' && selectedFolderId !== 'pinned' && selectedFolderId !== 'general') {
      if (!courses.some(c => c.id === selectedFolderId)) {
        setSelectedFolderId(courses[0]?.id || 'all');
      }
    }
  }, [courses, selectedFolderId]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'withNotes' | 'empty' | 'pinned'>('all');
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePaletteKey, setActivePaletteKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected course if a playlist folder is selected
  const selectedCourse: Course | undefined = useMemo(() => {
    return courses.find(c => c.id === selectedFolderId);
  }, [courses, selectedFolderId]);

  // General notes list
  const generalNotesList = useMemo(() => {
    return Object.entries(notes)
      .filter(([_, n]) => n.courseId === 'general' || (!n.courseId && n.videoId?.startsWith('note_')) || _ === 'general_default')
      .map(([key, note]) => ({ key, note }))
      .sort((a, b) => (b.note.updatedAt || 0) - (a.note.updatedAt || 0));
  }, [notes]);

  // All written lecture notes across all courses
  const writtenLectureNotes = useMemo(() => {
    const list: { key: string; note: VideoNote; course: Course; video: VideoItem; lectureIndex: number }[] = [];
    courses.forEach(course => {
      course.videos.forEach((video, index) => {
        const key = `${course.id}_${video.id}`;
        const existing = notes[key];
        // Check if note has written content
        const hasContent = Boolean(existing?.content && existing.content.replace(/<[^>]+>/g, '').trim());
        if (hasContent || existing?.isPinned) {
          list.push({
            key,
            note: existing || {
              videoId: video.id,
              courseId: course.id,
              title: video.title,
              content: '',
              color: '#ffffff',
              isPinned: false,
              updatedAt: Date.now(),
            },
            course,
            video,
            lectureIndex: index + 1,
          });
        }
      });
    });
    return list;
  }, [courses, notes]);

  // Compute folder counters
  const totalPinnedCount = useMemo(() => {
    const pinnedGeneral = generalNotesList.filter(g => g.note.isPinned).length;
    const pinnedLectures = writtenLectureNotes.filter(l => l.note.isPinned).length;
    return pinnedGeneral + pinnedLectures;
  }, [generalNotesList, writtenLectureNotes]);

  // Handle creating a new general note
  const handleCreateGeneralNote = () => {
    const newKey = createGeneralNote('New Quick Note');
    setSelectedFolderId('general');
    setEditingNoteKey(newKey);
  };

  // Jump to lecture in learning workspace
  const handleJumpToLecture = (courseId: string, videoId: string) => {
    if (!courseId || !videoId) return;
    setActiveCourseId(courseId);
    setActiveVideoId(videoId);
    setCurrentView('workspace');
  };

  const handleCopyNote = async (key: string, note: VideoNote) => {
    try {
      const textOnly = (note.content || '').replace(/<[^>]+>/g, ' ');
      const fullText = `${note.title || 'Untitled'}\n\n${textOnly}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleDeleteGeneralNote = (key: string, title: string) => {
    if (window.confirm(`Delete note "${title || 'Untitled'}"?`)) {
      deleteNote(key);
      if (editingNoteKey === key) {
        setEditingNoteKey(null);
      }
    }
  };

  // Title of current folder view
  const currentFolderTitle = useMemo(() => {
    if (selectedFolderId === 'all') return 'All Written Notes';
    if (selectedFolderId === 'pinned') return 'Pinned Notes';
    if (selectedFolderId === 'general') return 'General & Quick Notes';
    if (selectedCourse) return selectedCourse.title;
    return 'Notes';
  }, [selectedFolderId, selectedCourse]);

  return (
    <div className="flex-1 flex flex-row min-h-0 bg-[#F9F8F5] overflow-hidden h-full w-full">
      {/* LEFT PANE: Folders Section (Responsive proportional width) */}
      <aside className="w-full sm:w-[260px] md:w-[260px] lg:w-[260px] xl:w-[280px] 2xl:w-[320px] flex-shrink-0 border-r border-[#121417]/10 bg-white flex flex-col h-full overflow-hidden">
        {/* Folders Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#121417]/10 flex items-center justify-between bg-[#F9F8F5]/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#EBF755] border border-[#121417] flex items-center justify-center text-black font-black shadow-2xs">
              <Folder className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#121417]">
              Course & Note Folders
            </h2>
          </div>

          {/* Create Note button is for General / Quick Notes */}
          <button
            onClick={handleCreateGeneralNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#EBF755] hover:bg-[#E2EF43] text-black border border-[#121417]/30 shadow-xs transition-transform active:scale-95"
            title="Create General Quick Note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Folder Navigation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Quick Views: All Notes & Pinned */}
          <button
            onClick={() => setSelectedFolderId('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFolderId === 'all'
                ? 'bg-[#121417] text-[#EBF755] shadow-xs'
                : 'text-[#121417]/80 hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Layers className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">All Written Notes</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              selectedFolderId === 'all' ? 'bg-[#EBF755] text-black' : 'bg-[#121417]/10 text-[#121417]'
            }`}>
              {writtenLectureNotes.length + generalNotesList.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFolderId('pinned')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedFolderId === 'pinned'
                ? 'bg-[#121417] text-[#EBF755] shadow-xs'
                : 'text-[#121417]/80 hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Pin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Pinned Notes</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              selectedFolderId === 'pinned' ? 'bg-[#EBF755] text-black' : 'bg-[#121417]/10 text-[#121417]'
            }`}>
              {totalPinnedCount}
            </span>
          </button>

          {/* General Notes Section (Expandable Accordion) */}
          <div className="space-y-0.5">
            <div
              className={`w-full flex items-center justify-between p-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFolderId === 'general'
                  ? 'bg-[#121417] text-[#EBF755] shadow-xs'
                  : 'text-[#121417]/90 hover:bg-black/5'
              }`}
            >
              <div 
                className="flex items-center gap-2 truncate flex-1 cursor-pointer py-1 pl-1"
                onClick={() => handleSelectFolder('general')}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">General / Quick Notes</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedFolderId === 'general' ? 'bg-[#EBF755] text-black' : 'bg-[#121417]/10 text-[#121417]'
                }`}>
                  {generalNotesList.length}
                </span>
                <button
                  onClick={(e) => toggleFolderExpand('general', e)}
                  className={`p-1 rounded-lg transition-colors ${
                    selectedFolderId === 'general' ? 'hover:bg-white/20 text-[#EBF755]' : 'hover:bg-black/10 text-[#121417]/60'
                  }`}
                  title={expandedFolders['general'] ? "Collapse folder" : "Expand folder"}
                >
                  {expandedFolders['general'] ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded General Notes Tree */}
            {expandedFolders['general'] && (
              <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-[#121417]/10 ml-3.5 my-1">
                <button
                  onClick={handleCreateGeneralNote}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-black bg-[#EBF755] hover:bg-[#E2EF43] text-black border border-[#121417]/20 transition-all shadow-2xs mb-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ New Quick Note</span>
                </button>
                {generalNotesList.length === 0 ? (
                  <p className="text-[10px] text-[#121417]/50 italic px-2 py-1">
                    No quick notes yet. Click + to create one!
                  </p>
                ) : (
                  generalNotesList.map(({ key, note }) => {
                    const isEditing = editingNoteKey === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setEditingNoteKey(key)}
                        className={`group flex items-center justify-between px-2 py-1 rounded-lg text-xs cursor-pointer transition-colors ${
                          isEditing
                            ? 'bg-[#121417] text-[#EBF755] font-bold'
                            : 'text-[#121417]/80 hover:bg-black/5'
                        }`}
                        title={note.title || 'Untitled Note'}
                      >
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: note.color || '#E5E7EB', border: '1px solid rgba(0,0,0,0.2)' }}
                          />
                          <span className="truncate text-[11px]">
                            {note.title || 'Untitled Note'}
                          </span>
                        </div>
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Divider: PLAYLIST FOLDERS */}
          <div className="pt-3 pb-1 px-3 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#121417]/40">
              YouTube Playlist Folders ({courses.length})
            </span>
          </div>

          {/* Playlist Folders: strictly mapped to user's playlists (with expandable lecture files) */}
          {courses.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#121417]/50 font-medium">
              No playlists added yet. Add a playlist from the header to see its lecture note files!
            </div>
          ) : (
            courses.map(course => {
              const isSelected = selectedFolderId === course.id;
              const isExpanded = Boolean(expandedFolders[course.id]);
              const lectureCount = course.videos.length;
              // Count lectures with notes written
              const withNotesCount = course.videos.filter(v => {
                const note = notes[`${course.id}_${v.id}`];
                return Boolean(note?.content && note.content.replace(/<[^>]+>/g, '').trim());
              }).length;

              return (
                <div key={course.id} className="space-y-0.5">
                  <div
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all group ${
                      isSelected
                        ? 'bg-[#121417] text-[#EBF755] shadow-xs'
                        : 'text-[#121417]/90 hover:bg-black/5'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 truncate flex-1 cursor-pointer pr-1"
                      onClick={() => handleSelectFolder(course.id)}
                    >
                      <BookOpen className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#EBF755]' : 'text-[#121417]/60'}`} />
                      <div className="truncate">
                        <div className="truncate font-black text-xs leading-tight">{course.title}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-[#EBF755]/80' : 'text-[#121417]/50'}`}>
                          {withNotesCount}/{lectureCount} with notes
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                        isSelected ? 'bg-[#EBF755] text-black' : 'bg-[#121417]/10 text-[#121417]'
                      }`}>
                        {lectureCount}
                      </span>
                      <button
                        onClick={(e) => toggleFolderExpand(course.id, e)}
                        className={`p-1 rounded-lg transition-colors ${
                          isSelected ? 'hover:bg-white/20 text-[#EBF755]' : 'hover:bg-black/10 text-[#121417]/60'
                        }`}
                        title={isExpanded ? "Collapse playlist lectures" : "Expand playlist lectures"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Lecture Note Files */}
                  {isExpanded && (
                    <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-[#121417]/10 ml-3.5 my-1 max-h-72 overflow-y-auto">
                      {course.videos.map((video, idx) => {
                        const noteKey = `${course.id}_${video.id}`;
                        const savedNote = notes[noteKey];
                        const hasNoteContent = Boolean(savedNote?.content && savedNote.content.replace(/<[^>]+>/g, '').trim());
                        const isEditing = editingNoteKey === noteKey;

                        return (
                          <div
                            key={video.id}
                            onClick={() => setEditingNoteKey(noteKey)}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isEditing
                                ? 'bg-[#121417] text-[#EBF755] font-black shadow-xs'
                                : 'text-[#121417]/85 hover:bg-black/5'
                            }`}
                            title={`Lecture ${idx + 1}: ${video.title} (${hasNoteContent ? 'Has written notes' : 'Empty note file - click to write'})`}
                          >
                            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/5 text-[#121417]/70 flex-shrink-0 font-bold">
                                {idx + 1}
                              </span>
                              <span className="truncate text-[11px] font-medium leading-tight">
                                {video.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {hasNoteContent ? (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#EBF755] text-black border border-[#121417]/20">
                                  Notes
                                </span>
                              ) : (
                                <span className="text-[9px] text-[#121417]/35 font-bold">
                                  Empty
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJumpToLecture(course.id, video.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-black transition-opacity"
                                title="Watch lecture in workspace"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT PANE: Notes Files Section */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F9F8F5]">
        {/* Top Control Bar: Search, Filter, View Mode, + New Note */}
        <div className="p-3 sm:p-4 border-b border-[#121417]/10 bg-white/70 backdrop-blur-xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${currentFolderTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F9F8F5] text-[#121417] placeholder-slate-400 text-xs pl-8 pr-3 py-2 rounded-xl border border-[#121417]/15 focus:outline-none focus:ring-2 focus:ring-[#EBF755] transition-colors font-medium"
              />
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center bg-[#F9F8F5] p-0.5 rounded-xl border border-[#121417]/15">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-[#121417] transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-xs font-black' : 'opacity-50 hover:opacity-100'
                }`}
                title="Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-[#121417] transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-xs font-black' : 'opacity-50 hover:opacity-100'
                }`}
                title="Compact List"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action button: Create Note for General Notes */}
          <button
            onClick={handleCreateGeneralNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black bg-[#EBF755] hover:bg-[#E2EF43] text-black border-2 border-[#121417] shadow-solid transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            title="Create General Quick Note"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Note</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#121417]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EBF755] text-black border border-[#121417]/20">
                  {selectedFolderId === 'general' ? 'General Notes' : selectedCourse ? 'Playlist Course Folder' : 'Overview'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#121417] tracking-tight">
                {currentFolderTitle}
              </h1>
              <p className="text-xs text-[#121417]/60 font-medium mt-0.5">
                {selectedCourse
                  ? `${selectedCourse.videos.length} Lecture Note Files for this playlist course.`
                  : selectedFolderId === 'general'
                  ? 'Standalone quick notes, cheat sheets, and scratchpads.'
                  : 'All notes across your learning workspace.'}
              </p>
            </div>

            {/* Filter Pills for Playlist Courses */}
            {selectedCourse && (
              <div className="flex items-center gap-1 bg-[#F9F8F5] p-1 rounded-full border border-[#121417]/10 self-start sm:self-auto">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    filterMode === 'all' ? 'bg-[#121417] text-[#EBF755] shadow-xs' : 'text-[#121417]/60 hover:text-[#121417]'
                  }`}
                >
                  All ({selectedCourse.videos.length})
                </button>
                <button
                  onClick={() => setFilterMode('withNotes')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    filterMode === 'withNotes' ? 'bg-[#121417] text-[#EBF755] shadow-xs' : 'text-[#121417]/60 hover:text-[#121417]'
                  }`}
                >
                  With Notes
                </button>
                <button
                  onClick={() => setFilterMode('empty')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    filterMode === 'empty' ? 'bg-[#121417] text-[#EBF755] shadow-xs' : 'text-[#121417]/60 hover:text-[#121417]'
                  }`}
                >
                  Empty
                </button>
                <button
                  onClick={() => setFilterMode('pinned')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    filterMode === 'pinned' ? 'bg-[#121417] text-[#EBF755] shadow-xs' : 'text-[#121417]/60 hover:text-[#121417]'
                  }`}
                >
                  Pinned
                </button>
              </div>
            )}
          </div>

          {/* VIEW 1: PLAYLIST FOLDER SELECTED (Shows note files for every lecture in that playlist) */}
          {selectedCourse && (
            <PlaylistCourseNotesView
              course={selectedCourse}
              notes={notes}
              searchQuery={searchQuery}
              filterMode={filterMode}
              viewMode={viewMode}
              onOpenNote={(noteKey) => setEditingNoteKey(noteKey)}
              onPinToggle={(noteKey, currentPin) => saveNote(noteKey, { isPinned: !currentPin })}
              onColorChange={(noteKey, color) => saveNote(noteKey, { color })}
              onCopyNote={(noteKey, note) => handleCopyNote(noteKey, note)}
              copiedKey={copiedKey}
              onJumpToLecture={(videoId) => handleJumpToLecture(selectedCourse.id, videoId)}
              activePaletteKey={activePaletteKey}
              setActivePaletteKey={setActivePaletteKey}
            />
          )}

          {/* VIEW 2: GENERAL NOTES FOLDER SELECTED */}
          {selectedFolderId === 'general' && (
            <GeneralNotesView
              generalNotes={generalNotesList}
              searchQuery={searchQuery}
              viewMode={viewMode}
              onOpenNote={(noteKey) => setEditingNoteKey(noteKey)}
              onPinToggle={(noteKey, currentPin) => saveNote(noteKey, { isPinned: !currentPin })}
              onColorChange={(noteKey, color) => saveNote(noteKey, { color })}
              onCopyNote={(noteKey, note) => handleCopyNote(noteKey, note)}
              copiedKey={copiedKey}
              onDeleteNote={(noteKey, title) => handleDeleteGeneralNote(noteKey, title)}
              onCreateNew={handleCreateGeneralNote}
              activePaletteKey={activePaletteKey}
              setActivePaletteKey={setActivePaletteKey}
            />
          )}

          {/* VIEW 3: ALL NOTES OR PINNED NOTES SELECTED */}
          {(selectedFolderId === 'all' || selectedFolderId === 'pinned') && (
            <AllOrPinnedNotesView
              mode={selectedFolderId as 'all' | 'pinned'}
              writtenLectures={writtenLectureNotes}
              generalNotes={generalNotesList}
              searchQuery={searchQuery}
              viewMode={viewMode}
              onOpenNote={(noteKey) => setEditingNoteKey(noteKey)}
              onPinToggle={(noteKey, currentPin) => saveNote(noteKey, { isPinned: !currentPin })}
              onColorChange={(noteKey, color) => saveNote(noteKey, { color })}
              onCopyNote={(noteKey, note) => handleCopyNote(noteKey, note)}
              copiedKey={copiedKey}
              onDeleteNote={(noteKey, title) => handleDeleteGeneralNote(noteKey, title)}
              onJumpToLecture={handleJumpToLecture}
              activePaletteKey={activePaletteKey}
              setActivePaletteKey={setActivePaletteKey}
            />
          )}
        </div>
      </main>

      {/* FULL NOTE MODAL / DRAWER */}
      {editingNoteKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-3xl h-[85vh] bg-white rounded-3xl border-2 border-[#121417] shadow-solid-lg overflow-hidden flex flex-col">
            {/* Modal Header Bar */}
            <div className="px-4 py-2.5 bg-black/[0.03] border-b border-[#121417]/10 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-[#121417]/20 text-[#121417]">
                  {notes[editingNoteKey]?.courseId && notes[editingNoteKey]?.courseId !== 'general'
                    ? (courses.find(c => c.id === notes[editingNoteKey]?.courseId)?.title || 'Course Lecture')
                    : 'General Quick Note'}
                </span>
                {notes[editingNoteKey]?.videoId && notes[editingNoteKey]?.videoId !== 'default' && !notes[editingNoteKey]?.videoId.startsWith('note_') && (
                  <button
                    onClick={() => {
                      const n = notes[editingNoteKey];
                      if (n) {
                        setEditingNoteKey(null);
                        handleJumpToLecture(n.courseId, n.videoId);
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors"
                    title="Watch this lecture in workspace"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Watch Lecture</span>
                  </button>
                )}
              </div>
            </div>

            {/* Embedded Editor with Full Formatting */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <NotesEditor
                noteKey={editingNoteKey}
                onClose={() => setEditingNoteKey(null)}
                fullWidth={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SUB-VIEW 1: PLAYLIST COURSE NOTES VIEW
// ==========================================
interface PlaylistCourseNotesViewProps {
  course: Course;
  notes: Record<string, VideoNote>;
  searchQuery: string;
  filterMode: 'all' | 'withNotes' | 'empty' | 'pinned';
  viewMode: 'grid' | 'list';
  onOpenNote: (key: string) => void;
  onPinToggle: (key: string, isPinned: boolean) => void;
  onColorChange: (key: string, color: string) => void;
  onCopyNote: (key: string, note: VideoNote) => void;
  copiedKey: string | null;
  onJumpToLecture: (videoId: string) => void;
  activePaletteKey: string | null;
  setActivePaletteKey: (key: string | null) => void;
}

const PlaylistCourseNotesView: React.FC<PlaylistCourseNotesViewProps> = ({
  course,
  notes,
  searchQuery,
  filterMode,
  viewMode,
  onOpenNote,
  onPinToggle,
  onColorChange,
  onCopyNote,
  copiedKey,
  onJumpToLecture,
  activePaletteKey,
  setActivePaletteKey,
}) => {
  // Generate lecture note files for every lecture in course.videos
  const lectureFiles = useMemo(() => {
    return course.videos.map((video, idx) => {
      const key = `${course.id}_${video.id}`;
      const savedNote = notes[key];
      const hasContent = Boolean(savedNote?.content && savedNote.content.replace(/<[^>]+>/g, '').trim());
      const note: VideoNote = savedNote || {
        videoId: video.id,
        courseId: course.id,
        title: video.title,
        content: '',
        color: '#ffffff',
        isPinned: false,
        updatedAt: 0,
      };

      return {
        key,
        video,
        note,
        hasContent,
        lectureIndex: idx + 1,
      };
    });
  }, [course, notes]);

  // Filter lecture files
  const filteredFiles = useMemo(() => {
    return lectureFiles.filter(({ video, note, hasContent }) => {
      // 1. Filter mode
      if (filterMode === 'withNotes' && !hasContent) return false;
      if (filterMode === 'empty' && hasContent) return false;
      if (filterMode === 'pinned' && !note.isPinned) return false;

      // 2. Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (note.title || video.title).toLowerCase().includes(q);
        const textContent = (note.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        const matchesContent = textContent.includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }

      return true;
    });
  }, [lectureFiles, filterMode, searchQuery]);

  if (filteredFiles.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-sm mx-auto p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid flex flex-col items-center">
          <BookOpen className="w-10 h-10 text-[#121417]/50 mb-3" />
          <h3 className="text-base font-black text-[#121417] mb-1">No Lectures Match Filter</h3>
          <p className="text-xs text-[#121417]/60 leading-relaxed font-medium">
            Try switching the filter pill above or clearing your search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
    }>
      {filteredFiles.map(({ key, video, note, hasContent, lectureIndex }) => {
        const isCopied = copiedKey === key;
        const isPaletteOpen = activePaletteKey === key;

        return (
          <div
            key={key}
            onClick={() => onOpenNote(key)}
            className={`group relative rounded-2xl border-2 border-[#121417] shadow-solid hover:shadow-solid-lg transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden ${
              viewMode === 'list' ? 'p-3 sm:p-4' : 'p-4'
            }`}
            style={{ backgroundColor: note.color || '#ffffff' }}
          >
            <div>
              {/* Lecture Index & Pin Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 border border-black/10 text-[#121417]">
                    Lecture {lectureIndex}
                  </span>
                  {video.duration && (
                    <span className="text-[10px] font-mono text-[#121417]/60 font-bold">
                      {video.duration}
                    </span>
                  )}
                  {video.completed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle(key, note.isPinned);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    note.isPinned 
                      ? 'bg-[#121417] text-[#EBF755] scale-105' 
                      : 'text-[#121417]/40 hover:bg-black/10 hover:text-[#121417]'
                  }`}
                  title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Lecture / Note Title */}
              <h3 className="text-sm font-black text-[#121417] leading-snug line-clamp-2 mb-2 group-hover:text-black">
                {note.title || video.title}
              </h3>

              {/* Note Preview or Placeholder */}
              {hasContent ? (
                <div 
                  className="prose prose-sm text-xs text-[#121417]/80 line-clamp-4 leading-relaxed pointer-events-none mb-3"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-black/20 bg-black/[0.02] text-center my-2 group-hover:bg-[#EBF755]/20 transition-colors">
                  <p className="text-[11px] text-[#121417]/50 font-bold flex items-center justify-center gap-1">
                    <Edit3 className="w-3 h-3 text-[#121417]/40" />
                    <span>No notes yet. Click to write notes!</span>
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div 
              className="pt-2.5 border-t border-black/10 flex items-center justify-between gap-1 text-[10px] text-[#121417]/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 font-mono font-bold">
                {note.updatedAt > 0 ? (
                  <>
                    <Clock className="w-3 h-3 text-[#121417]/40" />
                    <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-[#121417]/40">Ready to note</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Watch Lecture in Workspace */}
                <button
                  onClick={() => onJumpToLecture(video.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black text-[#EBF755] hover:bg-black/80 font-black text-[10px] transition-transform active:scale-95 shadow-2xs"
                  title="Watch this lecture in workspace"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Watch</span>
                </button>

                {/* Color Palette Picker */}
                <div className="relative">
                  <button
                    onClick={() => setActivePaletteKey(isPaletteOpen ? null : key)}
                    className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                    title="Change note color"
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-[#121417]/40" 
                      style={{ backgroundColor: note.color || '#ffffff' }}
                    />
                  </button>

                  {isPaletteOpen && (
                    <div className="absolute bottom-full right-0 mb-1 flex flex-wrap gap-1 bg-white p-2 rounded-xl shadow-solid border-2 border-[#121417] z-30 w-36 animate-fade-in">
                      {PRESET_NOTE_COLORS.map(c => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onColorChange(key, c.hex);
                            setActivePaletteKey(null);
                          }}
                          className={`w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform ${
                            (note.color || '#ffffff') === c.hex ? 'ring-2 ring-black' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Copy Note Content */}
                {hasContent && (
                  <button
                    onClick={() => onCopyNote(key, note)}
                    className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                    title="Copy note text"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// SUB-VIEW 2: GENERAL NOTES VIEW
// ==========================================
interface GeneralNotesViewProps {
  generalNotes: { key: string; note: VideoNote }[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onOpenNote: (key: string) => void;
  onPinToggle: (key: string, isPinned: boolean) => void;
  onColorChange: (key: string, color: string) => void;
  onCopyNote: (key: string, note: VideoNote) => void;
  copiedKey: string | null;
  onDeleteNote: (key: string, title: string) => void;
  onCreateNew: () => void;
  activePaletteKey: string | null;
  setActivePaletteKey: (key: string | null) => void;
}

const GeneralNotesView: React.FC<GeneralNotesViewProps> = ({
  generalNotes,
  searchQuery,
  viewMode,
  onOpenNote,
  onPinToggle,
  onColorChange,
  onCopyNote,
  copiedKey,
  onDeleteNote,
  onCreateNew,
  activePaletteKey,
  setActivePaletteKey,
}) => {
  const filtered = useMemo(() => {
    return generalNotes.filter(({ note }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (note.title || '').toLowerCase().includes(q);
        const textContent = (note.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        return matchesTitle || textContent.includes(q);
      }
      return true;
    });
  }, [generalNotes, searchQuery]);

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-sm mx-auto p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid flex flex-col items-center">
          <FileText className="w-12 h-12 text-[#121417]/50 mb-3" />
          <h3 className="text-base font-black text-[#121417] mb-1">No General Notes Found</h3>
          <p className="text-xs text-[#121417]/60 leading-relaxed font-medium mb-5">
            General notes are common notes accessible across every playlist and lecture in your workspace.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-full text-xs font-black bg-[#EBF755] hover:bg-[#E2EF43] text-black border-2 border-[#121417] shadow-solid transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Quick Note</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
    }>
      {filtered.map(({ key, note }) => {
        const isCopied = copiedKey === key;
        const isPaletteOpen = activePaletteKey === key;

        return (
          <div
            key={key}
            onClick={() => onOpenNote(key)}
            className={`group relative rounded-2xl border-2 border-[#121417] shadow-solid hover:shadow-solid-lg transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden ${
              viewMode === 'list' ? 'p-3 sm:p-4' : 'p-4'
            }`}
            style={{ backgroundColor: note.color || '#ffffff' }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 border border-black/10 text-[#121417]">
                  General Note
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle(key, note.isPinned);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    note.isPinned 
                      ? 'bg-[#121417] text-[#EBF755] scale-105' 
                      : 'text-[#121417]/40 hover:bg-black/10 hover:text-[#121417]'
                  }`}
                  title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h3 className="text-sm font-black text-[#121417] leading-snug line-clamp-2 mb-2">
                {note.title || 'Untitled Quick Note'}
              </h3>

              <div 
                className="prose prose-sm text-xs text-[#121417]/80 line-clamp-4 leading-relaxed pointer-events-none mb-3"
                dangerouslySetInnerHTML={{ __html: note.content || '<p class="italic opacity-50">Empty quick note...</p>' }}
              />
            </div>

            <div 
              className="pt-2.5 border-t border-black/10 flex items-center justify-between gap-1 text-[10px] text-[#121417]/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 font-mono font-bold">
                <Clock className="w-3 h-3 text-[#121417]/40" />
                <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Color Palette */}
                <div className="relative">
                  <button
                    onClick={() => setActivePaletteKey(isPaletteOpen ? null : key)}
                    className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                    title="Change note color"
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-[#121417]/40" 
                      style={{ backgroundColor: note.color || '#ffffff' }}
                    />
                  </button>

                  {isPaletteOpen && (
                    <div className="absolute bottom-full right-0 mb-1 flex flex-wrap gap-1 bg-white p-2 rounded-xl shadow-solid border-2 border-[#121417] z-30 w-36 animate-fade-in">
                      {PRESET_NOTE_COLORS.map(c => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onColorChange(key, c.hex);
                            setActivePaletteKey(null);
                          }}
                          className={`w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform ${
                            (note.color || '#ffffff') === c.hex ? 'ring-2 ring-black' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Copy */}
                <button
                  onClick={() => onCopyNote(key, note)}
                  className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                  title="Copy Note Text"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteNote(key, note.title)}
                  className="p-1.5 rounded-lg text-[#121417]/40 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// SUB-VIEW 3: ALL OR PINNED NOTES VIEW
// ==========================================
interface AllOrPinnedNotesViewProps {
  mode: 'all' | 'pinned';
  writtenLectures: { key: string; note: VideoNote; course: Course; video: VideoItem; lectureIndex: number }[];
  generalNotes: { key: string; note: VideoNote }[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onOpenNote: (key: string) => void;
  onPinToggle: (key: string, isPinned: boolean) => void;
  onColorChange: (key: string, color: string) => void;
  onCopyNote: (key: string, note: VideoNote) => void;
  copiedKey: string | null;
  onDeleteNote: (key: string, title: string) => void;
  onJumpToLecture: (courseId: string, videoId: string) => void;
  activePaletteKey: string | null;
  setActivePaletteKey: (key: string | null) => void;
}

const AllOrPinnedNotesView: React.FC<AllOrPinnedNotesViewProps> = ({
  mode,
  writtenLectures,
  generalNotes,
  searchQuery,
  viewMode,
  onOpenNote,
  onPinToggle,
  onColorChange,
  onCopyNote,
  copiedKey,
  onDeleteNote,
  onJumpToLecture,
  activePaletteKey,
  setActivePaletteKey,
}) => {
  // Combine all notes into unified list
  const combined = useMemo(() => {
    const lectureItems = writtenLectures.map(l => ({
      key: l.key,
      note: l.note,
      type: 'lecture' as const,
      courseTitle: l.course.title,
      courseId: l.course.id,
      videoId: l.video.id,
      lectureIndex: l.lectureIndex,
    }));

    const generalItems = generalNotes.map(g => ({
      key: g.key,
      note: g.note,
      type: 'general' as const,
      courseTitle: 'General Note',
      courseId: 'general',
      videoId: g.note.videoId,
      lectureIndex: 0,
    }));

    let all = [...lectureItems, ...generalItems];

    if (mode === 'pinned') {
      all = all.filter(item => item.note.isPinned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(item => {
        const matchesTitle = (item.note.title || '').toLowerCase().includes(q);
        const matchesCourse = item.courseTitle.toLowerCase().includes(q);
        const textContent = (item.note.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        return matchesTitle || matchesCourse || textContent.includes(q);
      });
    }

    // Sort by updated time
    return all.sort((a, b) => (b.note.updatedAt || 0) - (a.note.updatedAt || 0));
  }, [writtenLectures, generalNotes, mode, searchQuery]);

  if (combined.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-sm mx-auto p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid flex flex-col items-center">
          <Layers className="w-12 h-12 text-[#121417]/40 mb-3" />
          <h3 className="text-base font-black text-[#121417] mb-1">
            {mode === 'pinned' ? 'No Pinned Notes' : 'No Written Notes Yet'}
          </h3>
          <p className="text-xs text-[#121417]/60 leading-relaxed font-medium">
            {mode === 'pinned'
              ? 'Click the pin icon on any lecture note or general note to pin it here.'
              : 'Start watching lectures or write quick notes to see them aggregated here.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-3'
    }>
      {combined.map(item => {
        const isCopied = copiedKey === item.key;
        const isPaletteOpen = activePaletteKey === item.key;

        return (
          <div
            key={item.key}
            onClick={() => onOpenNote(item.key)}
            className={`group relative rounded-2xl border-2 border-[#121417] shadow-solid hover:shadow-solid-lg transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden ${
              viewMode === 'list' ? 'p-3 sm:p-4' : 'p-4'
            }`}
            style={{ backgroundColor: item.note.color || '#ffffff' }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 border border-black/10 text-[#121417] truncate max-w-[160px]">
                  {item.type === 'lecture' ? `Lecture ${item.lectureIndex} • ${item.courseTitle}` : 'General Note'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle(item.key, item.note.isPinned);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    item.note.isPinned 
                      ? 'bg-[#121417] text-[#EBF755] scale-105' 
                      : 'text-[#121417]/40 hover:bg-black/10 hover:text-[#121417]'
                  }`}
                  title={item.note.isPinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className={`w-3.5 h-3.5 ${item.note.isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h3 className="text-sm font-black text-[#121417] leading-snug line-clamp-2 mb-2">
                {item.note.title || 'Untitled Note'}
              </h3>

              <div 
                className="prose prose-sm text-xs text-[#121417]/80 line-clamp-4 leading-relaxed pointer-events-none mb-3"
                dangerouslySetInnerHTML={{ __html: item.note.content || '<p class="italic opacity-50">Empty note...</p>' }}
              />
            </div>

            <div 
              className="pt-2.5 border-t border-black/10 flex items-center justify-between gap-1 text-[10px] text-[#121417]/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 font-mono font-bold">
                <Clock className="w-3 h-3 text-[#121417]/40" />
                <span>{new Date(item.note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-1">
                {item.type === 'lecture' && (
                  <button
                    onClick={() => onJumpToLecture(item.courseId, item.videoId)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black text-[#EBF755] hover:bg-black/80 font-black text-[10px] transition-transform active:scale-95 shadow-2xs"
                    title="Watch this lecture in workspace"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Watch</span>
                  </button>
                )}

                {/* Color Palette */}
                <div className="relative">
                  <button
                    onClick={() => setActivePaletteKey(isPaletteOpen ? null : item.key)}
                    className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                    title="Change note color"
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-[#121417]/40" 
                      style={{ backgroundColor: item.note.color || '#ffffff' }}
                    />
                  </button>

                  {isPaletteOpen && (
                    <div className="absolute bottom-full right-0 mb-1 flex flex-wrap gap-1 bg-white p-2 rounded-xl shadow-solid border-2 border-[#121417] z-30 w-36 animate-fade-in">
                      {PRESET_NOTE_COLORS.map(c => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onColorChange(item.key, c.hex);
                            setActivePaletteKey(null);
                          }}
                          className={`w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform ${
                            (item.note.color || '#ffffff') === c.hex ? 'ring-2 ring-black' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Copy */}
                <button
                  onClick={() => onCopyNote(item.key, item.note)}
                  className="p-1.5 rounded-lg text-[#121417]/60 hover:bg-black/10 transition-colors"
                  title="Copy Note Text"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {item.type === 'general' && (
                  <button
                    onClick={() => onDeleteNote(item.key, item.note.title)}
                    className="p-1.5 rounded-lg text-[#121417]/40 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
