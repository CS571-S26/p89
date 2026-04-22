/**
 * Stub data used in demo mode when no Apple Music account is present.
 * Preview URLs and artwork sourced from the iTunes Search API.
 */
import type { Playlist, Song } from '../types';

export const STUB_PLAYLISTS: Playlist[] = [
  { id: 'stub-1', name: 'Chill Vibes', songCount: 5 },
  { id: 'stub-2', name: 'Workout Mix', songCount: 5 },
  { id: 'stub-3', name: 'Road Trip', songCount: 5 },
];

const STUB_SONGS_CHILL: Song[] = [
  {
    id: 'stub-s1',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    duration: 167,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-s2',
    title: 'Bad Habit',
    artist: 'Steve Lacy',
    album: 'Gemini Rights',
    duration: 232,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b5/f3/90/b5f390d1-ab47-f76e-4311-89ad4a34333f/mzaf_802265940992462461.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f4/b4/c4/f4b4c458-e52c-859b-fdef-2600dd4fe768/196589380630.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-s3',
    title: 'golden hour',
    artist: 'JVKE',
    album: 'this is what ____ feels like (Vol. 1-4)',
    duration: 209,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/30/02/8c/30028c8a-a125-5466-bcc6-27a83b1c0135/mzaf_16911571635366913039.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8d/1a/7b/8d1a7b44-316f-7c7f-4380-935673fb697a/5056167175650.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-s4',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 204,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-s5',
    title: 'Sunflower (Spider-Man: Into the Spider-Verse)',
    artist: 'Post Malone & Swae Lee',
    album: 'Spider-Man: Into the Spider-Verse',
    duration: 158,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9f/db/b1/9fdbb10d-2d33-3cd4-48e9-7f745521cfdf/mzaf_15956051401758554866.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/300x300bb.jpg',
  },
];

const STUB_SONGS_WORKOUT: Song[] = [
  {
    id: 'stub-w1',
    title: 'About Damn Time',
    artist: 'Lizzo',
    album: 'Special',
    duration: 193,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/91/7f/d0/917fd0db-a269-6fab-b0e6-301dd111a5b3/mzaf_14061156704503787029.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b8/20/f9/b820f951-e53c-93bf-e75d-33df6165e7c1/075679736109.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-w2',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: 201,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-w3',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    duration: 201,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/9e/f7/689ef7fe-14fe-a846-c87f-7d3b2d6344b1/mzaf_4167137058064023087.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-w4',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-w5',
    title: 'Enemy (From Arcane: League of Legends)',
    artist: 'Imagine Dragons & JID',
    album: 'Enemy (From Arcane: League of Legends) - Single',
    duration: 173,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f9/8b/d9/f98bd9a6-96d2-b8fd-1848-0de12814aec6/mzaf_18165369050311284240.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/76/77/08/767708a7-ec93-3b3d-3bac-40086e5a265c/21UM1IM29634.rgb.jpg/300x300bb.jpg',
  },
];

const STUB_SONGS_ROAD_TRIP: Song[] = [
  {
    id: 'stub-r1',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    album: 'Direct Hits',
    duration: 224,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b3/95/6e/b3956e14-35f0-937e-afb0-72774d3f613f/mzaf_8359343604382181711.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/64/9c/11649c80-2066-dba8-77a9-df7eecae26c1/17UM1IM06937.rgb.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-r2',
    title: "Don't Stop Believin' (2022 Remaster)",
    artist: 'Journey',
    album: 'Escape (2022 Remaster)',
    duration: 250,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/f7/fe/40/f7fe405a-0526-60b5-9898-b555e4146c8d/mzaf_11089651359573769705.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/47/d6/fe/47d6fe2f-b14c-d8a7-597c-8a40e094364e/886449932795.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-r3',
    title: 'Africa',
    artist: 'Toto',
    album: 'Toto IV',
    duration: 295,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/12/e5/ba/12e5ba45-05c1-7060-25a8-c9b718e7f6e8/mzaf_4488601364870711408.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/69/ce/d2/69ced240-07a7-2a04-bbab-2afbacf30809/074643772822.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-r4',
    title: 'Take On Me',
    artist: 'a-ha',
    album: '25 (Deluxe Version)',
    duration: 229,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/75/59/46/755946b7-b806-722a-052a-ac2817b73003/mzaf_9236712906892068518.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3e/0a/38/3e0a38d9-b138-429a-61e1-aeac2fad3263/mzi.iefykuuf.jpg/300x300bb.jpg',
  },
  {
    id: 'stub-r5',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    album: 'All Time Greatest Hits',
    duration: 283,
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/19/67/9e/19679e49-2dcb-c44f-2244-391bb4fb7e1d/mzaf_10147574816943411315.plus.aac.p.m4a',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/ff/39/ccff392e-ec9d-1ffd-6c1b-d21978bca939/06UMGIM02061.rgb.jpg/300x300bb.jpg',
  },
];

/** Maps each demo playlist ID to its candidate songs. */
export const STUB_SONGS_BY_PLAYLIST: Record<string, Song[]> = {
  'stub-1': STUB_SONGS_CHILL,
  'stub-2': STUB_SONGS_WORKOUT,
  'stub-3': STUB_SONGS_ROAD_TRIP,
};
