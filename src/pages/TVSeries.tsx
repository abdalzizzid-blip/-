import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { useLanguage } from '../context/LanguageContext';
import { Tv, Filter, SlidersHorizontal } from 'lucide-react';

export const TVSeries: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating'

  const genresList = ['All', 'Action', 'Adventure', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Comedy'];

  useEffect(() => {
    loadSeries();
  }, [sortBy]);

  const loadSeries = async () => {
    setLoading(true);
    try {
      let data: MediaItem[] = [];
      if (sortBy === 'popular') {
        data = await tmdbService.getPopular('tv');
      } else {
        data = await tmdbService.getTopRated('tv');
      }
      setSeries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeries = selectedGenre === 'All'
    ? series
    : series.filter(s => s.genres?.map(g => g.toLowerCase()).includes(selectedGenre.toLowerCase()));

  const isRtl = lang === 'ar';

  return (
    <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      {/* Page Heading banner */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Tv className="h-6 w-6 text-rose-500" />
          <span>{t('tvSeriesHub')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">{t('tvSeriesHubDesc')}</p>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/45 border border-slate-900 p-4 rounded-2xl">
        {/* Genre bubbles list */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-slate-500 text-xs font-black mr-2 uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3 w-3 text-rose-500" />
            <span>{t('filtersLabel')}:</span>
          </span>
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-705'
              }`}
            >
              {genre === 'All' ? (isRtl ? 'الكل' : 'All') : t(genre.toLowerCase())}
            </button>
          ))}
        </div>

        {/* Sort picker widget */}
        <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-end">
          <span className="text-slate-500 text-xs font-black flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3 text-rose-500" />
            <span>{t('sortBy')}:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:outline-none focus:border-rose-500 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 cursor-pointer"
          >
            <option value="popular">{t('popularRank')}</option>
            <option value="rating">{t('topRatedCritique')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-xs font-bold text-rose-500/70 uppercase tracking-widest animate-pulse">{t('loadingChannels')}</span>
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-slate-900/20 border border-slate-900 rounded-3xl">
          <Tv className="h-10 w-10 text-slate-750 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-400">{t('noShowsFound')}</h3>
          <p className="text-xs text-slate-500">{t('noShowsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredSeries.map((show) => (
            <MovieCard key={show.id} item={show} />
          ))}
        </div>
      )}
    </div>
  );
};
