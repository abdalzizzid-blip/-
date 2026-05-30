import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { useLanguage } from '../context/LanguageContext';
import { Search as SearchIcon, Film, Tv, Radio, Sparkles, Flame, Star, Compass, X, Check, Eye, HelpCircle, Mic, MicOff } from 'lucide-react';

export const Search: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Advanced Filter conditions
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [arabicOnlyFilter, setArabicOnlyFilter] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'rating' | 'year' | 'default'>('default');

  // Suggested placeholders for empty states
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Web Speech API Voice Search State & Configuration
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (isSpeechSupported) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  // 1. Debounce Input Typing for Instant Live Search (300ms)
  useEffect(() => {
    const handleDebouncedSearch = setTimeout(() => {
      if (query.trim()) {
        setSearchParams({ q: query.trim() });
        performSearch(query.trim());
      } else {
        setSearchParams({});
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handleDebouncedSearch);
  }, [query]);

  // Sync with general parameter queries (when initialized via query params)
  useEffect(() => {
    if (queryParam !== query) {
      setQuery(queryParam);
    }
    if (queryParam.trim()) {
      performSearch(queryParam);
    } else {
      loadRecommendations();
    }
  }, [queryParam]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await tmdbService.search(searchQuery);
      setResults(data || []);
    } catch (e) {
      console.error('Error during search query operations:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingSuggestions(true);
    try {
      const [arMovies, arSeries, recent] = await Promise.all([
        tmdbService.getArabicMovies(),
        tmdbService.getArabicSeries(),
        tmdbService.getRecentlyAdded()
      ]);
      const combined = [...(arMovies || []), ...(arSeries || []), ...(recent || [])];
      // Keep only unique elements
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setSuggestions(unique.slice(0, 10));
    } catch (e) {
      console.error('Error fetching search recommendations:', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    setResults([]);
  };

  const handleSuggestionClick = (keyword: string) => {
    setQuery(keyword);
  };

  // Perform Local Filter Sorting mapping
  const filteredAndSortedResults = results
    .filter(item => {
      // 1. Type filter matches mapping
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // 2. Arabic content filter checks
      if (arabicOnlyFilter) {
        const isArabicText = /[\u0600-\u06FF]/.test(item.title) || /[\u0600-\u06FF]/.test(item.overview);
        const hasArabicGen = item.genres?.includes('Arabic');
        if (!item.isArabic && !hasArabicGen && !isArabicText) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortOrder === 'year') {
        const yearA = a.releaseDate ? parseInt(a.releaseDate.split('-')[0]) || 0 : 0;
        const yearB = b.releaseDate ? parseInt(b.releaseDate.split('-')[0]) || 0 : 0;
        return yearB - yearA;
      }
      return 0; // maintain default
    });

  const isRtl = lang === 'ar';

  const suggestionKeywords = isRtl
    ? ['الهيبة', 'ولاد رزق', 'كيرة والجن', 'أكشن', 'غموض ورعب', 'دراما سورية', 'مسلسلات كوميدية', 'أحدث العروض', 'حصري']
    : ['Al Hayba', 'Welad Rizk', 'Kira & El Gin', 'Action', 'Mystery & Horror', 'Syrian Drama', 'Comedy Shows', 'Latest Hits', 'Exclusive'];

  return (
    <div className={`space-y-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Title Header with Glowing Cinema layout */}
      <div className="border-b border-slate-900/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <SearchIcon className="h-6 w-6 text-rose-500 animate-pulse" />
            <span>{isRtl ? 'البحث السينمائي الفوري' : t('searchTitle')}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {isRtl ? 'ابحث فوراً وبسهولة تامة عبر ملايين الأفلام، المسلسلات، ممثلي هوليوود وأعمال الشاشة العربية الحائزة على جوائز.' : t('searchDesc')}
          </p>
        </div>

        {/* Display Quick Statistics if search is loaded */}
        {query.trim() && !loading && (
          <span className="text-[10px] sm:text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-600/10 border border-rose-500/10 px-4 py-2 rounded-xl self-start md:self-auto select-none">
            {isRtl ? `تم العثور على ${filteredAndSortedResults.length} عمل مطابق` : `${filteredAndSortedResults.length} matches indexed`}
          </span>
        )}
      </div>

      {/* Input controls layout container */}
      <div className="space-y-4">
        <div className="relative max-w-3xl">
          <input
            type="text"
            placeholder={isRtl ? 'ابحث عن عناوين فخمة، أسماء مسلسلات، مخرجين طواقم العمل...' : t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full bg-[#151515] border-2 border-slate-900 focus:outline-none focus:border-rose-600/60 rounded-2xl py-4.5 ${isRtl ? 'pr-14 pl-28' : 'pl-14 pr-28'} text-sm sm:text-base text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500/15 transition-all font-semibold font-sans shadow-2xl`}
          />
          <div className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none`}>
            <SearchIcon className="h-5.5 w-5.5" />
          </div>

          {/* Controls Container for Clear & Microphones */}
          <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all border cursor-pointer select-none relative ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse scale-110 shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/20'
                }`}
                title={isListening 
                  ? (isRtl ? 'إيقاف الاستماع الآن' : 'Stop listening now') 
                  : (isRtl ? 'البحث بالصوت' : 'Voice Search')
                }
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  </>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}

            {query.trim() && (
              <button
                onClick={handleClear}
                className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isRtl ? 'تصفية حقل الكتابة' : 'Clear search text'}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Suggestion keywords search pills */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">
            {isRtl ? 'كلمات البحث المتداولة الليلة:' : 'Popular keywords:'}
          </span>
          {suggestionKeywords.map((word) => (
            <button
              key={word}
              onClick={() => handleSuggestionClick(word)}
              className="bg-slate-950 hover:bg-[#130a1c] border border-slate-900 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-xl transition-all select-none cursor-pointer"
            >
              #{word}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Fine Tuning Filter Rows */}
      <div className="bg-[#151515]/40 border border-slate-900 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 select-none">
        
        {/* Filter Type Pills Column (All, Movies, TV) */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: isRtl ? 'الكل' : t('showAll'), icon: Radio },
            { id: 'movie' as const, label: isRtl ? 'أفلام سينمائية' : t('moviesNav'), icon: Film },
            { id: 'tv' as const, label: isRtl ? 'مسلسلات دراما' : t('tvSeriesNav'), icon: Tv }
          ].map((type) => {
            const Icon = type.icon;
            const isActive = typeFilter === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/10 border border-rose-500/10'
                    : 'bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-850'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sorting and Content Toggle Features */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Toggle: Arabic Only Content 🇸🇦 */}
          <button
            onClick={() => setArabicOnlyFilter(!arabicOnlyFilter)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              arabicOnlyFilter
                ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-850'
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>{isRtl ? 'عربي حصري فقط 🇸🇦' : 'Arabic Only'}</span>
            {arabicOnlyFilter && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </button>

          {/* Quick Sort dropdown filters */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-slate-950 border border-slate-900 hover:border-slate-850 focus:outline-none focus:border-rose-600/50 rounded-xl px-4 py-2.5 text-xs font-black text-slate-300 font-sans cursor-pointer h-full"
          >
            <option value="default">{isRtl ? 'ترتيب ذكي افتراضي' : 'Default Rank'}</option>
            <option value="rating">{isRtl ? 'حسب التقييم الأعلى' : t('sortRating')}</option>
            <option value="year">{isRtl ? 'سنة الإصدار: الأحدث للأقدم' : t('sortYear')}</option>
          </select>

        </div>

      </div>

      {/* Main results display panel and layout states */}
      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-3 bg-[#151515]/10 rounded-3xl border border-slate-950">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-xs font-black text-rose-500/70 uppercase tracking-widest animate-pulse">
            {isRtl ? 'جاري فحص وتصفية الكتالوج السينمائي الموحد...' : t('loadingChannels')}
          </span>
        </div>
      ) : !query.trim() ? (
        
        /* 1. STATE A: Empty search view - Curated Recommended cinematic interface (تصميم باللغة العربية) */
        <div className="space-y-8 animate-fade-in">
          
          {/* Large Hero Promo banner card with dynamic suggestions inside */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-t from-slate-950 via-[#07040d] to-slate-950 p-8 md:p-12 text-center space-y-4 shadow-2xl">
            <div className="absolute top-0 left-0 w-44 h-44 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <Compass className="h-10 w-10 text-rose-500 mx-auto animate-bounce mb-2" />
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isRtl ? 'استكشف روائع المحتوى العالمي والحصري' : t('readyToDiscover')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              {isRtl 
                ? 'لم تقم بكتابة أي جملة بحث بعد. ابدأ بإدخال اسم العمل أو اختر من قائمة ترشيحاتنا الفخمة المنسقة خصيصاً لليلتك الحالية.'
                : t('searchPromptDesc')
              }
            </p>
          </div>

          {/* Suggested movie grid section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 px-1">
              <Flame className="h-4.5 w-4.5 text-rose-500 animate-pulse shrink-0" />
              <span>{isRtl ? 'أفلام ومسلسلات رائجة ومقترحة الآن' : 'Hand-picked Highlights For You'}</span>
            </h3>

            {loadingSuggestions ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {suggestions.map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-600 text-xs py-10 uppercase font-black font-mono">
                {isRtl ? 'لا توجد ترشيحات متوفرة حالياً.' : 'No items matched static highlights.'}
              </div>
            )}
          </div>

        </div>

      ) : filteredAndSortedResults.length === 0 ? (
        
        /* 2. STATE B: Query entered but absolutely no matching results (Empty state Arabic UI) */
        <div className="py-20 text-center space-y-4 bg-[#090512]/40 border border-slate-900/60 rounded-3xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-600/10 flex items-center justify-center border border-rose-500/10 text-rose-500 shrink-0">
            <HelpCircle className="h-6 w-6 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto px-4">
            <h3 className="font-extrabold text-white text-base">
              {isRtl ? `لم نجد أي نتيجة تطابق "${query}"` : t('noMoviesFound')}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {isRtl 
                ? 'يرجى التحقق من صحة الأحرف والكلمات المدخلة، أو تصفير مصفاة التصنيف "عربي حصري" والترتيب الذكي لمحاولة البحث مجدداً بصورة أوسع.'
                : t('searchNoResultsDesc')
              }
            </p>
          </div>

          {/* Back click guides */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isRtl ? 'إعادة تعيين حقل البحث' : 'Reset Search Field'}
            </button>
            <button
              onClick={() => {
                setArabicOnlyFilter(false);
                setTypeFilter('all');
                setSortOrder('default');
              }}
              className="px-5 py-2.5 bg-slate-950 hover:bg-[#130a1c] border border-slate-900 hover:border-rose-500/30 text-slate-350 hover:text-rose-400 text-xs font-black rounded-xl transition-all cursor-pointer"
            >
              {isRtl ? 'تصفير كافة الفلاتر' : 'Clear All Filters'}
            </button>
          </div>
        </div>

      ) : (
        
        /* 3. STATE C: High Density Results Display Grids */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredAndSortedResults.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </div>

      )}

    </div>
  );
};
