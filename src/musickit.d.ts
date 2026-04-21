/**
 * Minimal ambient type declarations for MusicKit JS v3.
 * Covers only the subset of the API used by Audify.
 */

declare namespace MusicKit {
  interface Configuration {
    developerToken: string;
    app: { name: string; build: string };
  }

  interface ArtworkDescriptor {
    url: string;
    width: number | null;
    height: number | null;
  }

  interface LibraryPlaylistAttributes {
    name: string;
    canEdit: boolean;
    artwork?: ArtworkDescriptor;
  }

  interface LibrarySongAttributes {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    artwork?: ArtworkDescriptor;
    previews?: Array<{ url: string }>;
  }

  interface Resource<Attributes> {
    id: string;
    type: string;
    attributes: Attributes;
  }

  /** Paginated API response envelope. */
  interface PagedResponse<T> {
    data: T;
    /** Relative path to the next page, absent when on the last page. */
    next?: string;
  }

  interface MusicKitApi {
    music<T = unknown>(
      path: string,
      options?: { fetchOptions?: RequestInit }
    ): Promise<{ data: T }>;
  }

  interface MusicKitInstance {
    isAuthorized: boolean;
    authorize(): Promise<string>;
    unauthorize(): Promise<void>;
    api: MusicKitApi;
  }
}

interface Window {
  MusicKit: {
    configure(config: MusicKit.Configuration): Promise<MusicKit.MusicKitInstance>;
    getInstance(): MusicKit.MusicKitInstance;
  };
}
