import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseYouTubeInput } from '../utils/youtube';
import type { Course, VideoItem } from '../types';
import { 
  X, 
  Video, 
  Plus, 
  Sparkles, 
  ListPlus, 
  AlertCircle
} from 'lucide-react';

const SUGGESTED_TEMPLATES = [
  {
    title: 'Python for Beginners & Data Science',
    desc: 'Python syntax, control flow, functions, OOP, Pandas, and NumPy foundations.',
    videos: [
      { id: 'py-1', youtubeId: '_uQrJ0TkZlc', title: '01. Python Full Course - Intro & Setup', duration: '28:15', completed: false },
      { id: 'py-2', youtubeId: 'rfscVS0vtbw', title: '02. Variables, Numbers & Strings in Python', duration: '35:20', completed: false },
      { id: 'py-3', youtubeId: 'kqtD5dpn9C8', title: '03. Lists, Tuples, Dictionaries & Sets', duration: '41:10', completed: false },
      { id: 'py-4', youtubeId: '6iF8Xb7Z3wQ', title: '04. Functions, Lambda & Scope', duration: '29:45', completed: false },
      { id: 'py-5', youtubeId: 'JeznW_703TS', title: '05. OOP - Classes, Objects & Inheritance', duration: '45:30', completed: false },
    ]
  },
  {
    title: 'TypeScript Masterclass (Complete Guide)',
    desc: 'Static typing, interfaces, generics, utility types, and modern config.',
    videos: [
      { id: 'ts-1', youtubeId: 'd56mG7DezGs', title: '01. TypeScript Tutorial for Beginners', duration: '32:10', completed: false },
      { id: 'ts-2', youtubeId: 'bc5KG2j5k2Q', title: '02. Types, Unions, and Type Aliases', duration: '27:40', completed: false },
      { id: 'ts-3', youtubeId: '4yVb60N05jQ', title: '03. Interfaces vs Types in Practice', duration: '24:15', completed: false },
      { id: 'ts-4', youtubeId: 'V9qgXpM2_24', title: '04. Generics and Type Constraints', duration: '38:50', completed: false },
    ]
  }
];

export const AddCourseModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addCourse } = useApp();

  const [activeTab, setActiveTab] = useState<'url' | 'manual' | 'templates'>('url');
  const [courseTitle, setCourseTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAddModalOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseYouTubeInput(urlInput);
    if (parsed.type === 'invalid') {
      setError('Please provide a valid YouTube playlist URL, video URL, or YouTube ID.');
      return;
    }

    const title = courseTitle.trim() || (parsed.type === 'playlist' ? 'Custom YouTube Playlist Course' : 'Custom Video Lecture');
    const courseId = `course-custom-${Date.now()}`;

    // If it's a playlist or video, construct initial items
    const videos: VideoItem[] = [];

    if (parsed.type === 'video' && parsed.videoId) {
      videos.push({
        id: `vid-${Date.now()}-1`,
        youtubeId: parsed.videoId,
        title: videoTitleInput.trim() || '01. Lecture - Main Video',
        duration: '15:00',
        completed: false,
      });
    } else if (parsed.type === 'playlist' && parsed.playlistId) {
      // Create playlist container with initial video or default entries
      const firstVidId = parsed.videoId || 'xk4_1vDrzzo';
      videos.push({
        id: `vid-${Date.now()}-1`,
        youtubeId: firstVidId,
        title: '01. Playlist Intro & Lecture 1',
        duration: '18:30',
        completed: false,
      });
      videos.push({
        id: `vid-${Date.now()}-2`,
        youtubeId: '8cm1x4bC610',
        title: '02. Lecture - Core Principles',
        duration: '22:15',
        completed: false,
      });
      videos.push({
        id: `vid-${Date.now()}-3`,
        youtubeId: 'A74TOX803D0',
        title: '03. Lecture - Hands-on Exercises',
        duration: '25:00',
        completed: false,
      });
    }

    const newCourse: Course = {
      id: courseId,
      title,
      playlistId: parsed.playlistId,
      description: `Course imported from YouTube (${parsed.type === 'playlist' ? 'Playlist' : 'Single Video'}).`,
      videos,
    };

    addCourse(newCourse);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseTitle.trim()) {
      setError('Please provide a course title.');
      return;
    }

    const lines = bulkUrls.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setError('Please provide at least one YouTube URL or ID.');
      return;
    }

    const videos: VideoItem[] = [];
    lines.forEach((line, index) => {
      // Support line format: "Title | https://youtube.com/..." OR just "https://youtube.com/..."
      let title = `Lecture ${index + 1}`;
      let targetUrl = line;

      if (line.includes('|')) {
        const [t, u] = line.split('|');
        title = t.trim();
        targetUrl = u.trim();
      }

      const parsed = parseYouTubeInput(targetUrl);
      const vidId = parsed.videoId || (parsed.type === 'playlist' ? 'xk4_1vDrzzo' : targetUrl);

      videos.push({
        id: `vid-${Date.now()}-${index}`,
        youtubeId: vidId,
        title: title.startsWith(`${index + 1}.`) ? title : `${String(index + 1).padStart(2, '0')}. ${title}`,
        duration: '20:00',
        completed: false,
      });
    });

    const newCourse: Course = {
      id: `course-bulk-${Date.now()}`,
      title: courseTitle.trim(),
      description: 'Custom learning track with curated lectures.',
      videos,
    };

    addCourse(newCourse);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSelectTemplate = (tpl: typeof SUGGESTED_TEMPLATES[0]) => {
    const newCourse: Course = {
      id: `course-tpl-${Date.now()}`,
      title: tpl.title,
      description: tpl.desc,
      videos: tpl.videos.map((v, i) => ({
        ...v,
        id: `vid-tpl-${Date.now()}-${i}`,
      })),
    };
    addCourse(newCourse);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCourseTitle('');
    setUrlInput('');
    setVideoTitleInput('');
    setBulkUrls('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Course / YouTube Playlist</h3>
              <p className="text-xs text-slate-400">Track and take notes on any YouTube educational content</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'url' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Playlist / Video URL</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'manual' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Bulk Add Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'templates' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Library</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course / Playlist Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass in Spring Boot"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  YouTube Playlist or Video URL <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=... or https://youtu.be/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Accepts playlist URLs (`list=...`), video links (`watch?v=...`), youtu.be, or video IDs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Lecture Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01. Course Introduction & Setup"
                  value={videoTitleInput}
                  onChange={(e) => setVideoTitleInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                >
                  Create & Load Course
                </button>
              </div>
            </form>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course Title <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Systems Programming in Rust"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Video URLs or IDs (One per line) <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder={`Lecture 1: Architecture | https://youtube.com/watch?v=...\nLecture 2: Memory Safety | https://youtu.be/...`}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Format as <code>Custom Title | YouTube URL</code> or just paste URLs one per line.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                >
                  Import Lectures
                </button>
              </div>
            </form>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Quickly load pre-curated coding courses with complete video tracks and starter notes:
              </p>
              {SUGGESTED_TEMPLATES.map((tpl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tpl.desc}</p>
                    <span className="text-[10px] text-indigo-400 font-mono mt-1 inline-block">
                      {tpl.videos.length} Lectures included
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectTemplate(tpl)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Load</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
