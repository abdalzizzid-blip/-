export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  watchlist: string[]; // array of media IDs
  history: { mediaId: string; watchedAt: string; progress: number }[];
}

export interface MovieComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  text: string;
  timestamp: string;
}

export interface VideoServer {
  id: string;
  name: string;
  url: string;
}

export interface Episode {
  id: string;
  title: string;
  season: number;
  episodeNumber: number;
  duration: string;
  videoUrl: string;
}

export interface MediaItem {
  id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  type: 'movie' | 'tv';
  overview: string;
  backdropUrl: string;
  posterUrl: string;
  rating: number;
  releaseDate: string;
  duration?: string; // e.g. "2h 15m" (for movies)
  seasonsCount?: number; // (for TV series)
  genres: string[];
  trailerUrl: string;
  videoUrl?: string; // main/default stream URL
  servers?: VideoServer[];
  downloadServers?: VideoServer[];
  cast: string[];
  director?: string;
  creator?: string; // for tv series
  isTrending?: boolean;
  isPopular?: boolean;
  isTopRated?: boolean;
  isExclusive?: boolean;
  isArabic?: boolean;
  comments?: MovieComment[];
  episodes?: Episode[];
}

export interface MediaRequest {
  id: string;
  userId: string;
  userName: string;
  title: string;
  type: 'movie' | 'tv';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  likes: number;
}
