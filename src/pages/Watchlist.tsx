import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { useLanguage } from '../context/LanguageContext';
import { Heart, PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Watchlist: React.FC = () => {
  const { user } = useAuth();
  const { lang, t, dir } = useLanguage();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resolveWatchlistItems();
  }, [user?.watchlist]);

  const resolveWatchlistItems = async () => {
    if (!user || !user.watchlist || user.watchlist.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resolved = await Promise.all(
        user.watchlist.map(async (id) => {
          const type = id.startsWith('s-') || id.includes('tv') ? 'tv' : 'movie';
          return await tmdbService.getDetails(id, type);
        })
      );
      setItems(resolved.filter((i): i is MediaItem => i !== null));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          <span>{t('myWatchlist') || 'Watchlist'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">{t('watchlistDesc')}</p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-xs font-bold text-rose-500/70 uppercase tracking-widest animate-pulse">{t('loadingChannels')}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/20 border border-slate-900 rounded-3xl max-w-2xl mx-auto">
          <Heart className="h-12 w-12 text-slate-750 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-400">{t('noWatchlistItems')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t('watchlistEmptyDesc')}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-6 py-3 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-rose-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isRtl ? 'اكتشف العروض' : 'Discover Shows'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
