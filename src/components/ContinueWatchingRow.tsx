import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { Play, Trash2, ChevronLeft, ChevronRight, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface HistoryItemResolved {
  item: MediaItem;
  watchedAt: string;
  progress: number;
}

export const ContinueWatchingRow: React.FC = () => {
  const { user, removeFromHistory } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [resolvedItems, setResolvedItems] = useState<HistoryItemResolved[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isRtl = lang === 'ar';

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!user || !user.history || user.history.length === 0) {
        if (isMounted) {
          setResolvedItems([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        // Load details for up to 10 of the most recently watched items
        const items = await Promise.all(
          user.history.slice(0, 10).map(async (h) => {
            const type = h.mediaId.startsWith('s-') || h.mediaId.includes('tv') ? 'tv' : 'movie';
            const details = await tmdbService.getDetails(h.mediaId, type);
            if (details) {
              return {
                item: details,
                watchedAt: h.watchedAt,
                progress: h.progress
              };
            }
            return null;
          })
        );

        if (isMounted) {
          setResolvedItems(items.filter((x): x is HistoryItemResolved => x !== null));
        }
      } catch (err) {
        console.error('Error loading continues watching history:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.history]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 380;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleRemove = (e: React.MouseEvent, mediaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromHistory(mediaId);
  };

  // If there are no items and we aren't loading, hide the row entirely
  if (!loading && resolvedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 group/continue relative py-2" id="continue-watching-row">
      {/* Header section with locale alignment */}
      <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <Clock className="h-5 w-5 text-rose-500 animate-pulse shrink-0" />
          <h2 className="text-xl font-black text-white tracking-tight">
            {isRtl ? 'متابعة المشاهدة' : 'Continue Watching'}
          </h2>
          <span className="text-[10px] font-bold bg-rose-600/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {isRtl ? 'سجل المشاهدة الفريد' : 'Your History'}
          </span>
        </div>

        {resolvedItems.length > 0 && (
          <div className="flex items-center gap-1.5" dir="ltr">
            <button
              onClick={() => handleScroll(isRtl ? 'right' : 'left')}
              className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shadow-lg hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll(isRtl ? 'left' : 'right')}
              className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shadow-lg hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x scrollbar-none snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Skeleton Loading State
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`continue-skel-${index}`}
                className="w-64 sm:w-72 shrink-0 aspect-video bg-slate-900 border border-slate-850 rounded-2xl animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-10 bg-slate-950/60 p-3 space-y-2">
                  <div className="h-2.5 bg-slate-800 rounded w-2/3"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {resolvedItems.map(({ item, watchedAt, progress }) => (
                <motion.div
                  key={`continue-card-${item.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: isRtl ? 100 : -100 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-64 sm:w-72 shrink-0 snap-start group/card relative aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-600/5 transition-all"
                >
                  {/* Backdrop Cover image */}
                  <img
                    src={item.backdropUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 duration-500 transition-transform ease-out opacity-60 md:opacity-75"
                    referrerPolicy="no-referrer"
                    onClick={() => navigate(`/watch/${item.type}/${item.id}`)}
                  />

                  {/* Gradient bottom mask overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                  {/* Actions Layer */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-3.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className={`flex w-full ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* One-click delete viewing progress */}
                      <button
                        onClick={(e) => handleRemove(e, item.id)}
                        className="p-1.5 rounded-xl bg-black/60 hover:bg-rose-650 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-white transition cursor-pointer select-none"
                        title={isRtl ? 'إزالة من المتابعة' : 'Remove Progress'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-center items-center drop-shadow">
                      <button
                        onClick={() => navigate(`/watch/${item.type}/${item.id}`)}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transform scale-75 group-hover/card:scale-110 duration-200 transition-all cursor-pointer"
                      >
                        <Play className={`h-4.5 w-4.5 fill-white text-white ${isRtl ? 'ml-0 rotate-180 mr-0.5' : 'ml-0.5 ml-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Info Label Overlay */}
                  <div className={`absolute bottom-0 inset-x-0 p-3.5 z-15 ${isRtl ? 'text-right' : 'text-left'} space-y-1`} onClick={() => navigate(`/watch/${item.type}/${item.id}`)}>
                    <h3 className="text-white text-xs sm:text-sm font-black tracking-wide truncate leading-tight drop-shadow">
                      {item.title}
                    </h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold drop-shadow">
                      {isRtl ? (item.type === 'tv' ? 'مسلسل' : 'فيلم') : item.type} • {progress}% {isRtl ? 'مكتمل' : 'Completed'}
                    </p>

                    {/* Highly responsive layout-aligned progress line */}
                    <div className="h-1.5 bg-slate-900 rounded-full w-full overflow-hidden border border-slate-950/40 relative pt-px">
                      <div
                        className="absolute h-full left-0 top-0 bg-gradient-to-r from-rose-600 to-rose-400 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
