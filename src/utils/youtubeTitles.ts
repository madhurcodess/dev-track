import type { VideoItem } from '../types';
import { CODER_ARMY_JAVA_57_VIDEOS } from '../data/javaCourseData';

// Cache to prevent duplicate network calls across views
const TITLE_CACHE = new Map<string, string>();

// Seed cache with known video titles
CODER_ARMY_JAVA_57_VIDEOS.forEach(v => {
  if (v.youtubeId) {
    TITLE_CACHE.set(v.youtubeId, v.title);
  }
});

/**
 * Fetch real video title from YouTube official oEmbed API (CORS enabled)
 */
export async function fetchYouTubeVideoTitle(videoId: string): Promise<string | null> {
  if (!videoId || videoId.length !== 11) return null;

  if (TITLE_CACHE.has(videoId)) {
    return TITLE_CACHE.get(videoId)!;
  }

  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.title) {
      const cleanTitle = data.title.trim();
      TITLE_CACHE.set(videoId, cleanTitle);
      return cleanTitle;
    }
  } catch {
    // Network or CORS fallback
  }

  return null;
}

/**
 * Check if a title is generic (e.g. "Lecture 06", "Lecture 12", "01. Loading course playlist...")
 */
export function isGenericLectureTitle(title: string): boolean {
  if (!title) return true;
  const trimmed = title.trim();
  return (
    trimmed.startsWith('Lecture') ||
    trimmed.includes('Loading course') ||
    trimmed.includes('Orientation Module') ||
    trimmed.includes('Capstone Project') ||
    /^(Lecture\s*\d+|\d+\.\s*Lecture\s*\d+)$/i.test(trimmed)
  );
}

/**
 * Resolve and populate real YouTube titles for any list of videos
 */
export async function resolvePlaylistTitles(
  videos: VideoItem[],
  onChunkUpdate?: (updatedList: VideoItem[]) => void
): Promise<VideoItem[]> {
  if (!videos || videos.length === 0) return videos;

  let currentVideos = [...videos];
  let hasAnyChanges = false;

  // 1. Instant check against known playlist databases (e.g. Coder Army 57 lectures)
  const isCoderArmy = currentVideos.some(v => v.youtubeId === 'LBqE4YOvhyc' || v.youtubeId === 'pdS8_smlsXA');
  if (isCoderArmy) {
    const coderArmyMap = new Map(CODER_ARMY_JAVA_57_VIDEOS.map(v => [v.youtubeId, v.title]));
    currentVideos = currentVideos.map((v) => {
      const knownTitle = coderArmyMap.get(v.youtubeId);
      if (knownTitle && isGenericLectureTitle(v.title)) {
        hasAnyChanges = true;
        return {
          ...v,
          title: knownTitle,
        };
      }
      return v;
    });

    if (hasAnyChanges && onChunkUpdate) {
      onChunkUpdate([...currentVideos]);
    }
  }

  // 2. Identify remaining generic titles that need network resolution
  const itemsToFetch: { index: number; video: VideoItem }[] = [];
  currentVideos.forEach((v, index) => {
    if (v.youtubeId && isGenericLectureTitle(v.title)) {
      itemsToFetch.push({ index, video: v });
    }
  });

  if (itemsToFetch.length === 0) {
    return currentVideos;
  }

  // 3. Fetch in small concurrent batches of 4
  const BATCH_SIZE = 4;
  for (let i = 0; i < itemsToFetch.length; i += BATCH_SIZE) {
    const batch = itemsToFetch.slice(i, i + BATCH_SIZE);
    let batchChanged = false;

    await Promise.all(
      batch.map(async ({ index, video }) => {
        const rawTitle = await fetchYouTubeVideoTitle(video.youtubeId);
        if (rawTitle) {
          const num = index + 1;
          const prefix = `${String(num).padStart(2, '0')}. `;
          const formattedTitle = rawTitle.startsWith(`${num}.`) || rawTitle.startsWith(prefix)
            ? rawTitle
            : `${prefix}${rawTitle}`;

          currentVideos[index] = {
            ...currentVideos[index],
            title: formattedTitle,
          };
          batchChanged = true;
          hasAnyChanges = true;
        }
      })
    );

    if (batchChanged && onChunkUpdate) {
      onChunkUpdate([...currentVideos]);
    }
  }

  return currentVideos;
}
