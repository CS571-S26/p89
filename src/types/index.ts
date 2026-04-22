/**
 * Core domain types for Audify.
 */

/** A single track in a playlist or search result. */
export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Duration in seconds. */
  duration: number;
  artworkUrl?: string;
  /** URL for a short audio preview clip. */
  previewUrl?: string;
};

/** A user playlist. */
export type Playlist = {
  id: string;
  name: string;
  songCount: number;
  artworkUrl?: string;
};

/** Direction of a completed swipe gesture. */
export type SwipeDirection = 'keep' | 'discard';
