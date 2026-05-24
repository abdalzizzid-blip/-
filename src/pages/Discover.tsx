import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { tmdbService } from '../services/tmdbService';
import { mockMediaList } from '../services/mediaData';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Star,
  Globe,
  Calendar,
  Compass,
  SlidersHorizontal,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  Heart,
  Search,
  Check,
  ChevronRight,
  Tv,
  Film
} from 'lucide-react';

export const Discover: React.FC = () => {
  const { lang, dir, t } = useLanguage();
  const isRtl = lang === 'ar';

  // Core media list fetched
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  // Filter States
  const [activeTab, setActiveTab ] = useState<'trending' | 'topRated' | 'genre' | 'country' | 'year' | 'personalized'>('trending');
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  // Personalized interactive sliders
  const [perfAction, setPerfAction] = useState<number>(50); // Action preference weight
  const [perfDrama, setPerfDrama] = useState<number>(50);  // Drama preference weight
  const [perfArabic, setPerfArabic] = useState<number>(55); // Arabic preference weight
  const [personalizedResults, setPersonalizedResults] = useState<MediaItem[]>([]);

  // Infinite Scroll States
  const [displayCount, setDisplayCount] = useState<number>(5);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Genre labels mapped
  const genreOptions = [
    { value: 'All', labelAr: 'كل الأنواع', labelEn: 'All Genres' },
    { value: 'Action', labelAr: 'أكشن', labelEn: 'Action' },
    { value: 'Drama', labelAr: 'دراما', labelEn: 'Drama' },
    { value: 'Sci-Fi', labelAr: 'خيال علمي', labelEn: 'Sci-Fi' },
    { value: 'Horror', labelAr: 'رعب', labelEn: 'Horror' },
    { value: 'Comedy', labelAr: 'كوميدي', labelEn: 'Comedy' },
    { value: 'History', labelAr: 'تاريخي', labelEn: 'History' },
    { value: 'Animation', labelAr: 'أنمي ورسوم', labelEn: 'Animation' },
  ];

  // Country logic
  // We classify:
  // - Arabic: isArabic = true
  // - Hollywood: contains certain genres/languages or fallback non-arabic
  // - East Asia: has Animation, Anime
  const countryOptions = [
    { value: 'All', labelAr: 'كل الدول', labelEn: 'All Regions' },
    { value: 'Arabic', labelAr: 'شمال أفريقيا والشرق الأوسط 🇪🇬🇸🇦', labelEn: 'Arab World' },
    { value: 'Hollywood', labelAr: 'الولايات المتحدة الأمريكية 🇺🇸', labelEn: 'Hollywood / US' },
    { value: 'Europe', labelAr: 'أوروبا وبريطانيا 🇬🇧🇫🇷', labelEn: 'European Cinema' },
    { value: 'EastAsia', labelAr: 'شرق آسيا والأنمي 🇯🇵🇰🇷', labelEn: 'East Asia' },
  ];

  // Year choices
  const yearOptions = [
    { value: 'All', labelAr: 'كل السنين', labelEn: 'All Years' },
    { value: '2024', labelAr: '2024 (جديد وحصري)', labelEn: '2024 Broadcasts' },
    { value: '2023', labelAr: '2023', labelEn: '2023 Releases' },
    { value: '2022', labelAr: '2022', labelEn: '2022 Archives' },
    { value: 'Classic', labelAr: 'الأرشيف والكلاسيكيات', labelEn: 'Heritage Classics' },
  ];

  // Fetch items based on settings
  useEffect(() => {
    loadDiscoverData();
  }, [activeTab]);

  const loadDiscoverData = async () => {
    setLoading(true);
    setErrorHeader(null);
    try {
      let results: MediaItem[] = [];
      
      if (activeTab === 'trending') {
        const movies = await tmdbService.getTrending('movie');
        const shows = await tmdbService.getTrending('tv');
        results = [...movies, ...shows];
      } else if (activeTab === 'topRated') {
        const movies = await tmdbService.getTopRated('movie');
        const shows = await tmdbService.getTopRated('tv');
        results = [...movies, ...shows];
      } else {
        // Fallback or full unified collection
        results = [...mockMediaList];
        // Try requesting more from TMDB if active token is set
        try {
          const popularityMovies = await tmdbService.getPopular('movie');
          const popularityTv = await tmdbService.getPopular('tv');
          
          // Deduplicate items
          const seenIds = new Set(results.map(r => r.id));
          [...popularityMovies, ...popularityTv].forEach(item => {
            if (!seenIds.has(item.id)) {
              results.push(item);
            }
          });
        } catch (tmdbErr) {
          console.warn("Extended TMDB background fetch skipped:", tmdbErr);
        }
      }

      setMediaList(results);
      setDisplayCount(5); // Reset display limit for infinite scroll simulation
      setHasMore(results.length > 5);
    } catch (err: any) {
      console.error(err);
      setErrorHeader("Failed to load catalog files. Reverting to backup index.");
      setMediaList(mockMediaList);
    } finally {
      setLoading(false);
    }
  };

  // Infinitely load more items helper on bottom scroll or button click
  const loadMoreElements = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    // Simulate luxury animation buffering progress delay for premium immersion feel
    setTimeout(() => {
      const nextLimit = displayCount + 5;
      setDisplayCount(nextLimit);
      setLoadingMore(false);
      if (nextLimit >= filteredMedia.length) {
        setHasMore(false);
      }
    }, 1200);
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreElements();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [sentinelRef, displayCount, hasMore, loadingMore, loading, mediaList]);

  // Compute Country of an item
  const getItemCountry = (item: MediaItem): string => {
    if (item.isArabic) return 'Arabic';
    
    // Scan genres or titles for hints
    const genresLower = item.genres?.map(g => g.toLowerCase()) || [];
    if (genresLower.includes('animation') || genresLower.includes('anime')) return 'EastAsia';
    
    // Year-based or director-based guess
    if (item.director === 'مروان حامد' || item.creator?.includes('محمد سامي')) return 'Arabic';
    if (item.releaseDate && parseInt(item.releaseDate.substring(0, 4)) < 2018) return 'Europe';
    
    return 'Hollywood';
  };

  // Compute Year of an item
  const getItemYearCategory = (item: MediaItem): string => {
    if (!item.releaseDate || item.releaseDate === 'N/A') return 'Classic';
    const yearStr = item.releaseDate.substring(0, 4);
    if (yearStr === '2024') return '2024';
    if (yearStr === '2023') return '2023';
    if (yearStr === '2022') return '2022';
    return 'Classic';
  };

  // Main filtered media array
  const filteredMedia = mediaList.filter(item => {
    // 1. Filter by global media type
    if (selectedType !== 'all' && item.type !== selectedType) return false;

    // 2. Filter by genre
    if (selectedGenre !== 'All') {
      const gLower = item.genres?.map(g => g.toLowerCase()) || [];
      if (!gLower.includes(selectedGenre.toLowerCase())) return false;
    }

    // 3. Filter by country
    if (selectedCountry !== 'All') {
      if (getItemCountry(item) !== selectedCountry) return false;
    }

    // 4. Filter by year
    if (selectedYear !== 'All') {
      if (getItemYearCategory(item) !== selectedYear) return false;
    }

    return true;
  });

  // Handle calculating custom "Personalized Suggestions"
  const calculatePersonalizedScore = () => {
    // Blend weights to sort media items customly
    const corpus = [...mockMediaList];
    try {
      const sorted = corpus.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Apply Action factor
        if (a.genres?.some(g => ['action', 'adventure', 'sci-fi'].includes(g.toLowerCase()))) {
          scoreA += perfAction * 0.4;
        }
        if (b.genres?.some(g => ['action', 'adventure', 'sci-fi'].includes(g.toLowerCase()))) {
          scoreB += perfAction * 0.4;
        }

        // Apply Drama factor
        if (a.genres?.some(g => ['drama', 'biography', 'history'].includes(g.toLowerCase()))) {
          scoreA += perfDrama * 0.4;
        }
        if (b.genres?.some(g => ['drama', 'biography', 'history'].includes(g.toLowerCase()))) {
          scoreB += perfDrama * 0.4;
        }

        // Apply Arabic factor
        if (a.isArabic) {
          scoreA += perfArabic * 0.5;
        }
        if (b.isArabic) {
          scoreB += perfArabic * 0.5;
        }

        // Add base rating multiplier to respect quality
        scoreA += a.rating * 5;
        scoreB += b.rating * 5;

        return scoreB - scoreA;
      });

      setPersonalizedResults(sorted);
    } catch (err) {
      setPersonalizedResults(mockMediaList);
    }
  };

  // Run initial customized recommendation calculation
  useEffect(() => {
    calculatePersonalizedScore();
  }, [perfAction, perfDrama, perfArabic]);

  // Determine what result set to map
  const activeResults = activeTab === 'personalized' ? personalizedResults : filteredMedia;
  const paginatedResults = activeResults.slice(0, displayCount);

  // Quick reset
  const resetAllFilters = () => {
    setSelectedType('all');
    setSelectedGenre('All');
    setSelectedCountry('All');
    setSelectedYear('All');
    setDisplayCount(5);
    setHasMore(true);
  };

  return (
    <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* 1. Header Hero Display */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-505/20 text-[#D4AF37] text-[11px] font-black uppercase tracking-widest leading-none">
            <Sparkles className="h-3 w-3 animate-spin text-amber-400" />
            <span>{isRtl ? 'بوابة الاكتشاف الموجهة' : 'PREMIUM DISCOVER MATRIX'}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            {isRtl ? 'تنقيب ذكي واكتشاف سينمائي' : 'Discover Elegant Streams'}
          </h1>

          <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isRtl
              ? 'تجاوز حدود البحث التقليدي. عبر بوابتنا الحصرية، يمكنك فرز العروض حسب الدولة، السنة، النوع، أو خلط تفضيلاتك باستخدام محاكي الاقتراحات المدعوم بالذكاء الاصطناعي.'
              : 'Break the standard stream paradigm. Seamlessly cross-filter by region, years, categories, or optimize your catalog with custom dynamic sliders.'}
          </p>
        </div>
      </div>

      {/* 2. Primary Showcase Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
        {[
          { id: 'trending', labelAr: '🔥 ترند اليوم', labelEn: 'Trending Today' },
          { id: 'topRated', labelAr: '⭐ الأعلى تقييماً', labelEn: 'Top Rated' },
          { id: 'genre', labelAr: '🎭 حسب النوع', labelEn: 'By Genre' },
          { id: 'country', labelAr: '🌍 حسب الدولة', labelEn: 'By Region' },
          { id: 'year', labelAr: '📅 حسب السنة', labelEn: 'By Year' },
          { id: 'personalized', labelAr: '🔮 اقتراحات مخصصة', labelEn: 'Personalized Matrix' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              resetAllFilters();
            }}
            className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? 'bg-amber-550 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-900'
            }`}
          >
            <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeDiscoverIndicator"
                className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* 3. Advanced Contextual Filters Widget */}
      <AnimatePresence mode="wait">
        {activeTab !== 'personalized' ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                <span>{isRtl ? 'تصفية الكتالوج المتقدمة' : 'ADVANCED FILTERS'}</span>
              </span>
              {(selectedType !== 'all' || selectedGenre !== 'All' || selectedCountry !== 'All' || selectedYear !== 'All') && (
                <button
                  onClick={resetAllFilters}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-white transition-colors"
                >
                  {isRtl ? 'إعادة تعيين المرشحات' : 'Clear Parameters'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Type Filter dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">
                  {isRtl ? 'نوع المادة' : 'Media Format'}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-250 cursor-pointer font-bold"
                >
                  <option value="all">{isRtl ? 'كل التنسيقات' : 'All Media Forms'}</option>
                  <option value="movie">🎬 {isRtl ? 'أفلام سينمائية' : 'Feature Movies'}</option>
                  <option value="tv">📺 {isRtl ? 'مسلسلات تلفزيونية' : 'TV Series'}</option>
                </select>
              </div>

              {/* Genre Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">
                  {isRtl ? 'حسب تصنيف النوع' : 'Select Genre'}
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-250 cursor-pointer font-bold"
                >
                  {genreOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country / Region Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">
                  {isRtl ? 'بلد المنشأ والإنتاج' : 'Regional Origin'}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-250 cursor-pointer font-bold"
                >
                  {countryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400 block tracking-wide">
                  {isRtl ? 'حقبة البث والإصدار' : 'Epoch / Broadcast Year'}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-250 cursor-pointer font-bold"
                >
                  {yearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Personalized Mixer Box */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border border-purple-900/40 p-6 space-y-6"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Compass className="h-4.5 w-4.5 animate-spin duration-3000" />
                <span>{isRtl ? 'محاكي تفضيلات البث الفريد' : 'STREAM PREFERENCE MIXER'}</span>
              </span>
              <h3 className="text-base font-black text-white">{isRtl ? 'أثقل وعاير التفضيلات الدرامية' : 'Fine-Tune Your Watching Vibe'}</h3>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'حرك مؤشرات الوزن بالأسفل. يقوم النظام الآني بحساب الدرجات وتحديث كتالوج العروض الحائزة على التقييم الأقرب لذوقك الفريد.'
                  : 'Drag sliders dynamically. The live sorting engine ranks films based on weights of core attributes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Sliders Actions */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>💥 {isRtl ? 'نسبة الأكشن والمغامرة' : 'Action & Thrill Limit'}</span>
                  <span className="font-mono text-amber-550">{perfAction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={perfAction}
                  onChange={(e) => setPerfAction(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>🎭 {isRtl ? 'الدراما والعمق الفكري' : 'Drama & Cinematic Narrative'}</span>
                  <span className="font-mono text-amber-550">{perfDrama}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={perfDrama}
                  onChange={(e) => setPerfDrama(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>🕌 {isRtl ? 'الهوية والروح العربية' : 'Arabic Spirit / Localization'}</span>
                  <span className="font-mono text-amber-550">{perfArabic}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={perfArabic}
                  onChange={(e) => setPerfArabic(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated recalculation indicator */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-end font-mono select-none">
              <RefreshCw className="h-3 w-3 text-purple-400 animate-spin" />
              <span>DYNAMIC SORT MATRIX SECURED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Filter status indicator */}
      {activeTab !== 'personalized' && (
        <div className="px-5 py-3 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center text-xs text-slate-450 font-bold">
          <span>
            {isRtl
              ? `تم تطبيق ${selectedGenre !== 'All' ? '1' : '0'} نوع • ${selectedCountry !== 'All' ? '1' : '0'} إقليم • العثور على ${filteredMedia.length} مادة`
              : `Active parameters: ${selectedGenre !== 'All' ? selectedGenre : 'No Genre'} • Found ${filteredMedia.length} matched titles`}
          </span>
          {filteredMedia.length > 0 && (
            <span className="text-[10px] font-mono text-emerald-400">STATUS: MATCHES READY</span>
          )}
        </div>
      )}

      {/* 5. Central Media Grid Display */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          {/* Champagne gold luxury circle loader */}
          <div className="w-16 h-16 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t border-b border-t-amber-500 border-b-transparent animate-spin duration-1000" />
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            {isRtl ? 'جاري تجميع مصفوفة البث...' : 'Formulating Stream Coordinates...'}
          </span>
        </div>
      ) : paginatedResults.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-950/40 border border-slate-900 rounded-3xl">
          <HelpCircle className="h-10 w-10 text-slate-700 mx-auto animate-bounce" />
          <h3 className="font-extrabold text-[#D4AF37]">
            {isRtl ? 'عذراً، لا توجد تصنيفات تطابق هذا المزيج' : 'Empty discover parameters match'}
          </h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto">
            {isRtl 
              ? 'تعديل المعايير كفيل بإعادة ملء هذه اللوحة برصيد غني من العروض المتميزة لـ كورا فليكس.'
              : 'Modify your filters customly to populate the page with exclusive media streaming listings.'}
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-all pointer cursor-pointer"
          >
            {isRtl ? 'إعادة الفلاتر الافتراضية' : 'Reset Option Mix'}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Main responsive grid layout */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {paginatedResults.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard item={item} />
              </motion.div>
            ))}
          </motion.div>

          {/* 6. Sentinel loader for simulated Infinite Scroll */}
          <div
            ref={sentinelRef}
            className="py-10 flex flex-col items-center justify-center gap-4 text-center border-t border-slate-900/60"
          >
            {loadingMore ? (
              <div className="space-y-3">
                {/* Brand golden ripple loader from guidelines */}
                <div className="relative flex items-center justify-center h-12">
                  <div className="absolute h-10 w-10 rounded-full border border-amber-500/40 animate-ping shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
                  <div className="absolute h-6 w-6 rounded-full border border-amber-500/65 animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-amber-500 shadow-md" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] leading-none animate-pulse">
                  {isRtl ? 'تحميل المزيد من البث الـ VIP...' : 'STREAMING MORE CONTENT...'}
                </span>
              </div>
            ) : hasMore ? (
              <button
                onClick={loadMoreElements}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                {isRtl ? 'عرض المزيد من العروض ⏷' : 'Explore More Matches ⏷'}
              </button>
            ) : (
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600">
                ⭐ {isRtl ? 'نهاية دليل الاكتشاف والمقترحات' : 'END OF VIP ARCHIVE BROADCASTS'}
              </span>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
