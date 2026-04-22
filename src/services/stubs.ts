/**
 * Stub data used in demo mode when no Apple Music account is present.
 */
import type { Playlist, Song } from '../types';

export const STUB_PLAYLISTS: Playlist[] = [
  { id: 'stub-1', name: 'Chill Vibes', songCount: 5 },
  { id: 'stub-2', name: 'Workout Mix', songCount: 5 },
  { id: 'stub-3', name: 'Road Trip', songCount: 5 },
];

export const STUB_SONGS: Song[] = [
  { id: 'stub-s1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200 },
  { id: 'stub-s2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
  { id: 'stub-s3', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: 198 },
  { id: 'stub-s4', title: 'Stay', artist: 'The Kid LAROI', album: 'F*ck Love 3', duration: 141 },
  { id: 'stub-s5', title: 'good 4 u', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178 },
];
