import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Star, Play, Heart, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface MovieCardProps {
  item: MediaItem;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useAuth();
  const { lang, t } = useLanguage();
  const exists = isInWatchlist(item.id);
  const isRtl = lang === 'ar';

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-rose-500/20 hover:shadow-xl hover:shadow-rose-600/5 transition-all"
    >
      <div
        onClick={() => navigate(`/details/${item.type}/${item.id}`)}
        className="block relative aspect-[2/3] overflow-hidden bg-slate-950 cursor-pointer"
      >
        
        {/* Rating and Format Badges */}
        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between select-none">
          <span className="flex items-center gap-1 bg-black/75 backdrop-blur-md text-amber-400 font-extrabold text-[10px] px-2 py-1 rounded-lg border border-slate-800">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
            <span>{item.rating || 'N/A'}</span>
          </span>
          <span className="bg-rose-600 font-black tracking-widest text-[9px] uppercase px-2 py-1 rounded-lg text-white">
            {item.type === 'tv' ? (isRtl ? 'مسلسل' : 'TV') : (isRtl ? 'فيلم' : 'MOVIE')}
          </span>
        </div>

        {/* Thumbnail Image */}
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Cinematic Backdrop Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 z-20">
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/watch/${item.type}/${item.id}`);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30 transform scale-75 group-hover:scale-100 transition-all cursor-pointer"
              title="Watch Trailer & Stream"
            >
              <Play className="h-4 w-4 fill-white text-white ml-0.5" />
            </button>
            <button
              onClick={handleToggle}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-white transition-all transform scale-75 group-hover:scale-100 cursor-pointer ${
                exists
                  ? 'bg-rose-600/20 border-rose-500 text-rose-400 hover:bg-rose-600/35'
                  : 'bg-black/60 border-slate-700 hover:border-white hover:bg-black/90'
              }`}
              title={exists ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {exists ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
          
          <h4 className="text-white text-xs font-black tracking-wide text-center uppercase truncate">
            {item.title}
          </h4>
        </div>
      </div>

      {/* Info Panel under card */}
      <div className={`p-3 space-y-1.5 grow flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
        <Link to={`/details/${item.type}/${item.id}`} className="hover:text-rose-500 transition-colors block">
          <h3 className="text-sm font-extrabold text-white truncate leading-tight">
            {item.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between font-bold text-[11px] text-slate-500">
          <span>{item.releaseDate?.split('-')[0] || 'N/A'}</span>
          <span>{item.genres?.slice(0, 2).map((g) => t(g.toLowerCase())).join(' / ')}</span>
        </div>
      </div>
    </motion.div>
  );
};
