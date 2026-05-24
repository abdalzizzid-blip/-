import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { mockMediaList } from '../services/mediaData';
import { MovieCard } from './MovieCard';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  Layers, 
  Film, 
  Tv, 
  Compass, 
  Flame, 
  RotateCcw, 
  Star, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Definitions for the 12 smart categories
export interface ArabicCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  matchGenres: string[];
  icon: string | any;
  subColor: string;
}

export const ARABIC_CATEGORIES: ArabicCategory[] = [
  { id: 'action', nameAr: 'أكشن', nameEn: 'Action', matchGenres: ['action', 'adventure', 'fantasy'], icon: '🔥', subColor: 'from-amber-550 to-orange-600' },
  { id: 'drama', nameAr: 'دراما', nameEn: 'Drama', matchGenres: ['drama', 'biography'], icon: '🎭', subColor: 'from-rose-500 to-purple-600' },
  { id: 'comedy', nameAr: 'كوميدي', nameEn: 'Comedy', matchGenres: ['comedy'], icon: '😂', subColor: 'from-yellow-400 to-amber-500' },
  { id: 'horror', nameAr: 'رعب', nameEn: 'Horror', matchGenres: ['horror', 'mystery'], icon: '💀', subColor: 'from-red-600 to-slate-900' },
  { id: 'documentary', nameAr: 'وثائقي', nameEn: 'Documentary', matchGenres: ['documentary', 'biography', 'history'], icon: '🌍', subColor: 'from-emerald-500 to-teal-600' },
  { id: 'anime', nameAr: 'أنمي', nameEn: 'Anime', matchGenres: ['animation', 'sci-fi'], icon: '🍙', subColor: 'from-pink-500 to-rose-500' },
  { id: 'arabic', nameAr: 'عربي', nameEn: 'Arabic', matchGenres: ['arabic'], icon: '🕌', subColor: 'from-amber-500 to-yellow-600' },
  { id: 'foreign', nameAr: 'أجنبي', nameEn: 'Foreign', matchGenres: ['sci-fi', 'adventure'], icon: '✈️', subColor: 'from-cyan-500 to-blue-600' },
  { id: 'kids', nameAr: 'أطفال', nameEn: 'Kids', matchGenres: ['animation', 'family', 'kids'], icon: '🧸', subColor: 'from-sky-400 to-teal-400' },
  { id: 'family', nameAr: 'عائلي', nameEn: 'Family', matchGenres: ['family', 'adventure'], icon: '👨‍👩‍👧‍👦', subColor: 'from-purple-500 to-indigo-605' },
  { id: 'crime', nameAr: 'جريمة', nameEn: 'Crime', matchGenres: ['crime', 'mystery'], icon: '🕵️', subColor: 'from-slate-700 to-slate-950' },
  { id: 'history', nameAr: 'تاريخي', nameEn: 'History', matchGenres: ['history', 'biography'], icon: '📜', subColor: 'from-amber-700 to-stone-800' },
];

export const ArabicCategoryExplorer: React.FC = () => {
  const { lang, t } = useLanguage();
  const isRtl = lang === 'ar';

  // Selected categories list (enables Multi-category toggling!)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [filteredResults, setFilteredResults] = useState<MediaItem[]>([]);
  const [badgeAnimationKey, setBadgeAnimationKey] = useState(0);

  // Toggle category helper
  const handleToggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
    setBadgeAnimationKey(prev => prev + 1);
  };

  // Reset helper
  const clearAllFilters = () => {
    setSelectedIds([]);
    setMediaTypeFilter('all');
  };

  // Perform dynamic filtering based on multi-category selection
  useEffect(() => {
    let list = [...mockMediaList];

    // Filter by Media Type (Movie or TV series)
    if (mediaTypeFilter !== 'all') {
      list = list.filter(item => item.type === mediaTypeFilter);
    }

    // Filter by multiple selected categories
    if (selectedIds.length > 0) {
      list = list.filter(item => {
        // Must match AT LEAST ONE of the selected categories
        return selectedIds.some(catId => {
          const categoryObj = ARABIC_CATEGORIES.find(c => c.id === catId);
          if (!categoryObj) return false;

          // Special "Arabic" matcher
          if (catId === 'arabic') {
            return item.isArabic === true || item.genres?.some(g => g.toLowerCase() === 'arabic');
          }

          // Special "Foreign" matcher
          if (catId === 'foreign') {
            return !item.isArabic && item.genres?.some(g => g.toLowerCase() !== 'arabic');
          }

          // General matching across matching genres
          return item.genres?.some(genreName => 
            categoryObj.matchGenres.includes(genreName.toLowerCase())
          );
        });
      });
    }

    setFilteredResults(list);
  }, [selectedIds, mediaTypeFilter]);

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Compass className="h-5 w-5 animate-spin duration-3000" />
            <span className="text-xs font-black uppercase tracking-widest">
              {isRtl ? 'بوابة التصنيف الذكية الموحدة' : 'INTELLIGENT MEDIA CATEGORIES'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>{isRtl ? 'استكشف بالتصنيفات العربية' : 'Arabic Category Navigator'}</span>
            <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-400 font-black uppercase tracking-widest font-mono">
              ★ VIP
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {isRtl 
              ? 'تصفح بتحديد فئة واحدة أو فئات متعددة متقاطعة بالتزامن لاكتشاف روائع الأفلام والمسلسلات الحصرية.'
              : 'Interact by toggling key chips to cross-filter exclusive releases globally in real time.'}
          </p>
        </div>

        {/* Clear Filter button & Media Type Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Media Type toggles */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-900">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                mediaTypeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setMediaTypeFilter('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                mediaTypeFilter === 'movie'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="h-3 w-3 inline mr-1" />
              {isRtl ? 'أفلام' : 'Movies'}
            </button>
            <button
              onClick={() => setMediaTypeFilter('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                mediaTypeFilter === 'tv'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="h-3 w-3 inline mr-1" />
              {isRtl ? 'مسلسلات' : 'Series'}
            </button>
          </div>

          {(selectedIds.length > 0 || mediaTypeFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-900 hover:border-amber-550/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isRtl ? 'إعادة تعيين' : 'Clear Filters'}</span>
            </button>
          )}

        </div>
      </div>

      {/* Categories Horizontal Grid Flow - The Filter Chips! */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
        {ARABIC_CATEGORIES.map((category) => {
          const isActive = selectedIds.includes(category.id);
          return (
            <motion.button
              key={category.id}
              onClick={() => handleToggleCategory(category.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden p-3.5 rounded-2xl flex items-center justify-between text-left transition-all border outline-none select-none cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-905/70 hover:border-slate-800'
              }`}
            >
              {/* Highlight bar inside button */}
              {isActive && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${category.subColor}`} />
              )}

              {/* Text context */}
              <div className="leading-tight">
                <p className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
                  {category.nameEn}
                </p>
                <p className={`text-sm font-black mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                  {category.nameAr}
                </p>
              </div>

              {/* Icon / Emoji badge */}
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'opacity-65'}`}>
                {category.icon}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Filter Info Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl bg-slate-950/70 border border-slate-900 text-xs font-bold text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {isRtl 
              ? `تم اختيار ${selectedIds.length} تصنيف • العثور على ${filteredResults.length} عمل`
              : `Selected ${selectedIds.length} categories • Found ${filteredResults.length} matches`}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-550 mr-1">{isRtl ? 'التصنيفات المطبقة:' : 'Applied filters:'}</span>
            {selectedIds.map((id) => {
              const category = ARABIC_CATEGORIES.find(c => c.id === id);
              if (!category) return null;
              return (
                <span
                  key={id}
                  onClick={() => handleToggleCategory(id)}
                  className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[#D4AF37] text-[10px] font-black cursor-pointer flex items-center gap-1 transition-all"
                  title="Remove this category"
                >
                  <span>{isRtl ? category.nameAr : category.nameEn}</span>
                  <span className="text-rose-500 font-bold">×</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtered Dynamic Catalog Grid */}
      <AnimatePresence mode="popLayout">
        {filteredResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center space-y-3 bg-slate-950/40 border border-slate-900 rounded-3xl"
          >
            <Layers className="h-10 w-10 text-slate-800 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-sm text-slate-400">
              {isRtl ? 'لا توجد أعمال تطابق هذه الفئات المختارة' : 'No titles found matching this custom filter combination'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl 
                ? 'جرب تنويع أو تقليل الفئات المحددة بالأعلى لعرض الخيارات.'
                : 'Try toggling off some categories to expand search depth.'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {filteredResults.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
