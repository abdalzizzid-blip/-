import React, { useState, useEffect, useRef } from 'react';
import { tmdbService, getTMDBApiKey, setTMDBApiKey } from '../services/tmdbService';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { ArabicCategoryExplorer } from '../components/ArabicCategoryExplorer';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Play, Flame, Star, Zap, Info, ShieldAlert, Award, ChevronLeft, ChevronRight, Tv, Film, Globe, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const { lang, t } = useLanguage();
  
  // Section States
  const [nowShowing, setNowShowing] = useState<MediaItem[]>([]);
  const [mostWatched, setMostWatched] = useState<MediaItem[]>([]);
  const [arabicMovies, setArabicMovies] = useState<MediaItem[]>([]);
  const [arabicSeries, setArabicSeries] = useState<MediaItem[]>([]);
  const [foreignMovies, setForeignMovies] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<MediaItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // TMDB key input state
  const [tmdbKey, setTmdbKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Scroll Refs for horizontal rows
  const nowShowingRef = useRef<HTMLDivElement>(null);
  const mostWatchedRef = useRef<HTMLDivElement>(null);
  const arabicMoviesRef = useRef<HTMLDivElement>(null);
  const arabicSeriesRef = useRef<HTMLDivElement>(null);
  const foreignMoviesRef = useRef<HTMLDivElement>(null);
  const topRatedRef = useRef<HTMLDivElement>(null);
  const recentlyAddedRef = useRef<HTMLDivElement>(null);

  const testKey = getTMDBApiKey();

  useEffect(() => {
    if (testKey) {
      setTmdbKey(testKey);
      setIsKeySaved(true);
    }
    loadLandingData();
  }, []);

  const loadLandingData = async () => {
    setLoading(true);
    try {
      const [
        nowData,
        mostData,
        arMData,
        arSData,
        frMData,
        topData,
        recentData
      ] = await Promise.all([
        tmdbService.getNowShowing(),
        tmdbService.getMostWatched(),
        tmdbService.getArabicMovies(),
        tmdbService.getArabicSeries(),
        tmdbService.getForeignMovies(),
        tmdbService.getTopRated('movie'),
        tmdbService.getRecentlyAdded()
      ]);

      setNowShowing(nowData || []);
      setMostWatched(mostData || []);
      setArabicMovies(arMData || []);
      setArabicSeries(arSData || []);
      setForeignMovies(frMData || []);
      setTopRated(topData || []);
      setRecentlyAdded(recentData || []);
    } catch (e) {
      console.error('Error loading landing page sections:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setTMDBApiKey(tmdbKey.trim());
    setIsKeySaved(!!tmdbKey.trim());
    loadLandingData();
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 450;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const featured = mostWatched[0] || nowShowing[0] || arabicMovies[0] || arabicSeries[0];
  const isRtl = lang === 'ar';

  const rows = [
    {
      id: 'now-showing',
      title: t('nowShowing'),
      icon: Play,
      items: nowShowing,
      scrollRef: nowShowingRef,
      viewAllLink: '/movies',
      viewAllText: t('viewAllMovies')
    },
    {
      id: 'most-watched',
      title: t('mostWatched'),
      icon: Flame,
      items: mostWatched,
      scrollRef: mostWatchedRef,
      viewAllLink: '/search?sort=popular',
      viewAllText: t('browseAllSearch')
    },
    {
      id: 'arabic-movies',
      title: t('arabicMovies'),
      icon: Film,
      items: arabicMovies,
      scrollRef: arabicMoviesRef,
      viewAllLink: '/movies?genre=Arabic',
      viewAllText: t('viewAllMovies')
    },
    {
      id: 'arabic-series',
      title: t('arabicSeries'),
      icon: Tv,
      items: arabicSeries,
      scrollRef: arabicSeriesRef,
      viewAllLink: '/tv-series?genre=Arabic',
      viewAllText: t('viewAllTv')
    },
    {
      id: 'foreign-movies',
      title: t('foreignMovies'),
      icon: Globe,
      items: foreignMovies,
      scrollRef: foreignMoviesRef,
      viewAllLink: '/movies',
      viewAllText: t('viewAllMovies')
    },
    {
      id: 'top-rated',
      title: t('topRated'),
      icon: Star,
      items: topRated,
      scrollRef: topRatedRef
    },
    {
      id: 'recently-added',
      title: t('recentlyAdded'),
      icon: Sparkles,
      items: recentlyAdded,
      scrollRef: recentlyAddedRef
    }
  ];

  return (
    <div className="space-y-12">
      {/* Cinematic Billboard (Spotlight Hero) - High Premium Styling */}
      {featured && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-900/50 bg-slate-950 min-h-[460px] md:min-h-[540px] lg:min-h-[600px] flex items-end shadow-2xl shadow-black">
          {/* Enhanced Backdrops Blur and Gradients mask for immersive feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent z-10" />
          <div className={`absolute inset-0 bg-gradient-to-${isRtl ? 'l' : 'r'} from-[#0B0B0B]/85 via-transparent to-transparent z-10`} />
          
          <img
            src={featured.backdropUrl}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-75 z-0 scale-[1.01] hover:scale-105 duration-10000 transition-all-slow"
            referrerPolicy="no-referrer"
          />

          {/* Premium Ambient Backglow behind movie text */}
          <div className={`absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-full md:w-[70%] h-full bg-gradient-to-t from-rose-600/5 via-transparent to-transparent opacity-60 z-5 pointer-events-none blur-3xl`} />

          <div className={`relative z-20 p-6 md:p-14 lg:p-18 max-w-3xl space-y-4 ${isRtl ? 'text-right' : 'text-left'} w-full`}>
            {/* Glowing Spotlight Tag */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/15 border border-rose-500/20 px-3.5 py-1 text-[10px] sm:text-xs font-black text-rose-400 select-none uppercase tracking-wider shadow-inner">
              <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse shrink-0" />
              <span>{t('spotlight')}</span>
            </span>

            {/* Movie Title with spacious tracking */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {featured.title}
            </h1>

            {/* Sub-Headline description */}
            {featured.originalTitle && featured.originalTitle !== featured.title && (
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-400 font-mono tracking-tight text-opacity-80">
                {featured.originalTitle}
              </h2>
            )}

            {/* Metadata Tags */}
            <div className={`flex flex-wrap items-center gap-3.5 text-xs font-black text-slate-300 ${isRtl ? 'justify-start' : 'justify-start'}`}>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                <span>{featured.rating} / 10</span>
              </span>
              <span className="text-slate-800">•</span>
              <span>{featured.releaseDate?.split('-')[0] || 'N/A'}</span>
              <span className="text-slate-800">•</span>
              <span className="bg-[#1b1329] border border-rose-500/10 px-2.5 py-0.5 rounded text-[9px] uppercase font-black tracking-widest text-rose-500">
                {featured.type === 'tv' ? t('tvType') : featured.duration || '2 Hours'}
              </span>
            </div>

            {/* Plot Overview */}
            <p className="text-xs sm:text-sm text-slate-350 leading-relaxed max-w-xl line-clamp-3 md:line-clamp-4 drop-shadow">
              {featured.overview}
            </p>

            {/* Immersive CTA row */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to={`/watch/${featured.type}/${featured.id}`}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-7 py-3.5 text-xs font-black text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-rose-600/35 shrink-0 select-none border border-rose-500/10"
              >
                <Play className={`h-4 w-4 fill-white ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('streamNow')}</span>
              </Link>
              <Link
                to={`/details/${featured.type}/${featured.id}`}
                className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800/80 px-7 py-3.5 text-xs font-black text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-350 shrink-0 select-none shadow-md"
              >
                <Info className="h-4 w-4" />
                <span>{t('moreDetails')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TMDB Key Config Section - Gorgeous design with glassmorphism */}
      <div className="bg-slate-900/50 border border-slate-900/80 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 glass-panel cinema-glow">
        <div className={`flex items-start gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="p-3 bg-rose-600/10 rounded-2xl border border-rose-500/10 text-rose-500 shrink-0 mt-0.5">
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-white">{t('tmdbTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {t('tmdbDesc')}
            </p>
          </div>
        </div>
        <form onSubmit={handleSaveKey} className="flex gap-2 w-full lg:w-auto shrink-0 animate-fade-in">
          <input
            type="password"
            placeholder={isKeySaved ? "••••••••••••••••••••" : t('enterKeyPlaceholder')}
            value={tmdbKey}
            onChange={(e) => setTmdbKey(e.target.value)}
            className="bg-[#0B0B0B] border border-slate-800 focus:outline-none focus:border-rose-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 w-full lg:w-60 tracking-wider font-mono shadow-inner text-center"
          />
          <button
            type="submit"
            className="bg-[#1b1329] hover:bg-rose-600 text-amber-400 hover:text-white border border-slate-800 hover:border-rose-500/35 text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0 select-none cursor-pointer"
          >
            {isKeySaved ? t('updateKey') : t('activate')}
          </button>
        </form>
      </div>

      {/* Smart Arabic Category Explorer with Custom Multi-Category filter Chips */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-900/60 shadow-xl space-y-6">
        <ArabicCategoryExplorer />
      </div>

      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-xs font-black text-rose-500/70 uppercase tracking-widest animate-pulse">{t('loadingChannels')}</span>
        </div>
      ) : (
        <div className="space-y-12">
          {rows.map((row) => {
            if (!row.items || row.items.length === 0) return null;
            const IconComponent = row.icon;
            return (
              <section key={row.id} className="space-y-4 group/row relative" id={`row-${row.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-rose-500 shrink-0" />
                    <h2 className="text-xl font-black text-white tracking-tight">{row.title}</h2>
                  </div>
                  {row.viewAllLink && (
                    <Link to={row.viewAllLink} className="text-xs font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider">
                      {row.viewAllText || t('browseAllSearch')}
                    </Link>
                  )}
                </div>
                
                {/* Horizontal Scroll Area with Sliding controls */}
                <div className="relative">
                  <button
                    onClick={() => handleScroll(row.scrollRef, isRtl ? 'right' : 'left')}
                    className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-slate-950/85 border border-slate-900 text-slate-355 hover:text-white flex items-center justify-center shrink-0 z-30 opacity-0 group-hover/row:opacity-100 transition-all shadow-2xl hover:bg-slate-900 cursor-pointer"
                    id={`btn-prev-${row.id}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div
                    ref={row.scrollRef}
                    className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x scrollbar-none snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    id={`slider-${row.id}`}
                  >
                    {row.items.map((item) => (
                      <div key={item.id} className="w-40 sm:w-48 shrink-0 snap-start">
                        <MovieCard item={item} />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleScroll(row.scrollRef, isRtl ? 'left' : 'right')}
                    className="absolute right-[-16px] top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-slate-950/85 border border-slate-900 text-slate-355 hover:text-white flex items-center justify-center shrink-0 z-30 opacity-0 group-hover/row:opacity-100 transition-all shadow-2xl hover:bg-slate-900 cursor-pointer"
                    id={`btn-next-${row.id}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
