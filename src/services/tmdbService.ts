import { MediaItem, Episode } from '../types';
import { mockMediaList } from './mediaData';

// TMDB configuration
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getTMDBApiKey = (): string | null => {
  return (import.meta as any).env?.VITE_TMDB_API_KEY || localStorage.getItem('koraflix_tmdb_key') || null;
};

export const setTMDBApiKey = (key: string) => {
  if (key) {
    localStorage.setItem('koraflix_tmdb_key', key);
  } else {
    localStorage.removeItem('koraflix_tmdb_key');
  }
};

const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const apiKey = getTMDBApiKey();
  if (!apiKey) return null;

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...params,
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`TMDB Fetch Error at ${endpoint}:`, error);
    return null;
  }
};

// Maps TMDB Movie data to KoraFlix schema
const mapTMDBMovie = (tmdbMovie: any): MediaItem => {
  return {
    id: `tmdb-movie-${tmdbMovie.id}`,
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title || tmdbMovie.name,
    originalTitle: tmdbMovie.original_title || tmdbMovie.original_name,
    type: 'movie',
    overview: tmdbMovie.overview || 'No description available.',
    backdropUrl: tmdbMovie.backdrop_path 
      ? `${IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}` 
      : 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=1200&auto=format&fit=crop',
    posterUrl: tmdbMovie.poster_path 
      ? `${IMAGE_BASE_URL}/w500${tmdbMovie.poster_path}` 
      : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    rating: parseFloat((tmdbMovie.vote_average || 0).toFixed(1)),
    releaseDate: tmdbMovie.release_date || tmdbMovie.first_air_date || 'N/A',
    duration: tmdbMovie.runtime ? `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}m` : '1h 50m',
    genres: tmdbMovie.genres?.map((g: any) => g.name) || ['Action', 'Drama'],
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w', // default/fallback trailer
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    servers: [
      { id: 'tmdb-srv-1', name: 'Direct VIP Server (FHD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'tmdb-srv-2', name: 'Fast Stream (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ],
    cast: [],
    director: 'N/A',
  };
};

// Maps TMDB TV data to KoraFlix schema
const mapTMDBShow = (tmdbShow: any): MediaItem => {
  return {
    id: `tmdb-tv-${tmdbShow.id}`,
    tmdbId: tmdbShow.id,
    title: tmdbShow.name || tmdbShow.title,
    originalTitle: tmdbShow.original_name || tmdbShow.original_title,
    type: 'tv',
    overview: tmdbShow.overview || 'No description available.',
    backdropUrl: tmdbShow.backdrop_path 
      ? `${IMAGE_BASE_URL}/w1280${tmdbShow.backdrop_path}` 
      : 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=1200&auto=format&fit=crop',
    posterUrl: tmdbShow.poster_path 
      ? `${IMAGE_BASE_URL}/w500${tmdbShow.poster_path}` 
      : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    rating: parseFloat((tmdbShow.vote_average || 0).toFixed(1)),
    releaseDate: tmdbShow.first_air_date || tmdbShow.release_date || 'N/A',
    seasonsCount: tmdbShow.number_of_seasons || 1,
    genres: tmdbShow.genres?.map((g: any) => g.name) || ['Drama', 'Mystery'],
    trailerUrl: 'https://www.youtube.com/embed/Di310WS8zLk', // fallback trailer
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    servers: [
      { id: 'tmdb-srv-1', name: 'Fast TV Relay 1', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    cast: [],
    creator: tmdbShow.created_by?.[0]?.name || 'N/A',
    episodes: []
  };
};

export const tmdbService = {
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      // Return local trending
      return mockMediaList.filter(item => item.isTrending);
    }

    const t = type === 'all' ? 'all' : type;
    const data = await fetchTMDB(`/trending/${t}/week`);
    if (!data || !data.results) return [];

    return data.results.slice(0, 10).map((item: any) => {
      return item.media_type === 'tv' || type === 'tv' ? mapTMDBShow(item) : mapTMDBMovie(item);
    });
  },

  getPopular: async (type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.isPopular && item.type === type);
    }

    const data = await fetchTMDB(`/${type}/popular`);
    if (!data || !data.results) return [];

    return data.results.slice(0, 10).map((item: any) => {
      return type === 'tv' ? mapTMDBShow(item) : mapTMDBMovie(item);
    });
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.isTopRated && item.type === type);
    }

    const data = await fetchTMDB(`/${type}/top_rated`);
    if (!data || !data.results) return [];

    return data.results.slice(0, 10).map((item: any) => {
      return type === 'tv' ? mapTMDBShow(item) : mapTMDBMovie(item);
    });
  },

  getNowShowing: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.isTrending || item.isPopular).slice(0, 10);
    }
    const data = await fetchTMDB('/movie/now_playing');
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBMovie);
  },

  getMostWatched: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.isPopular).slice(0, 10);
    }
    const data = await fetchTMDB('/movie/popular');
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBMovie);
  },

  getArabicMovies: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.type === 'movie' && item.isArabic);
    }
    const data = await fetchTMDB('/discover/movie', { with_original_language: 'ar', sort_by: 'popularity.desc' });
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBMovie);
  },

  getArabicSeries: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.type === 'tv' && item.isArabic);
    }
    const data = await fetchTMDB('/discover/tv', { with_original_language: 'ar', sort_by: 'popularity.desc' });
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBShow);
  },

  getForeignMovies: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return mockMediaList.filter(item => item.type === 'movie' && !item.isArabic).slice(0, 10);
    }
    const data = await fetchTMDB('/discover/movie', { with_original_language: 'en|fr|es|ja|ko', _sort_by: 'popularity.desc' });
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBMovie);
  },

  getRecentlyAdded: async (): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      return [...mockMediaList].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 10);
    }
    const data = await fetchTMDB('/movie/now_playing', { _sort_by: 'release_date.desc' });
    if (!data || !data.results) return [];
    return data.results.slice(0, 10).map(mapTMDBMovie);
  },

  search: async (query: string): Promise<MediaItem[]> => {
    if (!query.trim()) return [];

    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      // Local searchable
      const q = query.toLowerCase();
      return mockMediaList.filter(
        item => 
          item.title.toLowerCase().includes(q) || 
          item.overview.toLowerCase().includes(q) ||
          item.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    const data = await fetchTMDB('/search/multi', { query });
    if (!data || !data.results) return [];

    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => {
        return item.media_type === 'tv' ? mapTMDBShow(item) : mapTMDBMovie(item);
      });
  },

  getDetails: async (id: string, type: 'movie' | 'tv'): Promise<MediaItem | null> => {
    // If local mock media
    if (id.startsWith('m-') || id.startsWith('s-')) {
      return mockMediaList.find(item => item.id === id) || null;
    }

    const numericId = id.replace('tmdb-movie-', '').replace('tmdb-tv-', '');
    const apiKey = getTMDBApiKey();
    if (!apiKey) return null;

    const data = await fetchTMDB(`/${type}/${numericId}`, { append_to_response: 'credits,videos' });
    if (!data) return null;

    const mapped = type === 'tv' ? mapTMDBShow(data) : mapTMDBMovie(data);
    
    // Extract cast & director
    if (data.credits) {
      mapped.cast = data.credits.cast?.slice(0, 8).map((c: any) => c.name) || [];
      if (type === 'movie') {
        mapped.director = data.credits.crew?.find((cr: any) => cr.job === 'Director')?.name || 'N/A';
      }
    }

    // Extract trailer
    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        mapped.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }

    // If series, generate mock episodes or try to fetch
    if (type === 'tv') {
      const episodes: Episode[] = [];
      // Fetch season 1 details
      const seasonData = await fetchTMDB(`/tv/${numericId}/season/1`);
      if (seasonData && seasonData.episodes) {
        seasonData.episodes.slice(0, 8).forEach((ep: any) => {
          episodes.push({
            id: `tmdb-ep-${id}-${ep.episode_number}`,
            title: ep.name || `Episode ${ep.episode_number}`,
            season: 1,
            episodeNumber: ep.episode_number,
            duration: ep.runtime ? `${ep.runtime}m` : '45m',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          });
        });
      } else {
        // Fallback mock episodes
        for (let i = 1; i <= 6; i++) {
          episodes.push({
            id: `mock-ep-${id}-${i}`,
            title: `Chapter ${i}: The Journey Begins`,
            season: 1,
            episodeNumber: i,
            duration: '45m',
            videoUrl: i % 2 === 0 
              ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
              : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          });
        }
      }
      mapped.episodes = episodes;
    }

    return mapped;
  },

  getSimilar: async (id: string, type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const apiKey = getTMDBApiKey();
    if (!apiKey) {
      const current = mockMediaList.find(item => item.id === id);
      const items = mockMediaList.filter(item => item.id !== id && item.type === type);
      if (current) {
        return items.filter(item => item.genres.some(g => current.genres.includes(g))).slice(0, 5);
      }
      return items.slice(0, 5);
    }

    const numericId = id.replace('tmdb-movie-', '').replace('tmdb-tv-', '');
    const data = await fetchTMDB(`/${type}/${numericId}/similar`);
    if (!data || !data.results) return [];

    return data.results.slice(0, 5).map((item: any) => {
      return type === 'tv' ? mapTMDBShow(item) : mapTMDBMovie(item);
    });
  }
};
