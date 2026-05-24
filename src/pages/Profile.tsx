import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MovieCard } from '../components/MovieCard';
import { Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Shield, 
  ListVideo, 
  History, 
  Clock, 
  Play, 
  Camera, 
  Check, 
  X, 
  Sliders, 
  Bell, 
  Tv, 
  HelpCircle, 
  Heart, 
  Trash2, 
  Loader2, 
  Eye, 
  HeartHandshake, 
  Flame, 
  Sparkles, 
  Zap, 
  Settings 
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: '1', nameAr: 'بطل الحركة والأكشن', nameEn: 'Action Hero', url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=200&fit=crop' },
  { id: '2', nameAr: 'بطلة الدراما الكلاسيكية', nameEn: 'Drama Star', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&fit=crop' },
  { id: '3', nameAr: 'المخرج العبقري', nameEn: 'Master Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&fit=crop' },
  { id: '4', nameAr: 'متابع الخيال العلمي', nameEn: 'Sci-Fi Fanatic', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&fit=crop' },
  { id: '5', nameAr: 'نجمة الأفلام الذهبية', nameEn: 'Golden Era Starlet', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&fit=crop' },
  { id: '6', nameAr: 'الروح الكوميدية اللطيفة', nameEn: 'Comedy Soul', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&fit=crop' },
  { id: '7', nameAr: 'عشاق الغموض والرعب', nameEn: 'Mystery Sleuth', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&fit=crop' },
  { id: '8', nameAr: 'التاج الذهبي الملكي VIP', nameEn: 'VIP Royal Gold', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&fit=crop' }
];

export const Profile: React.FC = () => {
  const { 
    user, 
    logout, 
    updateUserRole, 
    updateUserProfile, 
    toggleWatchlist, 
    isInWatchlist, 
    removeFromHistory, 
    clearAllHistory 
  } = useAuth();
  const { lang, t, dir } = useLanguage();

  // Load State Details
  const [historyItems, setHistoryItems] = useState<{ item: MediaItem; watchedAt: string; progress: number }[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<MediaItem[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Active Tab Manager
  const [activeTab, setActiveTab] = useState<'favorites' | 'continue' | 'history'>('favorites');

  // Input states
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [photoURLInput, setPhotoURLInput] = useState(user?.photoURL || '');
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; success: boolean } | null>(null);

  // App-level client visual settings (Streaming Preferences)
  const [streamQuality, setStreamQuality] = useState<'4k' | 'fhd' | 'hd' | 'saver'>('fhd');
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [subtitleSize, setSubtitleSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setDisplayNameInput(user.displayName || '');
      setPhotoURLInput(user.photoURL || '');
    }
  }, [user?.displayName, user?.photoURL]);

  // Load Custom User settings on Mount
  useEffect(() => {
    const saved = localStorage.getItem('koraflix_steaming_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.streamQuality) setStreamQuality(parsed.streamQuality);
        if (parsed.autoPlayNext !== undefined) setAutoPlayNext(parsed.autoPlayNext);
        if (parsed.subtitleSize) setSubtitleSize(parsed.subtitleSize);
        if (parsed.alertsEnabled !== undefined) setAlertsEnabled(parsed.alertsEnabled);
      } catch (e) {
        console.error('Error reading custom settings', e);
      }
    }
  }, []);

  // Save changes block helper
  const triggerSavePrefs = (key: string, val: any) => {
    const current = {
      streamQuality,
      autoPlayNext,
      subtitleSize,
      alertsEnabled,
      [key]: val
    };
    localStorage.setItem('koraflix_steaming_prefs', JSON.stringify(current));
    
    // Quick micro visual feedback
    setToastMessage({
      text: isRtl ? 'تم تحديث التفضيلات فورياً الحفظ سحابي ⚡' : 'Streaming configurations saved locally ⚡',
      success: true
    });
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    resolveWatchlistAndHistory();
  }, [user?.watchlist, user?.history]);

  const resolveWatchlistAndHistory = async () => {
    if (!user) {
      setLoadingLists(false);
      return;
    }

    try {
      // 1. Fetch Watchlist Details
      const watchlistResolved = await Promise.all(
        (user.watchlist || []).map(async (id) => {
          const type = id.startsWith('s-') || id.includes('tv') ? 'tv' : 'movie';
          return await tmdbService.getDetails(id, type);
        })
      );
      setWatchlistItems(watchlistResolved.filter((item): item is MediaItem => item !== null));

      // 2. Fetch History Details
      const historyResolved = await Promise.all(
        (user.history || []).map(async (h) => {
          const type = h.mediaId.startsWith('s-') || h.mediaId.includes('tv') ? 'tv' : 'movie';
          const item = await tmdbService.getDetails(h.mediaId, type);
          if (item) {
            return {
              item,
              watchedAt: h.watchedAt,
              progress: h.progress
            };
          }
          return null;
        })
      );
      setHistoryItems(historyResolved.filter((x): x is { item: MediaItem; watchedAt: string; progress: number } => x !== null));
    } catch (e) {
      console.error('Error resolving lists for profile view:', e);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleUpdateProfile = () => {
    if (!displayNameInput.trim()) {
      setToastMessage({
        text: isRtl ? 'حقل الاسم لا يمكن أن يكون فارغاً' : 'Name field cannot be left blank.',
        success: false
      });
      return;
    }

    updateUserProfile(displayNameInput.trim(), photoURLInput);
    setToastMessage({
      text: isRtl ? 'تم تحديث الاسم المتميز وصورة الحساب بنجاح! 🎉' : 'Display profile details updated successfully! 🎉',
      success: true
    });
    setShowAvatarPresets(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (url: string) => {
    setPhotoURLInput(url);
    // Instant save name + selected avatar for supreme user experience
    updateUserProfile(displayNameInput.trim() || user?.displayName || 'Kora Member', url);
    setToastMessage({
      text: isRtl ? 'تم حفظ أيقونة بطل العرض الجديدة بنجاح! 🎬' : 'New cinematic avatar selected!',
      success: true
    });
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleResetAllHistory = () => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من رغبتك في مسح سجل المشاهدة بالكامل؟ لا يمكن التراجع عن هذا الإجراء!' : 'Are you sure you want to completely clear your streaming history? This action is irreversible!')) {
      clearAllHistory();
      setToastMessage({
        text: isRtl ? 'تم تصفير سجل العرض بالكامل' : 'Streaming history wiped completely.',
        success: true
      });
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const isRtl = lang === 'ar';

  if (!user) {
    return (
      <div className="py-24 text-center space-y-4 max-w-sm mx-auto" dir={dir}>
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-600/10 flex items-center justify-center border border-rose-500/10 text-rose-500">
          <User className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-black text-white">{isRtl ? 'يرجى تسجيل الدخول أولاً' : t('signInToReview') || 'Account Access Required'}</h3>
        <p className="text-xs text-slate-400 font-medium">
          {isRtl 
            ? 'قم بإنشاء حساب أو تسجيل الدخول فوراً لحفظ قائمتك المفضلة، تتبع مستوى المشاهدة والتحكم بالإعدادات السينمائية.' 
            : 'Sign in to check and configure your private streaming profile.'}
        </p>
        <Link
          to="/login"
          className="inline-block bg-rose-600 hover:bg-rose-500 px-8 py-3 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-rose-600/20 w-full"
        >
          {t('signIn') || 'Login Now'}
        </Link>
      </div>
    );
  }

  // Pre-configured blockbusters to suggest when favorites or history is completely empty
  const mockSuggestions = [
    { id: 'm-1', title: 'ولاد رزق 3: القاضية', type: 'movie' as const, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&fit=crop', year: '2024', rating: 9.2 },
    { id: 's-1', title: 'مسلسل الهيبة: الرد', type: 'tv' as const, poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&fit=crop', year: '2022', rating: 8.8 },
    { id: 'm-2', title: 'كيرة والجن', type: 'movie' as const, poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&fit=crop', year: '2022', rating: 8.9 }
  ];

  return (
    <div className={`space-y-10 ${isRtl ? 'text-right' : 'text-left'} max-w-5xl mx-auto`} dir={dir}>
      
      {/* Dynamic Pop Messages / Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border transition-all animate-bounce ${
          toastMessage.success 
            ? 'bg-[#0f1d13] border-emerald-500/20 text-emerald-400' 
            : 'bg-[#200b0d] border-rose-500/20 text-rose-400'
        }`}>
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage.text}</span>
        </div>
      )}

      {/* Profile Header Title */}
      <div className="border-b border-slate-900/60 pb-6">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Sliders className="h-6 w-6 text-rose-500" />
          <span>{isRtl ? 'قمرة التحكم في ملفك العائلي المتميز' : 'High-Fidelity User Command Center'}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          {isRtl 
            ? 'اضبط خيارات البث بجودة 4K، خصص صورتك الشخصية بوجوه الأبطال، وتحكم بسجل المشاهدة وقوائم التفضيل المتزامنة سحابياً.' 
            : 'Customize your layout, select cinematic heroes profile icons, tweak 4K rendering layers and view watch metrics.'}
        </p>
      </div>

      {/* Grid wrapper: Left Account/Avatar Card, Right Settings & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Module A: Account & Avatar Config Panel (صورة الحساب والاسم) (4 cols) */}
        <div className="lg:col-span-5 bg-[#151515] border border-slate-900 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center space-y-4">
            
            {/* The Avatar Display Container with Hover Editing state */}
            <div className="relative inline-block group">
              <img
                src={photoURLInput || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&fit=crop'}
                alt={user.displayName || 'Cinema Member'}
                className="h-28 w-28 rounded-full object-cover border-4 border-slate-900 ring-2 ring-rose-500 shadow-2xl mx-auto transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                className="absolute bottom-1 right-1 bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-full border-2 border-slate-950 shadow-md cursor-pointer transition-colors"
                title={isRtl ? 'تغيير صورة الحساب' : 'Edit profile photo'}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-white flex items-center gap-1.5 justify-center">
                <span>{user.displayName || 'عضو كورا فليكس'}</span>
                {user.role === 'admin' && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                    {isRtl ? 'مشرف المنصة VIP' : 'Staff Admin'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-505 font-mono">{user.email || 'guest@koraflix.com'}</p>
            </div>

          </div>

          {/* Quick Avatar Preset Selection Area */}
          {showAvatarPresets && (
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>{isRtl ? 'رموز أبطال العرض المتاحة:' : 'Cinematic Personas'}</span>
                </span>
                <button 
                  onClick={() => setShowAvatarPresets(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = photoURLInput === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-rose-500 scale-95 ring-2 ring-rose-500/20' 
                          : 'border-slate-900 hover:border-slate-800'
                      }`}
                      title={isRtl ? preset.nameAr : preset.nameEn}
                    >
                      <img src={preset.url} alt="preset-icon" className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-rose-600/20 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Edit Display Name fields form */}
          <div className="space-y-4 pt-2">
            
            {/* Display Name input */}
            <div className="space-y-1.5 text-right">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'اسم العرض المستعار:' : 'Display Name / Nickname:'}
              </label>
              <input
                type="text"
                placeholder={isRtl ? 'الاسم المعروض بالتعليقات...' : 'Display nickname'}
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold font-sans placeholder-slate-650"
              />
            </div>

            {/* Custom URL Option toggle */}
            <div className="space-y-1.5 text-right">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'أو ضع رابط صورة خارجية مخصص (URL):' : 'Or Custom Avatar image URL:'}
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={photoURLInput}
                onChange={(e) => setPhotoURLInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold font-sans placeholder-slate-650"
              />
            </div>

            {/* Update Save button wrapper */}
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10 cursor-pointer transition-all"
            >
              <Check className="h-4.5 w-4.5" />
              <span>{isRtl ? 'حقظ التعديلات وحفظ الصورة' : 'Save Details'}</span>
            </button>

          </div>

          {/* Quick Sandbox Admin Panel Access if Role evaluated */}
          <div className="border-t border-slate-900/60 pt-4 space-y-2">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
              {isRtl ? 'رتبة تفعيل الحساب الحالية:' : 'Evaluate Account permissions:'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => updateUserRole('user')}
                className={`grow py-1.5 text-[9px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                  user.role === 'user'
                    ? 'bg-rose-600/10 border-rose-500/20 text-rose-400'
                    : 'bg-slate-950 border-slate-900 text-slate-500'
                }`}
              >
                {isRtl ? 'عضو عادي' : 'Standard Member'}
              </button>
              <button
                onClick={() => updateUserRole('admin')}
                className={`grow py-1.5 text-[9px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                  user.role === 'admin'
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-900 text-slate-500'
                }`}
              >
                {isRtl ? 'مشرف المنصة' : 'Platform Admin'}
              </button>
            </div>
          </div>

        </div>

        {/* Module B: Premium Custom Settings & General User Options (7 cols) */}
        <div className="lg:col-span-7 bg-[#151515] border border-slate-900 rounded-3xl p-6 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-905 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-rose-500" />
              <span>{isRtl ? 'التفضيلات الفخمة وإعدادات البث' : 'Streaming Preferences'}</span>
            </h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg font-black uppercase tracking-wider">
              {isRtl ? 'نشط بالدولبي' : 'Dolby Audio On'}
            </span>
          </div>

          <div className="space-y-5">
            
            {/* Setting 1: Video Quality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/50">
              <div className="space-y-0.5 text-right">
                <span className="text-xs sm:text-sm font-black text-white block">
                  {isRtl ? 'جودة البث الافتراضية للكتالوج' : 'Main Stream Quality Preference'}
                </span>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'حدد سرعة وتدفق التحويل لتشغيل سلس بدون تقطيع.' : 'Choose rendering and compression buffers.'}
                </p>
              </div>

              <select
                value={streamQuality}
                onChange={(e) => {
                  setStreamQuality(e.target.value as any);
                  triggerSavePrefs('streamQuality', e.target.value);
                }}
                className="bg-[#151515] border border-slate-900 rounded-xl px-4 py-2.5 text-xs font-black text-rose-450 font-sans cursor-pointer h-full outline-none focus:border-rose-600"
              >
                <option value="4k">4K Ultra HD (2160p)</option>
                <option value="fhd">1080p Full HD (Default)</option>
                <option value="hd">720p Mobile Quality</option>
                <option value="saver">توفير البيانات Data Saver</option>
              </select>
            </div>

            {/* Setting 2: AutoPlay Episodes toggler */}
            <div className="flex items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/50">
              <div className="space-y-0.5 text-right">
                <span className="text-xs sm:text-sm font-black text-white block">
                  {isRtl ? 'متابعة البث التلقائي للمقاطع' : 'Autoplay Next Episode'}
                </span>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'تشغيل الحلقات القادمة من مسلسلاتك المفضلة فوراً.' : 'Binge network series continuously with fluid loops.'}
                </p>
              </div>

              <button
                onClick={() => {
                  const next = !autoPlayNext;
                  setAutoPlayNext(next);
                  triggerSavePrefs('autoPlayNext', next);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-350 cursor-pointer ${
                  autoPlayNext ? 'bg-rose-600' : 'bg-slate-900'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-350 ${
                    autoPlayNext ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? '-translate-x-1' : 'translate-x-1')
                  }`}
                />
              </button>
            </div>

            {/* Setting 3: Arabic Subtitle Font-size dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/50">
              <div className="space-y-0.5 text-right">
                <span className="text-xs sm:text-sm font-black text-white block">
                  {isRtl ? 'حجم مصفوفة خط الترجمة العربية' : 'Arabic Subtitle Font Scale'}
                </span>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'تحكم في حجم وعرض نصوص الترجمة المدرجة بملفات البث.' : 'Configure text size inside video overlay overlays.'}
                </p>
              </div>

              <select
                value={subtitleSize}
                onChange={(e) => {
                  setSubtitleSize(e.target.value as any);
                  triggerSavePrefs('subtitleSize', e.target.value);
                }}
                className="bg-[#151515] border border-slate-900 rounded-xl px-4 py-2.5 text-xs font-black text-rose-450 font-sans cursor-pointer h-full outline-none focus:border-rose-600"
              >
                <option value="xl">{isRtl ? 'ضخم عريض (24px)' : 'Extra Large (24px)'}</option>
                <option value="lg">{isRtl ? 'مناسب قياسي (18px)' : 'Standard (18px)'}</option>
                <option value="md">{isRtl ? 'صغير ملموم (14px)' : 'Comfortable (14px)'}</option>
                <option value="sm">{isRtl ? 'دقيق ناعم (11px)' : 'Compact (11px)'}</option>
              </select>
            </div>

            {/* Setting 4: Exclusive Notifications Alert toggler */}
            <div className="flex items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900/50">
              <div className="space-y-0.5 text-right">
                <span className="text-xs sm:text-sm font-black text-white block">
                  {isRtl ? 'تنبيهات الحصريات والجوائز 🇸🇦' : 'Exclusive Releases Notifications'}
                </span>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'احصل على إشعارات فورية عند ببلورة وإنتاج أفلام عربية جديدة.' : 'Receive browser alerts when elite movies launch.'}
                </p>
              </div>

              <button
                onClick={() => {
                  const next = !alertsEnabled;
                  setAlertsEnabled(next);
                  triggerSavePrefs('alertsEnabled', next);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-350 cursor-pointer ${
                  alertsEnabled ? 'bg-rose-600' : 'bg-slate-900'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-350 ${
                    alertsEnabled ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? '-translate-x-1' : 'translate-x-1')
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Core Member Metrics Stats row */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-900 pt-5 text-center">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900/40">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                {isRtl ? 'قائمتي' : 'Watchlist'}
              </span>
              <span className="text-base sm:text-lg font-black text-rose-500 block mt-1">
                {user.watchlist?.length || 0}
              </span>
            </div>
            
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900/40">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                {isRtl ? 'تم بثها' : 'Watched count'}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-500 block mt-1">
                {user.history?.length || 0}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900/40">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                {isRtl ? 'خادم العرض' : 'Node server'}
              </span>
              <span className="text-base sm:text-lg font-black text-purple-400 block mt-1 font-mono">
                VIP-5.1
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Module C: Interactive Tab Panels (سجل المتابعة والمفضلة) (12 cols) */}
      <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-8 select-none">
        
        {/* Navigation Tab Pills inside */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'favorites' as const, label: isRtl ? 'المفضلة وقائمتي' : t('watchlist') || 'Saved Watchlist', icon: Heart, color: 'text-rose-500' },
              { id: 'continue' as const, label: isRtl ? 'متابعة المشاهدة' : 'Continue Watching', icon: Play, color: 'text-emerald-500' },
              { id: 'history' as const, label: isRtl ? 'سجل المشاهدة الكامل' : 'Streaming History', icon: History, color: 'text-amber-500' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/10 scale-102 border border-rose-500/15'
                      : 'bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-850'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action indicator if history tab active */}
          {activeTab === 'history' && historyItems.length > 0 && (
            <button
              onClick={handleResetAllHistory}
              className="px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/10 hover:border-transparent text-rose-450 hover:text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isRtl ? 'تصفير السجل وتطهيره' : 'Wipe Full History'}</span>
            </button>
          )}

        </div>

        {/* Tab contents displays rendering details */}
        {loadingLists ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
            <span className="text-xs font-black text-rose-500/80 animate-pulse tracking-widest uppercase">
              {isRtl ? 'جاري فك تشفير وتحديث مصفوفة القوائم...' : 'Synchronizing lists across server nodes...'}
            </span>
          </div>
        ) : (
          <div className="animate-fade-in">
            
            {/* TAB 1: WATCHLIST / FAVORITES */}
            {activeTab === 'favorites' && (
              <div>
                {watchlistItems.length === 0 ? (
                  
                  /* Empty state Arabic UI for Favorites */
                  <div className="py-14 text-center max-w-2xl mx-auto space-y-6">
                    <div className="h-14 w-14 rounded-full bg-rose-600/10 flex items-center justify-center border border-rose-500/15 text-rose-500 mx-auto animate-pulse">
                      <HeartHandshake className="h-7 w-7" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-extrabold text-white">
                        {isRtl ? 'قائمة المفضلة فارغة حالياً!' : t('watchlistEmptyDesc') || 'Your collection is empty.'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-450 leading-relaxed max-w-md mx-auto">
                        {isRtl 
                          ? 'لم تقم بحفظ أي فيلم أو مسلسل درامي حتى الآن. استكشف العروض الحصرية المقترحة بالأسفل لتضيفها لقائمة ليلتك بضغطة زر مفردة.' 
                          : 'You haven\'t bookmarked any works yet. Add blockbusters to stream them later.'}
                      </p>
                    </div>

                    {/* Quick recommended items carousel/grid to add immediately */}
                    <div className="border-t border-slate-905 pt-6 space-y-4">
                      <h4 className="text-[10px] sm:text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 justify-center">
                        <Flame className="h-4 w-4 animate-pulse" />
                        <span>{isRtl ? 'روائع عربية متداولة الآن ونوصي بها لليلتك:' : 'Trending Arabic additions we recommend:'}</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                        {mockSuggestions.map((item) => {
                          const loved = isInWatchlist(item.id);
                          return (
                            <div key={item.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-800 transition-all">
                              <div className="flex items-center gap-3">
                                <img src={item.poster} alt={item.title} className="h-12 w-9 rounded-md object-cover flex-shrink-0" />
                                <div>
                                  <h5 className="text-[11px] font-extrabold text-white leading-tight line-clamp-1">{item.title}</h5>
                                  <span className="text-[9px] text-rose-500 font-bold block">★ {item.rating} • {item.year}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleWatchlist(item.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  loved 
                                    ? 'bg-rose-600/20 text-rose-500' 
                                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                                }`}
                              >
                                {loved ? (isRtl ? 'مضاف ✓' : 'Added') : (isRtl ? '+ قائمتي' : '+ Save')}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchlistItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <MovieCard item={item} />
                        {/* Instant Quick Unfavor button */}
                        <button
                          onClick={() => toggleWatchlist(item.id)}
                          className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-850 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-lg scale-0 group-hover:scale-100 cursor-pointer"
                          title={isRtl ? 'إزالة من المفضلة' : 'Remove from Watchlist'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONTINUE WATCHING (متابعة المشاهدة) */}
            {activeTab === 'continue' && (
              <div>
                {historyItems.length === 0 ? (
                  
                  <div className="py-14 text-center max-w-md mx-auto space-y-4">
                    <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center text-slate-550 mx-auto border border-slate-900">
                      <Tv className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{isRtl ? 'لا توجد أعمال قيد المتابعة حالياً' : 'No titles in progress!'}</h3>
                      <p className="text-xs text-slate-505 mt-1">
                        {isRtl 
                          ? 'عندما تشاهد أي فيلم أو حلقة مسلسل وتقوم بالخروج، سنحفظ تقدم العرض بنسبة 100% لتكمل المشاهدة هنا.' 
                          : 'Start watching a title on our players to continue where you left off.'}
                      </p>
                    </div>
                  </div>

                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {historyItems.map(({ item, watchedAt, progress }) => (
                        <div 
                          key={item.id}
                          className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-800 transition-all text-right group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/5 rounded-full blur-xl pointer-events-none" />
                          
                          <div className="flex items-center gap-4 grow">
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="h-16 w-11 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-900"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1 my-1 grow">
                              <h3 className="font-extrabold text-white text-xs sm:text-sm leading-tight line-clamp-1">{item.title}</h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider block">
                                {isRtl ? (item.type === 'tv' ? 'مسلسل تلفزيوني' : 'فيلم سينمائي') : item.type} • {isRtl ? 'شوهد' : 'Streamed'} {new Date(watchedAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                              </p>
                              
                              {/* Glowing progress line */}
                              <div className="flex items-center gap-2.5 max-w-xs pt-1">
                                <div className="h-1.5 bg-slate-900 rounded-full w-full overflow-hidden border border-slate-950">
                                  <div className="h-full bg-rose-600 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-extrabold text-rose-450 shrink-0">{progress}%</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/watch/${item.type}/${item.id}`}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] sm:text-[11px] uppercase py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/5 justify-center transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Play className={`h-3 w-3 fill-white ${isRtl ? 'rotate-180' : ''}`} />
                            <span>{isRtl ? 'إكمال العرض' : 'Resume'}</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMPLETE WATCH HISTORY (سجل المشاهدة) */}
            {activeTab === 'history' && (
              <div>
                {historyItems.length === 0 ? (
                  
                  <div className="py-14 text-center max-w-md mx-auto space-y-4">
                    <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center text-slate-550 mx-auto border border-slate-900">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{isRtl ? 'سجل العرض خالٍ تماماً' : 'Watch history empty.'}</h3>
                      <p className="text-xs text-slate-505 mt-1">
                        {isRtl 
                          ? 'دعنا نحفز ليلتك بعرض سينمائي رائع لحفظه هنا.' 
                          : 'Explore our movies and TV series catalog to build your viewing logs.'}
                      </p>
                    </div>
                  </div>

                ) : (
                  <div className="space-y-3.5">
                    {historyItems.map(({ item, watchedAt, progress }) => (
                      <div 
                        key={item.id}
                        className="bg-slate-950 border border-slate-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-800 transition-all text-right"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="h-14 w-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-900"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 text-right">
                            <h3 className="font-extrabold text-white text-sm leading-tight">{item.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              <span>{isRtl ? (item.type === 'tv' ? 'دراما تلفزيونية' : 'فيلم سينمائي') : item.type}</span>
                              <span>•</span>
                              <span>{isRtl ? 'تاريخ العرض:' : 'Streamed on'} {new Date(watchedAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</span>
                              <span>•</span>
                              <span className="text-rose-500">{isRtl ? `تمت مشاهدة ${progress}%` : `Streamed ${progress}%`}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick controls inside history log */}
                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                          <Link
                            to={`/watch/${item.type}/${item.id}`}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isRtl ? 'إعادة تشغيل' : 'Replay'}</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              removeFromHistory(item.id);
                              setToastMessage({
                                text: isRtl ? 'تم حذف المادة العارضة من السجل' : 'Removed from history logs.',
                                success: true
                              });
                              setTimeout(() => setToastMessage(null), 2500);
                            }}
                            className="p-2.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/10 text-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                            title={isRtl ? 'حذف من السجل' : 'Delete log entry'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Extreme Bottom: Log out and account termination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-6">
        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest font-mono select-none">
          <Shield className="h-4 w-4 text-rose-550 shrink-0" />
          <span>{isRtl ? 'حساب مؤمن بتشفير 256-بت' : 'Encrypted user session active'} • UID: {user.uid}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-rose-600/15 border border-rose-500/25 hover:bg-rose-600 text-rose-450 hover:text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-rose-600/5 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <LogOut className="h-4 w-4" />
          <span>{isRtl ? 'تسجيل الخروج من الحساب الحصري' : t('signOut')}</span>
        </button>
      </div>

    </div>
  );
};
