export interface Favourites {
  rating?: number;
  favourited: boolean;
  play_count: number;
}

export interface PlayedTrack {
  id: string;
  title?: string;
  artists?: Array<string>;
  album_name?: string;
  released?: string;
  duration?: number;
  favourites: Favourites;
  image_url?: Array<string>;
}
export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  playedTracks?: Array<PlayedTrack>;
}
