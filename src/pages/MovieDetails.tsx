import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, MovieComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MovieCard } from '../components/MovieCard';
import { Star, Play, Heart, Plus, Check, Calendar, Clock, MessageCircle, CalendarDays, User, ArrowLeft, ArrowRight, Share2, Film, Tv, Sparkles, Youtube, CheckCircle2 } from 'lucide-react';

export const MovieDetails: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { toggleWatchlist, isInWatchlist, user } = useAuth();
  const { lang, t, dir } = useLanguage();
  
  const [item, setItem] = useState<MediaItem | null>(null);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<MovieComment[]>([]);

  // Interactive Tabs
  const [activeTab, setActiveTab] = useState<'story' | 'cast' | 'trailer' | 'similar'>('story');

  // Local comments draft input
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  // Link copy toast feedback
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (id && type) {
      loadDetailsAndRecommendations();
      // Reset active tab on item change
      setActiveTab('story');
    }
  }, [id, type]);

  const loadDetailsAndRecommendations = async () => {
    setLoading(true);
    try {
      const data = await tmdbService.getDetails(id!, type as 'movie' | 'tv');
      if (data) {
        setItem(data);
        setReviews(data.comments || []);
      }
      
      const recs = await tmdbService.getSimilar(id!, type as 'movie' | 'tv');
      setSimilar(recs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: MovieComment = {
      id: `review-${Date.now()}`,
      userId: user?.uid || 'guest-uid',
      userName: user?.displayName || 'Kora Member',
      userPhoto: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
      rating: commentRating,
      text: commentText.trim(),
      timestamp: new Date().toLocaleDateString()
    };

    setReviews(prev => [newComment, ...prev]);
    setCommentText('');
    setCommentRating(5);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  const isRtl = lang === 'ar';

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        <span className="text-xs font-black text-rose-500/80 uppercase tracking-widest animate-pulse">
          {isRtl ? 'جاري تحميل تفاصيل السينما...' : t('loadingChannels')}
        </span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-24 text-center space-y-4">
        <h3 className="text-lg font-black text-slate-400">{t('mediaNotFound')}</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{t('mediaNotFoundDesc')}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-rose-600 px-6 py-3 text-xs font-black rounded-xl text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>{t('backHome')}</span>
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(item.id);

  // Parse production year
  const rawYear = item.releaseDate ? item.releaseDate.split('-')[0] : 'N/A';

  // Customize layout tabs values
  const tabs = [
    { id: 'story' as const, label: isRtl ? 'القصة' : 'The Story / Plot' },
    { id: 'cast' as const, label: isRtl ? 'الممثلون' : 'Cast & Stars' },
    { id: 'trailer' as const, label: isRtl ? 'الإعلان' : 'Official Trailer' },
    { id: 'similar' as const, label: isRtl ? 'أعمال مشابهة' : 'Similar & Recommendations' }
  ];

  return (
    <div className={`space-y-10 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      
      {/* Dynamic Native Share Success Toast Banner */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce flex items-center gap-2 bg-emerald-600 border border-emerald-500/10 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl shadow-black/80">
          <CheckCircle2 className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{isRtl ? 'تم نسخ الرابط ومشاركته بنجاح!' : 'Media link copied to clipboard successfully!'}</span>
        </div>
      )}

      {/* Cinematic Billboard (Backdrop banner with gradient maps) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-900/50 bg-[#0B0B0B] min-h-[380px] md:min-h-[500px] flex items-end shadow-2xl shadow-black">
        {/* Shadow Overlay Gradient filters for dramatic look */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/50 to-transparent z-10" />
        <div className={`absolute inset-0 bg-gradient-to-${isRtl ? 'l' : 'r'} from-[#0B0B0B] via-[#0B0B0B]/30 to-transparent z-10`} />
        
        <img
          src={item.backdropUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 md:opacity-60 scale-100 z-0 select-none blur-[0.5px]"
          referrerPolicy="no-referrer"
        />

        {/* Backdrop Visual Glow Accent */}
        <div className={`absolute bottom-0 ${isRtl ? 'right-12' : 'left-12'} w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none z-5`} />

        <div className="relative z-20 p-6 md:p-12 lg:p-14 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          
          {/* 1. بوستر الفيلم (Highly polished cinematic glass poster) */}
          <div className="w-44 md:w-60 lg:w-68 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border-2 border-slate-850/90 shadow-2xl shadow-black bg-slate-950 flex-none transition-transform duration-500 hover:scale-[1.02] relative group">
            <img 
              src={item.posterUrl} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-[10px] font-black tracking-widest font-mono text-white/90 uppercase">{item.title}</span>
            </div>
          </div>

          {/* Core Info details block */}
          <div className="grow space-y-5 self-stretch flex flex-col justify-end w-full">
            
            {/* Top Row Category Labels */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full select-none">
                {item.type === 'tv' ? t('tvType') : t('movieType')}
              </span>
              {item.isArabic && (
                <span className="bg-[#1b1329] border border-rose-500/20 text-rose-450 font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full select-none">
                  {isRtl ? 'محتوى عربي حصري' : 'Exclusive Arabic'}
                </span>
              )}
            </div>

            {/* 2. اسم الفيلم (Main big cinematic title with tracking-tight) */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-md">
                {item.title}
              </h1>

              {item.originalTitle && item.originalTitle !== item.title && (
                <h2 className="text-xs sm:text-sm font-bold text-slate-400 font-mono tracking-tight opacity-75">
                  {item.originalTitle}
                </h2>
              )}
            </div>

            {/* Grid of details: سنة الإنتاج، التصنيف، مدة العرض، التقييم، الأنواع */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-2.5 text-xs font-black text-slate-300 font-sans`}>
              
              {/* التقييم */}
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                <span>{item.rating || 'N/A'} {isRtl ? 'تقييم كورا' : '/ 10'}</span>
              </span>

              <span className="text-slate-800 hidden sm:inline">•</span>

              {/* سنة الإنتاج */}
              <span className="flex items-center gap-1.5 text-slate-350">
                <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{rawYear}</span>
              </span>

              <span className="text-slate-800 hidden sm:inline">•</span>

              {/* مدة العرض */}
              <span className="flex items-center gap-1.5 text-slate-350">
                <Clock className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{item.type === 'tv' ? `${item.seasonsCount || 1} ${t('seasonsCount')}` : item.duration}</span>
              </span>

              <span className="text-slate-800 hidden sm:inline">•</span>

              {/* التصنيف */}
              <span className="bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] tracking-wide text-rose-400 font-black uppercase">
                {item.type === 'tv' ? (isRtl ? 'مسلسل تلفزيوني' : 'TV Series') : (isRtl ? 'فيلم سينمائي' : 'Feature Movie')}
              </span>
            </div>

            {/* 3. الأنواع (List of genres rendered elegantly inside pill tags) */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {item.genres?.map((g) => (
                <span key={g} className="bg-[#100a1a] hover:bg-[#160e24] border border-rose-500/10 text-rose-400 text-[10px] font-black px-3.5 py-1 rounded-xl uppercase tracking-wider cursor-default">
                  {isRtl ? (g === 'Arabic' ? 'عربي' : g === 'Action' ? 'أكشن' : g === 'Drama' ? 'دراما' : g === 'History' ? 'تاريخي' : g === 'Horror' ? 'رعب' : g === 'Mystery' ? 'غموض' : g) : g}
                </span>
              ))}
            </div>

            {/* 4. Buttons: مشاهدة الآن، إضافة للمفضلة، مشاركة */}
            <div className="flex flex-wrap gap-3.5 pt-3">
              {/* مشاهدة الآن */}
              <Link
                to={`/watch/${item.type}/${item.id}`}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-8 py-4 rounded-xl transition-all shadow-xl shadow-rose-600/35 hover:scale-[1.03] active:scale-[0.98] select-none shrink-0"
              >
                <Play className={`h-4.5 w-4.5 fill-white ${isRtl ? 'rotate-180' : ''}`} />
                <span>{isRtl ? 'مشاهدة الآن' : 'Watch Now'}</span>
              </Link>

              {/* إضافة للمفضلة */}
              <button
                onClick={() => toggleWatchlist(item.id)}
                className={`flex items-center justify-center gap-2 px-6 py-4 text-xs font-black rounded-xl border transition-all select-none cursor-pointer duration-300 ${
                  inWatchlist
                    ? 'bg-rose-600/15 text-rose-400 border-rose-500/30 hover:bg-rose-600/25'
                    : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-white hover:bg-slate-850'
                }`}
              >
                {inWatchlist ? <Check className="h-4 w-4 text-rose-500" /> : <Plus className="h-4 w-4" />}
                <span>{inWatchlist ? (isRtl ? 'بالمفضلة' : 'Saved in Watchlist') : (isRtl ? 'إضافة للمفضلة' : 'Add to Watchlist')}</span>
              </button>

              {/* مشاركة */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-white hover:bg-slate-850 px-6 py-4 text-xs font-black rounded-xl transition-all select-none cursor-pointer font-sans"
              >
                <Share2 className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{isRtl ? 'مشاركة' : 'Share'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Cinematic Tabs Navigation row */}
      <div className="border-b border-slate-900/80 bg-[#0B0B0B]/40 p-1.5 rounded-2xl flex flex-wrap gap-1 md:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] text-center px-4 py-3.5 text-xs font-black rounded-xl transition-all select-none cursor-pointer uppercase tracking-wider ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/15 font-black border border-rose-500/10 scale-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Content Sections */}
      <div className="space-y-8 min-h-[220px]">
        {/* TAB 1: القصة */}
        {activeTab === 'story' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Overview Plot text inside cinema card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/30 border border-slate-900/60 p-6 md:p-8 rounded-2xl font-sans relative">
                <div className="absolute top-4 right-4 text-rose-600/5 select-none text-7xl font-sans pointer-events-none">❝</div>
                <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-3">{isRtl ? 'قصة العمل بالتفصيل' : 'Detailed Overview Plot'}</h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed tracking-wide whitespace-pre-line font-medium text-justify">
                  {item.overview || (isRtl ? 'لم يكتب تلخيص لهذه القصة بعد' : 'No summary has been curated for this title.')}
                </p>
              </div>

              {/* Show episodes inside Story summary too for TV shows so users do not miss episodes! */}
              {item.type === 'tv' && item.episodes && item.episodes.length > 0 && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider px-1">{isRtl ? 'حلقات المسلسل' : 'Show Episodes'}</h3>
                  <div className="bg-slate-900/30 border border-slate-900/60 rounded-2xl divide-y divide-slate-950 overflow-hidden shadow-sm">
                    {item.episodes.map((ep) => (
                      <Link
                        key={ep.id}
                        to={`/watch/tv/${item.id}?ep=${ep.episodeNumber}`}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/80 transition-colors group text-left block"
                      >
                        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <span className="text-[10px] font-black tracking-widest text-rose-500 uppercase">
                            {isRtl ? `الحلقة ${ep.episodeNumber}` : `Episode ${ep.episodeNumber}`}
                          </span>
                          <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-rose-450 transition-colors leading-tight">
                            {ep.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 select-none">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 font-mono">{ep.duration}</span>
                          <div className="p-2 rounded-full bg-slate-950 text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-md">
                            <Play className={`h-3 w-3 fill-current ${isRtl ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidelined Crew & Production staff specs */}
            <div className="space-y-4">
              <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-5">
                <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider border-b border-slate-900 pb-3">{isRtl ? 'طاقم العمل والإنتاج' : 'Production Specs'}</h3>
                
                <div className="space-y-3.5 divide-y divide-slate-950 font-sans text-xs">
                  {item.director && (
                    <div className="pt-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase block tracking-wider mb-1">{isRtl ? 'المخرج المبدع' : 'Director'}</span>
                      <span className="font-bold text-slate-200">{item.director}</span>
                    </div>
                  )}

                  {item.creator && (
                    <div className="pt-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase block tracking-wider mb-1">{isRtl ? 'المؤلف / المبتكر' : 'Creator'}</span>
                      <span className="font-bold text-slate-200">{item.creator}</span>
                    </div>
                  )}

                  <div className="pt-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase block tracking-wider mb-1">{isRtl ? 'مدخل الصوت الترجمي' : 'Audio Languages'}</span>
                    <span className="font-bold text-slate-200">{isRtl ? 'العربية والترجمة الفورية الفائقة' : 'Multilingual Stereo Studio Buffers'}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase block tracking-wider mb-1">{isRtl ? 'تراخيص البث' : 'Streaming Right'}</span>
                    <span className="font-bold text-rose-400 select-none flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'مرخص بجودة عالية جداً' : 'Gold Premium License'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: الممثلون */}
        {activeTab === 'cast' && (
          <div className="bg-slate-900/30 border border-slate-900/60 p-6 md:p-8 rounded-3xl animate-fade-in">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider mb-6">{isRtl ? 'أبطال العمل ونجوم الشاشة' : 'Cast Stars & Lead Actors'}</h3>
            
            {item.cast && item.cast.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {item.cast.map((actor) => (
                  <div key={actor} className="flex items-center gap-3 bg-[#0B0B0B]/60 p-4 rounded-xl border border-slate-900/60 hover:bg-[#1C1C1C]/10 hover:border-rose-500/20 transition-all select-none">
                    <div className="h-10 w-10 bg-rose-600/10 rounded-full flex items-center justify-center text-xs font-black text-rose-450 border border-rose-500/10 shrink-0 select-none uppercase font-mono">
                      {actor.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-200 group-hover:text-rose-400 transition-colors uppercase">{actor}</span>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">{isRtl ? 'شخصية رئيسية' : 'Lead Role'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-black uppercase tracking-wider leading-loose">
                {isRtl ? 'لم يتم العثور على قائمة الممثلين لهذا العمل' : t('castNotListed')}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: الإعلان */}
        {activeTab === 'trailer' && (
          <div className="space-y-4 animate-fade-in bg-slate-900/30 border border-slate-900/60 p-6 md:p-8 rounded-3xl">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider mb-2">{isRtl ? 'العرض الترويجي والإعلاني الرسمي' : 'Official Media trailers & Teasers'}</h3>
            {item.trailerUrl ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-950/80 shadow-2xl bg-black">
                <iframe
                  src={item.trailerUrl}
                  title="Official Promo Video Trailer"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Youtube className="h-12 w-12 text-slate-700 shrink-0" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'عذراً، العرض الترويجي غير متوفر حالياً' : 'No promo video available for this selected title.'}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: أعمال مشابهة */}
        {activeTab === 'similar' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider px-1">{isRtl ? 'أفلام ومسلسلات قد تعجبك أيضاً' : 'More blockbusters hand-picked for you'}</h3>
            {similar.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similar.slice(0, 6).map((similarItem) => (
                  <MovieCard key={similarItem.id} item={similarItem} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs font-black uppercase tracking-widest bg-slate-900/20 rounded-2xl p-6">
                {isRtl ? 'لا توجد أعمال مشابهة مقترحة حالياً' : 'No recommended companion titles found.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Reviews & Critique section - Integrated natively under tabs */}
      <section className="space-y-6 pt-6 border-t border-slate-900/80">
        <h2 className="text-lg font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{isRtl ? 'آراء المشاهدين والنقاد' : t('userCritique')} ({reviews.length})</span>
        </h2>

        {/* Write a critique box */}
        {user ? (
          <form onSubmit={handlePostReview} className="bg-slate-900/30 border border-slate-900/70 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs font-black text-slate-300">{isRtl ? 'قيم هذا العمل من 5 نجوم:' : `${t('yourRating')}:`}</span>
              
              {/* Star controls */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCommentRating(star)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star className={`h-6 w-6 transition-all duration-200 hover:scale-125 ${star <= commentRating ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder={isRtl ? 'اكتب رأيك النقدي بصراحة حول هذا العمل... ما الذي أعجبك وما الذي لم يعجبك؟' : t('reviewPlaceholder')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-slate-800/80 focus:outline-none focus:border-rose-500/50 p-4 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 min-h-[120px] font-sans leading-relaxed resize-none shadow-inner"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-xs font-black text-white px-6 py-3 rounded-xl transition-all shadow-md shadow-rose-600/10 active:scale-95 cursor-pointer shrink-0"
              >
                {isRtl ? 'نشر التعليق الآن' : t('postReview')}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-2xl text-center text-slate-500 text-xs font-black uppercase tracking-wider">
            {isRtl ? 'يرجى تسجيل الدخول لتتمكن من كتابة رأيك النبيل وتجربة التقييم!' : t('signInToReview')}
          </div>
        )}

        {/* Feedback Feed */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-8 text-center text-slate-655 text-xs font-black uppercase tracking-widest leading-loose bg-[#0B0B0B]/20 border border-slate-900/40 rounded-2xl">
              {isRtl ? 'كن أول من يعبر عن رأيه ويوجه نقده الفني لهذا العمل!' : t('firstReview')}
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-[#0B0B0B]/40 border border-slate-900/60 p-5 rounded-2xl space-y-3 font-sans">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img src={rev.userPhoto} alt={rev.userName} className="h-9 w-9 rounded-full object-cover border border-slate-800 select-none" />
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white">{rev.userName}</h4>
                      <span className="text-[9px] text-slate-500 font-mono tracking-tight">{rev.timestamp}</span>
                    </div>
                  </div>
                  
                  {/* Rating Stars show badge */}
                  <span className="flex items-center gap-1 bg-[#1b1329] px-2.5 py-1 rounded-lg border border-slate-850 text-amber-400 font-extrabold text-[10px] select-none font-mono">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    <span>{rev.rating}.0</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
                  {rev.text}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};
