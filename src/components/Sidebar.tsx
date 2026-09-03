import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Search, 
  CheckCheck, 
  Trash2, 
  BookOpen, 
  FolderPlus, 
  Layers, 
  ChevronDown, 
  Clock 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    courses,
    activeCourse,
    activeVideoId,
    setActiveCourseId,
    setActiveVideoId,
    toggleVideoCompletion,
    markCourseCompleted,
    deleteCourse,
    setIsAddModalOpen,
    isSidebarOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  if (!isSidebarOpen) return null;

  const filteredVideos = activeCourse.videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'pending') return !video.completed;
    if (filterMode === 'completed') return video.completed;
    return true;
  });

  const totalVideos = activeCourse.videos.length;
  const completedVideos = activeCourse.videos.filter(v => v.completed).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <aside className="w-80 sm:w-88 flex-shrink-0 h-[calc(100vh-4rem)] flex flex-col border-r border-slate-800 bg-slate-950/60 backdrop-blur-xl">
      {/* Course Selector Dropdown */}
      <div className="p-3.5 border-b border-slate-800/80">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
          Current Course
        </label>
        <div className="relative">
          <button
            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                  {activeCourse.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {completedVideos}/{totalVideos} completed ({progressPercent}%)
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-1.5 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {isCourseDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-fade-in max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Course
              </div>
              {courses.map(course => {
                const isCurrent = course.id === activeCourse.id;
                const doneCount = course.videos.filter(v => v.completed).length;
                return (
                  <div
                    key={course.id}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-indigo-500/15 text-indigo-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    onClick={() => {
                      setActiveCourseId(course.id);
                      setIsCourseDropdownOpen(false);
                    }}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{course.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {doneCount}/{course.videos.length} completed
                      </div>
                    </div>
                    {courses.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${course.title}"?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-opacity"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => {
                  setIsCourseDropdownOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Add / Import New Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tracklist Controls & Search */}
      <div className="p-3.5 space-y-2.5 border-b border-slate-800/80">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                filterMode === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({activeCourse.videos.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                filterMode === 'pending' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Remaining ({totalVideos - completedVideos})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                filterMode === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({completedVideos})
            </button>
          </div>

          <button
            onClick={() => markCourseCompleted(activeCourse.id, completedVideos !== totalVideos)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-lg transition-colors"
            title={completedVideos === totalVideos ? "Mark all uncompleted" : "Mark all completed"}
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Videos List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-slate-400">No videos match your filter.</p>
          </div>
        ) : (
          filteredVideos.map((video) => {
            const isActive = video.id === activeVideoId;
            return (
              <div
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white shadow-sm shadow-indigo-500/10'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`}
              >
                {/* Completion Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoCompletion(activeCourse.id, video.id);
                  }}
                  className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                  title={video.completed ? "Mark as in-progress" : "Mark as completed"}
                >
                  {video.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="flex-shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-indigo-500 text-white">
                        <Play className="w-2 h-2 fill-current ml-0.2" />
                      </span>
                    )}
                    <h4
                      className={`text-xs font-medium leading-snug line-clamp-2 ${
                        video.completed ? 'text-slate-400 line-through decoration-slate-600' : ''
                      } ${isActive ? 'text-indigo-200 font-semibold' : ''}`}
                    >
                      {video.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    {video.duration && (
                      <span className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/80 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {video.duration}
                      </span>
                    )}
                    {video.completed && (
                      <span className="text-emerald-400 font-medium">Completed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Track Summary */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-xs flex items-center justify-between text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>{totalVideos} Lectures Total</span>
        </span>
        <span className="text-[11px] font-mono text-indigo-300 font-semibold">
          {progressPercent}% Done
        </span>
      </div>
    </aside>
  );
};
