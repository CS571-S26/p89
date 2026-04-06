/**
 * Tests for SwipeCard.
 */
import { render, screen } from '@testing-library/react';
import SwipeCard from '../components/SwipeCard';
import type { Song } from '../types';

const STUB_SONG: Song = {
  id: '1',
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  album: 'After Hours',
  duration: 200,
};

describe('SwipeCard', () => {
  it('renders the song title, artist, and album', () => {
    render(<SwipeCard song={STUB_SONG} onSwipe={vi.fn()} />);
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument();
    expect(screen.getByText('The Weeknd')).toBeInTheDocument();
    expect(screen.getByText('After Hours')).toBeInTheDocument();
  });

  it('renders the artwork placeholder when no artworkUrl is provided', () => {
    render(<SwipeCard song={STUB_SONG} onSwipe={vi.fn()} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an img when artworkUrl is provided', () => {
    const song: Song = { ...STUB_SONG, artworkUrl: 'https://example.com/art.jpg' };
    render(<SwipeCard song={song} onSwipe={vi.fn()} />);
    expect(screen.getByRole('img', { name: /artwork/i })).toBeInTheDocument();
  });
});
