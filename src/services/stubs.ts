/**
 * Stub data used in demo mode when no Apple Music account is present.
 */
import type { Playlist, Song } from '../types';

export const STUB_PLAYLISTS: Playlist[] = [
  { id: 'stub-1', name: 'Chill Vibes', songCount: 5 },
  { id: 'stub-2', name: 'Workout Mix', songCount: 5 },
  { id: 'stub-3', name: 'Road Trip', songCount: 5 },
];

/** Candidate songs shown in demo add mode. */
export const STUB_SONGS: Song[] = [
  { id: 'stub-s1', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: 167 },
  { id: 'stub-s2', title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: 201 },
  { id: 'stub-s3', title: 'About Damn Time', artist: 'Lizzo', album: 'Special', duration: 193 },
  { id: 'stub-s4', title: 'Bad Habit', artist: 'Steve Lacy', album: 'Gemini Rights', duration: 232 },
  { id: 'stub-s5', title: 'Unholy', artist: 'Sam Smith', album: 'Gloria', duration: 156 },
];
