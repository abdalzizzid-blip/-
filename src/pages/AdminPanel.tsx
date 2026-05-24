import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockMediaList } from '../services/mediaData';
import { MediaItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  LayoutDashboard, 
  Film, 
  Tv, 
  Image as ImageIcon, 
  Layers, 
  Users as UsersIcon, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Check, 
  X, 
  Sliders, 
  AlertCircle, 
  Play, 
  UploadCloud, 
  Eye, 
  Users, 
  TrendingUp, 
  Compass, 
  AlertTriangle, 
  Save, 
  Sparkles, 
  Flame, 
  Calendar, 
  Lock 
} from 'lucide-react';

// Preset high quality graphics for fast poster/backdrop setup
const PRESET_GRAPHICS = [
  { id: 'g1', label: 'ولاد رزق ٣: بطل الحركة', type: 'poster', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&fit=crop' },
  { id: 'g2', label: 'الحشاشين: قلعة ألموت', type: 'backdrop', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&fit=crop' },
  { id: 'g3', label: 'مسلسلات رمضان: ألوان شعبية', type: 'poster', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&fit=crop' },
  { id: 'g4', label: 'استديو هوليوود: عتيق', type: 'backdrop', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&fit=crop' },
  { id: 'g5', label: 'الفيل الأزرق ٢: غموض عريض', type: 'poster', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&fit=crop' },
  { id: 'g6', label: 'الخيال العلمي الكوني البراق', type: 'backdrop', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&fit=crop' }
];

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { lang, t, dir } = useLanguage();
  const isRtl = lang === 'ar';

  // State managers
  const [catalog, setCatalog] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'series' | 'banners' | 'categories' | 'users' | 'analytics' | 'ai' | 'languages'>('dashboard');
  
  // Create / Edit Form States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formOriginalTitle, setFormOriginalTitle] = useState('');
  const [formType, setFormType] = useState<'movie' | 'tv'>('movie');
  const [formOverview, setFormOverview] = useState('');
  const [formReleaseDate, setFormReleaseDate] = useState('2026-05-22');
  const [formRating, setFormRating] = useState(8.5);
  const [formDuration, setFormDuration] = useState('2h 15m');
  const [formSeasonsCount, setFormSeasonsCount] = useState(1);
  const [formPosterUrl, setFormPosterUrl] = useState('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&fit=crop');
  const [formBackdropUrl, setFormBackdropUrl] = useState('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&fit=crop');
  const [formGenres, setFormGenres] = useState('Action, Drama, Arabic');
  const [formCast, setFormCast] = useState('كريم عبدالعزيز, أحمد عز');
  const [formDirector, setFormDirector] = useState('مروان حامد');
  const [formIsExclusive, setFormIsExclusive] = useState<boolean>(true);
  const [formIsTrending, setFormIsTrending] = useState<boolean>(true);
  const [formIsPopular, setFormIsPopular] = useState<boolean>(false);
  const [formVideoUrl, setFormVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');

  // Interactive Banners database representation
  const [banners, setBanners] = useState([
    { id: 'b-1', title: 'ملحمة الحشاشين الاستثنائية', subtitle: 'كريم عبدالعزيز في دور الحسن الصباح وشيوخ باطنية ألموت', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200', active: true, badge: 'رائج اليوم 🇸🇦' },
    { id: 'b-2', title: 'صقر ومكتوب: الساحل والمجهول', subtitle: 'نجم الترفيه البارز في صراع الإرادة الشعبية العنيفة', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200', active: true, badge: 'حصري وجديد' },
    { id: 'b-3', title: 'ولاد رزق ٣: القاضية النارية', subtitle: 'عودة أسود عين الصيرة في مخطط سطو فريد من نوعه', image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200', active: false, badge: 'عرض مبكر VIP' }
  ]);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200');
  const [newBannerBadge, setNewBannerBadge] = useState('حصري جديد');

  // Categories list
  const [categories, setCategories] = useState([
    { id: 'cat-1', nameAr: 'سينما عربية حصرياً', count: 4, icon: '🇸🇦', active: true },
    { id: 'cat-2', nameAr: 'مسلسلات الإثارة والغموض', count: 7, icon: '💥', active: true },
    { id: 'cat-3', nameAr: 'أفلام بطل الحركة (أكشن)', count: 9, icon: '🎬', active: true },
    { id: 'cat-4', nameAr: 'السينما العالمية المترجمة', count: 12, icon: '🌍', active: true },
    { id: 'cat-5', nameAr: 'أفلام الرعب والماورائيات', count: 3, icon: '👻', active: true }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎬');

  // Users simulated list
  const [users, setUsers] = useState([
    { uid: 'u-1', name: 'ياسر القحطاني', email: 'yasser@koraflix.com', role: 'admin', status: 'نشط', joined: '2026-01-22', badge: 'VIP بلاتيني 🇸🇦' },
    { uid: 'u-2', name: 'لينا السالم', email: 'lena.s@koraflix.com', role: 'user', status: 'نشط', joined: '2026-02-14', badge: 'مستكشف معتمد' },
    { uid: 'u-3', name: 'فهد العتيبي', email: 'fahad@gmail.com', role: 'user', status: 'موقوف مؤقتاً', joined: '2026-04-09', badge: 'عضو أساسي' },
    { uid: 'u-4', name: 'جميلة عادل', email: 'gamila@yahoo.com', role: 'user', status: 'نشط', joined: '2026-05-18', badge: 'عشاق الغوص VIP' }
  ]);
  const [newUserFeedback, setNewUserFeedback] = useState('');

  // Home Page Management Controller values
  const [heroBannerId, setHeroBannerId] = useState('b-1');
  const [announcementText, setAnnouncementText] = useState('🔥 مرحباً بكم في كورا فليكس! أضخم تحديث لعيد الفطر المبارك وأروع العروض الحصرية متوفرة الليلة بدقة 4K.');
  const [footerSignature, setFooterSignature] = useState('بوابة كورا فليكس الترفيهية الفخمة © ٢٠٢٦. جميع الحقوق محفوظة لشركة كورا ميديا م.م.');
  const [homeGridSort, setHomeGridSort] = useState<'rating' | 'release' | 'default'>('default');

  // AI Assistant Custom States
  const [aiTitle, setAiTitle] = useState(() => localStorage.getItem('ai_assistant_title') || (isRtl ? 'مساعد كورا كوفليكس' : 'KoraFlix AI Copilot'));
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('ai_assistant_model') || 'Gemini 2.5 Flash');
  const [aiWelcomeAr, setAiWelcomeAr] = useState(() => localStorage.getItem('ai_assistant_welcome_ar') || 'مرحباً بك! أنا مساعدك الشخصي الذكي في كورا فليكس المدعوم بالذكاء الاصطناعي من Google Gemini. 🤖🍿\n\nبإمكاني مساعدتك في:\n• تقديم ترشيحات أفلام ومسلسلات رائعة تناسب مزاجك الحالي.\n• سرد تفاصيل طاقم العمل وممثلي العروض.\n• إرشادك حول كيفية تفعيل مفتاح TMDB الشخصي لبث غير محدود!\n\nماذا تحب أن نشاهد ليلة اليوم؟');
  const [aiWelcomeEn, setAiWelcomeEn] = useState(() => localStorage.getItem('ai_assistant_welcome_en') || 'Hello! I am your personal KoraFlix assistant powered by Google Gemini AI. 🤖🍿\n\nI can help you:\n• Suggest amazing movies and series based on your mood.\n• List details and cast members of your chosen shows.\n• Guide you on configuring your personal TMDB key for unlimited streaming!\n\nWhat are we looking to stream tonight?');
  const [aiTone, setAiTone] = useState(() => localStorage.getItem('ai_assistant_tone') || 'creative');

  // Interactive Live Dictionary overrides list
  const [searchTransQuery, setSearchTransQuery] = useState('');
  const [translatableKeys, setTranslatableKeys] = useState([
    { key: 'home', defaultAr: 'الرئيسية', defaultEn: 'Home' },
    { key: 'movies', defaultAr: 'الأفلام', defaultEn: 'Movies' },
    { key: 'tvSeries', defaultAr: 'المسلسلات', defaultEn: 'TV Series' },
    { key: 'search', defaultAr: 'البحث', defaultEn: 'Search' },
    { key: 'watchlist', defaultAr: 'قائمتي', defaultEn: 'Watchlist' },
    { key: 'profile', defaultAr: 'الملف الشخصي', defaultEn: 'Profile' },
    { key: 'signIn', defaultAr: 'تسجيل الدخول', defaultEn: 'Sign In' },
    { key: 'signOut', defaultAr: 'تسجيل الخروج', defaultEn: 'Sign Out' },
    { key: 'spotlight', defaultAr: 'أضواء البطولة', defaultEn: 'Blockbuster Spotlight' },
    { key: 'streamNow', defaultAr: 'شاهد الآن', defaultEn: 'Stream Now' },
    { key: 'playWatchNow', defaultAr: 'تشغيل وبدء العرض', defaultEn: 'PLAY & WATCH NOW' },
    { key: 'addToWatchlist', defaultAr: 'أضف إلى قائمتي', defaultEn: 'Add to Watchlist' },
    { key: 'welcomeBanner', defaultAr: 'مرحباً بكم في كورا فليكس بريميوم – وجهتكم الفريدة لبث غير محدود للأفلام والمسلسلات', defaultEn: 'Welcome to KoraFlix Premium – Your Home for Unlimited Movies & TV Streaming' },
    { key: 'portalCopyright', defaultAr: 'بوابة البث كورا فليكس © 2026. بدعم من TMDB و Firebase Auth.', defaultEn: 'KoraFlix Streaming Portal © 2026. Powered by TMDB & Firebase Auth.' }
  ]);

  // Global Notification alert toast
  const [toastMessage, setToastMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    setCatalog([...mockMediaList]);
  }, []);

  const triggerToast = (text: string, success: boolean = true) => {
    setToastMessage({ text, success });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateOrUpdateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      triggerToast(isRtl ? 'حقل العنوان مطلوب بشكل جاد!' : 'Asset Title is strictly required!', false);
      return;
    }

    if (isEditing && editingId) {
      // Update logic
      const targetIndex = mockMediaList.findIndex(x => x.id === editingId);
      if (targetIndex > -1) {
        const updatedItem: MediaItem = {
          ...mockMediaList[targetIndex],
          title: formTitle.trim(),
          originalTitle: formOriginalTitle.trim() || formTitle.trim(),
          type: formType,
          overview: formOverview.trim(),
          releaseDate: formReleaseDate,
          rating: parseFloat(formRating.toString()) || 8.0,
          duration: formDuration,
          seasonsCount: formType === 'tv' ? parseInt(formSeasonsCount.toString()) || 1 : undefined,
          posterUrl: formPosterUrl.trim(),
          backdropUrl: formBackdropUrl.trim(),
          genres: formGenres.split(',').map(g => g.trim()),
          cast: formCast.split(',').map(c => c.trim()),
          director: formType === 'movie' ? formDirector.trim() : undefined,
          creator: formType === 'tv' ? formDirector.trim() : undefined,
          isExclusive: formIsExclusive,
          isTrending: formIsTrending,
          isPopular: formIsPopular,
          videoUrl: formVideoUrl
        };

        mockMediaList[targetIndex] = updatedItem;
        setCatalog([...mockMediaList]);
        triggerToast(isRtl ? `تم تحديث المادة "${formTitle}" وتثبيتها بنجاح ⚡` : `Successfully modified "${formTitle}"!`);
        resetForm();
      }
    } else {
      // Create code logic
      const newItem: MediaItem = {
        id: `custom-${Date.now()}`,
        title: formTitle.trim(),
        originalTitle: formOriginalTitle.trim() || formTitle.trim(),
        type: formType,
        overview: formOverview.trim(),
        releaseDate: formReleaseDate,
        rating: parseFloat(formRating.toString()) || 8.5,
        duration: formDuration,
        seasonsCount: formType === 'tv' ? parseInt(formSeasonsCount.toString()) : undefined,
        posterUrl: formPosterUrl.trim(),
        backdropUrl: formBackdropUrl.trim(),
        genres: formGenres.split(',').map(g => g.trim()),
        cast: formCast.split(',').map(c => c.trim()),
        director: formType === 'movie' ? formDirector.trim() : undefined,
        creator: formType === 'tv' ? formDirector.trim() : undefined,
        isExclusive: formIsExclusive,
        isTrending: formIsTrending,
        isPopular: formIsPopular,
        isArabic: formGenres.toLowerCase().includes('arabic') || /[\u0600-\u06FF]/.test(formTitle),
        videoUrl: formVideoUrl,
        trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
        servers: [
          { id: 'ep-1', name: 'خادم كورا الإستراتيجي المميز', url: formVideoUrl }
        ]
      };

      mockMediaList.unshift(newItem);
      setCatalog([...mockMediaList]);
      triggerToast(isRtl ? `تم نشر العمل الجديد "${formTitle}" بنجاح في المنصة! 🎉` : `Successfully published "${formTitle}"!`);
      resetForm();
    }
  };

  const handleStartEdit = (item: MediaItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormOriginalTitle(item.originalTitle || item.title);
    setFormType(item.type);
    setFormOverview(item.overview);
    setFormReleaseDate(item.releaseDate || '2026-05-22');
    setFormRating(item.rating || 8.0);
    setFormDuration(item.duration || '2h 15m');
    setFormSeasonsCount(item.seasonsCount || 1);
    setFormPosterUrl(item.posterUrl);
    setFormBackdropUrl(item.backdropUrl);
    setFormGenres(item.genres?.join(', ') || 'Action');
    setFormCast(item.cast?.join(', ') || 'Cast members');
    setFormDirector(item.director || item.creator || 'Director');
    setFormIsExclusive(!!item.isExclusive);
    setFormIsTrending(!!item.isTrending);
    setFormIsPopular(!!item.isPopular);
    setFormVideoUrl(item.videoUrl || '');
    
    // Smoothly focus/navigate to top form panel
    const element = document.getElementById('form-pinnacle');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTitle('');
    setFormOriginalTitle('');
    setFormOverview('');
    setFormIsExclusive(true);
    setFormIsTrending(true);
    setFormIsPopular(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(isRtl ? `هل أنت متأكد تماماً من رغبتك في حذف وإزالة "${name}" بشكل نهائي؟` : `Are you sure you want to delete ${name}?`)) {
      const idx = mockMediaList.findIndex(e => e.id === id);
      if (idx > -1) {
        mockMediaList.splice(idx, 1);
        setCatalog([...mockMediaList]);
        triggerToast(isRtl ? 'تم حذف العنصر بنجاح من الخوادم الرئيسية.' : 'Deleted catalog item successfully.', false);
      }
    }
  };

  const handleToggleSpotlight = (id: string) => {
    const item = mockMediaList.find(e => e.id === id);
    if (item) {
      item.isExclusive = !item.isExclusive;
      setCatalog([...mockMediaList]);
      triggerToast(isRtl ? `تحديث طابع التميز لـ "${item.title}" ✨` : 'Toggled Spotlight status.');
    }
  };

  // Add Custom Banner
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;
    const newB = {
      id: `banner-${Date.now()}`,
      title: newBannerTitle,
      subtitle: newBannerSubtitle,
      image: newBannerImage,
      active: true,
      badge: newBannerBadge
    };
    setBanners([newB, ...banners]);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    triggerToast(isRtl ? 'تمت إضافة البانر الترويجي بنجاح!' : 'Banner added!');
  };

  const handleToggleBanner = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
    triggerToast(isRtl ? 'تم تبديل حالة تنشيط البانر' : 'Toggled banner status.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newC = {
      id: `cat-${Date.now()}`,
      nameAr: newCatName.trim(),
      count: 0,
      icon: newCatIcon,
      active: true
    };
    setCategories([...categories, newC]);
    setNewCatName('');
    triggerToast(isRtl ? 'تم إدراج التصنيف الجديد وتنسيقه.' : 'Category added successfully!');
  };

  const handleToggleUserStatus = (uid: string) => {
    setUsers(users.map(u => {
      if (u.uid === uid) {
        const nextStatus = u.status === 'نشط' ? 'موقوف مؤقتاً' : 'نشط';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    triggerToast(isRtl ? 'تم تحديث حالة المستخدم بنجاح.' : 'User status updated.');
  };

  const handleUpdateHomeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Cache inside localStorage to dynamically style home announcement immediately!
    localStorage.setItem('koraflix_announcement', announcementText);
    localStorage.setItem('koraflix_footer', footerSignature);
    localStorage.setItem('koraflix_spotlight_id', heroBannerId);
    
    triggerToast(isRtl ? 'تم حفظ تعديلات الصفحة الرئيسية وتعديل الماركي!' : 'Landing Page customizations updated globally!');
  };

  const handleSaveTranslation = (key: string, arVal: string, enVal: string) => {
    localStorage.setItem(`custom_translation_ar_${key}`, arVal);
    localStorage.setItem(`custom_translation_en_${key}`, enVal);
    triggerToast(isRtl ? `تم حفظ ترجمة المفتاح "${key}" بنجاح!` : `Successfully saved translation key "${key}"!`);
  };

  const handleResetTranslation = (key: string, defaultAr: string, defaultEn: string) => {
    localStorage.removeItem(`custom_translation_ar_${key}`);
    localStorage.removeItem(`custom_translation_en_${key}`);
    triggerToast(isRtl ? `تمت إعادة تعيين "${key}" إلى القيمة الافتراضية.` : `Reset translation key "${key}" to defaults.`);
  };

  const moviesCount = catalog.filter(e => e.type === 'movie').length;
  const tvCount = catalog.filter(e => e.type === 'tv').length;
  const exclusiveCount = catalog.filter(e => e.isExclusive).length;

  if (!user || user.role !== 'admin') {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-600/10 flex items-center justify-center border border-rose-500/15 text-rose-500 animate-bounce">
          <Lock className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-rose-500">
          {isRtl ? 'صلاحيات وصول مقيدة!' : 'Access Denied / Restrictive Firewall'}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {isRtl 
            ? 'يتطلب الدخول لهذه اللوحة امتلاك رتبة "مشرف المنصة VIP". يرجى التوجه لصفحة ملفك الشخصي وعمل محاكاة للترقية لتتمكن من التدقيق وإضافة عروض.' 
            : 'You must have Admin access permissions to open this workspace. Change your account role indicator inside the Profile page.'}
        </p>
        <Link
          to="/profile"
          className="inline-block bg-rose-600 hover:bg-rose-500 px-8 py-3 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-rose-600/20"
        >
          {isRtl ? 'الملف الشخصي والترقية' : 'Go to Profile'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-8 select-none ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Toast Prompt element */}
      {toastMessage && (
        <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all animate-bounce ${
          toastMessage.success 
            ? 'bg-[#0f1d13] border-emerald-500/20 text-emerald-400' 
            : 'bg-[#200b0d] border-rose-500/20 text-rose-450'
        }`}>
          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-bold font-sans">{toastMessage.text}</span>
        </div>
      )}

      {/* Main header banner with royal design */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Shield className="h-6.5 w-6.5 text-rose-500 animate-pulse" />
            <span>{isRtl ? 'لوحة القيادة والمشرفين الكبرى 👑' : 'Cinematic Royal Administration Panel'}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {isRtl 
              ? 'بث وتحديث الأفلام والمسلسلات، التلاعب بواجهة العرض، مراقبة البث بدقة 4K والدولبي، وضبط البانرات الاستباقية لتلبية رغبات المجتمع.' 
              : 'Direct live catalog ingestion nodes, review billing users subscriptions and configure dynamic homepage carousels.'}
          </p>
        </div>

        {/* Home Announcement fast monitor display */}
        <div className="text-[10px] sm:text-xs text-amber-500 font-extrabold uppercase bg-amber-600/10 border border-amber-500/25 px-4 py-2 rounded-xl self-start md:self-auto select-none max-w-xs shrink-0 line-clamp-2">
          📢 {announcementText}
        </div>
      </div>

      {/* Main split row layout: Right sidebar (RTL aligned) & Left detailed components panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Sidebar Columns (3 cols) */}
        <div className="lg:col-span-3 bg-[#151515] border border-slate-900 p-4 rounded-3xl space-y-2.5 shadow-xl">
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-3 mb-1 block">
            {isRtl ? 'قائمة التحكم والاستكشاف' : 'Control Navigation'}
          </span>

          {[
            { id: 'dashboard' as const, label: isRtl ? 'لوحة التحكم الشاملة' : 'Global Dashboard', icon: LayoutDashboard, color: 'text-sky-500' },
            { id: 'movies' as const, label: isRtl ? 'إدارة الأفلام السينمائية' : 'Manage Feature Movies', icon: Film, color: 'text-amber-500' },
            { id: 'series' as const, label: isRtl ? 'إدارة مسلسلات الدراما' : 'Manage TV Series', icon: Tv, color: 'text-purple-500' },
            { id: 'banners' as const, label: isRtl ? 'إدارة البانرات والترويج' : 'Billboard & Promotions', icon: ImageIcon, color: 'text-rose-500' },
            { id: 'categories' as const, label: isRtl ? 'التصنيفات والأنواع' : 'Categories & Genres', icon: Layers, color: 'text-teal-500' },
            { id: 'users' as const, label: isRtl ? 'حسابات وتراخيص المستخدمين' : 'Subscriber Licenses', icon: UsersIcon, color: 'text-emerald-500' },
            { id: 'analytics' as const, label: isRtl ? 'المقاييس والإحصائيات دقة 4K' : 'Bandwidth Analytics', icon: BarChart3, color: 'text-indigo-400' },
            { id: 'ai' as const, label: isRtl ? 'مساعد الذكاء الاصطناعي' : 'Gemini AI Assistant', icon: Sparkles, color: 'text-pink-400' },
            { id: 'languages' as const, label: isRtl ? 'قاموس الترجمات والكلمات' : 'Languages & Localization', icon: Compass, color: 'text-orange-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetForm();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/15'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-[#110a18]'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : tab.color}`} />
                <span className="grow text-right">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Left Detailed Panels Content Container (9 cols) */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Quick statistics widgets boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-[#151515] border border-slate-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{isRtl ? 'إجمالي الأفلام' : 'Total Movies'}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-white">{moviesCount}</span>
                    <span className="text-[10px] font-bold text-amber-500">تم تنشيطها</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-slate-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{isRtl ? 'مسلسلات مستضافة' : 'TV Series loaded'}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-white">{tvCount}</span>
                    <span className="text-[10px] font-bold text-purple-400">{catalog.filter(e => e.type === 'tv').reduce((acc, current) => acc + (current.seasonsCount || 1), 0)} مواسم</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-slate-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{isRtl ? 'الأعمال الحصرية VIP' : 'Spotlight Exclusives'}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-rose-500">{exclusiveCount}</span>
                    <span className="text-[10px] font-bold text-slate-500">منسق يدوي</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-slate-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{isRtl ? 'المشاهدين النشطين' : 'Active Viewers'}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">1,482</span>
                    <span className="text-[10px] font-bold text-emerald-400 animate-pulse">● مباشر</span>
                  </div>
                </div>

              </div>

              {/* Managing Home Page Features Block */}
              <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-905 pb-3">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">
                    {isRtl ? 'إدارة الصفحة الرئيسية وشريط التنبيهات' : 'Customizing Hero Landing configurations'}
                  </span>
                  <Sliders className="h-4 w-4 text-slate-500" />
                </div>

                <form onSubmit={handleUpdateHomeSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Select Active Hero Banner spotlight */}
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'العرض الأساسي لغلاف الهيرو الساطع:' : 'Primary Banner spotlight backdrop:'}
                      </label>
                      <select
                        value={heroBannerId}
                        onChange={(e) => setHeroBannerId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/45 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-500 font-bold"
                      >
                        {banners.map((b) => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Choose sorting mechanism for dynamic grid cards */}
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'ترتيب فلاتر عرض الأفلام الافتراضية بالرئيسية:' : 'Default home catalog sort key:'}
                      </label>
                      <select
                        value={homeGridSort}
                        onChange={(e) => setHomeGridSort(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/45 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-300 font-bold"
                      >
                        <option value="default">{isRtl ? 'خوارزمية ذكية مخصصة' : 'Default Rank'}</option>
                        <option value="rating">{isRtl ? 'التقييم الأعلى أولاً' : 'Highest Rated First'}</option>
                        <option value="release">{isRtl ? 'سنة الإنتاج الأحدث للكتالوج' : 'Latest Release Date'}</option>
                      </select>
                    </div>

                  </div>

                  {/* Top Bar Alert Announcement */}
                  <div className="space-y-1.5 ">
                    <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block text-right">
                      {isRtl ? 'نص شريط الإعلانات العريض بالرئيسية (Marquee text):' : 'Custom Landing Banner text marquee:'}
                    </label>
                    <textarea
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/40 rounded-xl p-3.5 text-xs sm:text-sm text-white leading-relaxed resize-none h-20"
                    />
                  </div>

                  {/* Copyright and system metadata customization */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block text-right">
                      {isRtl ? 'توقيع حقوق الملكية وحاشية الموقع الدائمة:' : 'Footer copyright branding:'}
                    </label>
                    <input
                      type="text"
                      value={footerSignature}
                      onChange={(e) => setFooterSignature(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold font-sans"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-8 py-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isRtl ? 'تطبيق وإعادة تنشيط شريحة الهوم' : 'Publish Core Variables'}</span>
                    </button>
                  </div>
                </form>

              </div>

              {/* Server diagnostic logs display */}
              <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 space-y-4">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block text-right">
                  {isRtl ? 'حالة السيرفر والتحويل المباشر لملفات CDN:' : 'Primary streaming nodes health status:'}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-white block">Node 5.1 Main - Riyadh CDN</span>
                      <span className="text-[9px] text-slate-500">Bandwidth load: 42% / 10 Gbps</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-white block">Node 3.2 Mirror - Frankfurt CDN</span>
                      <span className="text-[9px] text-slate-500">Bandwidth load: 12% / 10 Gbps</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2 & TAB 3: MOVIES & SERIES MANAGEMENT (إضافة محتوى - تعديل - حذف) */}
          {(activeTab === 'movies' || activeTab === 'series') && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Form pinnacle tag index */}
              <div id="form-pinnacle" className="bg-[#151515] border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-905 pb-3">
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-rose-500 animate-bounce" />
                    <span>
                      {isEditing 
                        ? (isRtl ? `تعديل وضبط مواصفات: "${formTitle}"` : `Editing Asset specifications: ${formTitle}`)
                        : (activeTab === 'movies' ? (isRtl ? 'إدراج فيلم سينمائي جديد بالكتالوج 💥' : 'Ingest New Hollywood/Arabic Movie') : (isRtl ? 'نشر عمل درامي متكامل الفصول 🎬' : 'Publish Multi-Season TV Series'))
                      }
                    </span>
                  </h2>

                  {isEditing && (
                    <button 
                      onClick={resetForm}
                      className="text-xs font-black text-rose-400 hover:text-white bg-rose-600/10 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'إلغاء التعديل' : 'Cancel Edit'}</span>
                    </button>
                  )}
                </div>

                {/* FORM SPECIFICATIONS */}
                <form onSubmit={handleCreateOrUpdateMedia} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Visual Input A1: Arabic/Main title */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'اسم العمل بالعربية (العنوان الرئيسي):' : 'Asset Title (Arabic/Main):'}
                      </label>
                      <input
                        type="text"
                        placeholder="ولاد رزق ٣، جعفر العمدة، أو عنوان عالمي فخم..."
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold"
                        required
                      />
                    </div>

                    {/* Visual Input A2: English title */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'الاسم الأصلي/الإنجليزي للعمل:' : 'Original / English Title:'}
                      </label>
                      <input
                        type="text"
                        placeholder="Welad Rizk 3, DUNE 2..."
                        value={formOriginalTitle}
                        onChange={(e) => setFormOriginalTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold font-sans"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Format Selector block */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'نمط وهيئة البث (Type):' : 'Ingestion Format Type:'}
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-905 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-bold cursor-pointer h-11"
                      >
                        <option value="movie">{isRtl ? 'فيلم سينمائي طويل' : 'Long-play Movie'}</option>
                        <option value="tv">{isRtl ? 'مسلسل تلفزيوني مواسم' : 'Multi-Season TV Series'}</option>
                      </select>
                    </div>

                    {/* Numeric rating */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'التقييم الرقمي للمجتمع (0 إلى 10):' : 'Community Score Rating:'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formRating}
                        onChange={(e) => setFormRating(parseFloat(e.target.value) || 8.5)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-550 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-500 font-bold"
                      />
                    </div>

                    {/* Duration or season count depending on format type selector */}
                    {formType === 'movie' ? (
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                          {isRtl ? 'مدة عرض الفيلم بالكامل:' : 'Movie Duration Scale:'}
                        </label>
                        <input
                          type="text"
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-550 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-sans"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                          {isRtl ? 'عدد المواسم الكلي:' : 'Seasons Injected count:'}
                        </label>
                        <input
                          type="number"
                          value={formSeasonsCount}
                          onChange={(e) => setFormSeasonsCount(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-550 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-sans"
                        />
                      </div>
                    )}

                  </div>

                  {/* Overview Field */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'النبذة والموجز والقصة الدرامية للعمل بالكامل:' : 'Full Narrative Plot Overview Details:'}
                    </label>
                    <textarea
                      placeholder={isRtl ? 'اكتب تفاصيل القصة وأوجز للمتابعين لمحات الغلاف الفخمة لتجذب ليلتهم...' : 'Write descriptive brief of characters...'}
                      value={formOverview}
                      onChange={(e) => setFormOverview(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl p-4 text-xs sm:text-sm text-white min-h-[90px] leading-relaxed resize-none"
                      required
                    />
                  </div>

                  {/* Graphic Upload paths - Raining pictures custom URL & presets simulation (رفع صور وبوسترات) */}
                  <div className="space-y-3 pt-2">
                    <div className="border-t border-slate-905 pt-3 pb-1 flex items-center gap-1 text-rose-500 font-extrabold text-xs">
                      <UploadCloud className="h-4 w-4 shrink-0" />
                      <span>{isRtl ? 'خيارات ضبط البوسترات والخلفيات والصور:' : 'Poster and Backdrop Graphic Ingestion:'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Poster URL */}
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] sm:text-xs font-black text-slate-450 uppercase tracking-wider block">
                          {isRtl ? 'رابط بوستر العمل طولي (Poster URL):' : 'Vertical Graphic Poster Link:'}
                        </label>
                        <input
                          type="text"
                          value={formPosterUrl}
                          onChange={(e) => setFormPosterUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-300 font-mono"
                        />
                      </div>

                      {/* Backdrop URL */}
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] sm:text-xs font-black text-slate-450 uppercase tracking-wider block">
                          {isRtl ? 'رابط خلفية العمل السينمائية عريض (Backdrop URL):' : 'Horizontal Graphic Backdrop Link:'}
                        </label>
                        <input
                          type="text"
                          value={formBackdropUrl}
                          onChange={(e) => setFormBackdropUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-300 font-mono"
                        />
                      </div>

                    </div>

                    {/* Pre-arranged beautiful template presets click selection */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-right">
                        {isRtl ? '⚡ اضغط لاختيار بوسترات رائعة مسبقة التجهيز (محاكاة الرفع الفوري):' : '⚡ Single-click Graphic presets simulation:'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_GRAPHICS.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              if (p.type === 'poster') {
                                setFormPosterUrl(p.url);
                              } else {
                                setFormBackdropUrl(p.url);
                              }
                              triggerToast(isRtl ? `تم اختيار ورسم "${p.label}"` : `Applied preset graphic.`);
                            }}
                            className="bg-slate-900/60 hover:bg-slate-900 border border-slate-905 hover:border-slate-800 p-2 rounded-xl text-[10px] font-black text-slate-400 text-right flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                            <span className="truncate">{p.label} ({p.type === 'poster' ? 'بوستر' : 'خلفية'})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Genres */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'التصنيفات والأنواع (مفصولة بفاصلة):' : 'Genres list (separated by comma):'}
                      </label>
                      <input
                        type="text"
                        placeholder="Action, Sci-Fi, Horror, History, Arabic"
                        value={formGenres}
                        onChange={(e) => setFormGenres(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white"
                      />
                    </div>

                    {/* Cast list */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'طاقم العمل والنجوم (مفصول بفاصلة):' : 'Starring Cast (separated by comma):'}
                      </label>
                      <input
                        type="text"
                        placeholder="كريم عبدالعزيز, نيللي كريم, هند صبري"
                        value={formCast}
                        onChange={(e) => setFormCast(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Director or Creator */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'المخرج أو منشئ السلسلة (Director/Creator):' : 'Director / Core Creator:'}
                      </label>
                      <input
                        type="text"
                        value={formDirector}
                        onChange={(e) => setFormDirector(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white"
                      />
                    </div>

                    {/* CDN stream source */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'رابط ملف الفيديو والبث السحابي (CDN Video URL Direct):' : 'Direct CDN Multiplexer Video Link:'}
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/movie.mp4"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-emerald-400 font-mono"
                      />
                    </div>

                  </div>

                  {/* Highlights and Exclusive Checkbox controllers */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 select-none grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Exclusive 1 */}
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="formExclusive"
                        checked={formIsExclusive}
                        onChange={(e) => setFormIsExclusive(e.target.checked)}
                        className="rounded text-rose-605 focus:ring-rose-500 border-slate-800 bg-slate-950 h-4.5 w-4.5"
                      />
                      <label htmlFor="formExclusive" className="text-xs text-slate-300 font-extrabold cursor-pointer block">
                        {isRtl ? 'تمييز كعمل حصري ذهبي' : 'Exclusive VIP Tag'}
                      </label>
                    </div>

                    {/* Trending 2 */}
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="formTrending"
                        checked={formIsTrending}
                        onChange={(e) => setFormIsTrending(e.target.checked)}
                        className="rounded text-rose-605 focus:ring-rose-500 border-slate-800 bg-slate-950 h-4.5 w-4.5"
                      />
                      <label htmlFor="formTrending" className="text-xs text-slate-300 font-extrabold cursor-pointer block">
                        {isRtl ? 'تضمين بالأكثر تداولاً الليلة' : 'Trending List'}
                      </label>
                    </div>

                    {/* Popular 3 */}
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="formPopular"
                        checked={formIsPopular}
                        onChange={(e) => setFormIsPopular(e.target.checked)}
                        className="rounded text-rose-605 focus:ring-rose-500 border-slate-800 bg-slate-950 h-4.5 w-4.5"
                      />
                      <label htmlFor="formPopular" className="text-xs text-slate-300 font-extrabold cursor-pointer block">
                        {isRtl ? 'رائج حائز على المشاهدات' : 'Popular list flag'}
                      </label>
                    </div>

                  </div>

                  {/* Date specs */}
                  <div className="space-y-1 text-right max-w-xs">
                    <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'تاريخ العرض الرسمي الأول:' : 'Catalog Ingress Date:'}
                    </label>
                    <input
                      type="date"
                      value={formReleaseDate}
                      onChange={(e) => setFormReleaseDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white"
                    />
                  </div>

                  {/* Buttons submit trigger */}
                  <div className="flex gap-2 justify-end pt-2">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-slate-950 hover:bg-[#150d1d] border border-slate-900 text-slate-400 font-black text-xs px-6 py-3.5 rounded-xl cursor-pointer"
                      >
                        {isRtl ? 'تجاهل ومحايدة' : 'Cancel'}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer transition-all"
                    >
                      {isEditing ? (isRtl ? 'حفظ وتثبيت التغيرات الآن ✓' : 'Preserve Specifications') : (isRtl ? 'تأكيد نشر المادة بالرئيسية 🎉' : 'Publish Asset Now')}
                    </button>
                  </div>

                </form>

              </div>

              {/* Dynamic Table Catalog List for active Tab Format (تعديل وحذف واختيار المحتوى المميز) */}
              <div className="bg-[#151515] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-905 flex items-center justify-between bg-slate-950">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block font-sans">
                    {activeTab === 'movies' 
                      ? (isRtl ? `الأفلام المتوفرة بالخادم (${moviesCount} فيلم)` : `Registered Movies (${moviesCount} items)`)
                      : (isRtl ? `المسلسلات المتاحة للخادم (${tvCount} مسلسل)` : `Registered TV series (${tvCount} items)`)
                    }
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isRtl ? 'اضغط التعديل لملء الفورم بالبيانات تلقائياً' : 'Use Actions to edit details of database element'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y divide-slate-800">
                    <thead className="bg-[#04010a] text-slate-550 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-4">{isRtl ? 'العنوان وتاريخ النشر' : 'Title & Year'}</th>
                        <th className="px-6 py-4">{isRtl ? 'النوع والتصنيف' : 'Genres'}</th>
                        <th className="px-6 py-4">{isRtl ? 'التقييم الأصلي' : 'Rating'}</th>
                        <th className="px-6 py-4">{isRtl ? 'حالة التميز والبانر' : 'Featured Spotlight'}</th>
                        <th className="px-6 py-4 text-left">{isRtl ? 'إجراءات التحكم' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-905 text-xs text-slate-300">
                      {catalog
                        .filter(e => e.type === (activeTab === 'movies' ? 'movie' : 'tv'))
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img src={item.posterUrl} alt={item.title} className="h-10 w-7 rounded object-cover flex-shrink-0" />
                                <div>
                                  <span className="font-extrabold text-white text-xs block leading-tight">{item.title}</span>
                                  <span className="text-[9px] text-slate-500 block mt-0.5">{item.releaseDate}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-400 font-sans">{item.genres?.slice(0, 2).join(' • ')}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-amber-500 font-black">★ {item.rating}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {/* Spotlight exclusive toggle button */}
                              <button
                                onClick={() => handleToggleSpotlight(item.id)}
                                className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  item.isExclusive
                                    ? 'bg-amber-600/10 border-amber-500/20 text-amber-400'
                                    : 'bg-slate-950 border-slate-900 text-slate-600'
                                }`}
                              >
                                <Star className={`h-3.5 w-3.5 ${item.isExclusive ? 'text-amber-400 fill-amber-400' : 'text-slate-605'}`} />
                                <span>{item.isExclusive ? (isRtl ? 'عمل مميز VIP' : 'Spotlight ON') : (isRtl ? 'اعتيادي' : 'Normal')}</span>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left">
                              <div className="flex items-center gap-1.5 justify-end">
                                
                                {/* Edit */}
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-2 bg-rose-600/10 hover:bg-rose-605 text-rose-450 hover:text-white border border-rose-500/10 hover:border-transparent rounded-lg transition-all cursor-pointer"
                                  title={isRtl ? 'تعديل المعايير' : 'Modify specs'}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.title)}
                                  className="p-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                                  title={isRtl ? 'حذف وإقصاء' : 'Eject item'}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: BANNER PRODUCERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="bg-[#151515] border border-slate-900 p-6 rounded-3xl space-y-4">
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">
                  {isRtl ? 'تسجيل وإدراج غلاف إعلاني ترويجي جديد:' : 'Publish Promotion Billboard Banner:'}
                </span>

                <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">العنوان العبري / العربي للغلاف الترويجي:</label>
                    <input
                      type="text"
                      placeholder="مسلسل الهيبة: الرد العظيم"
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">النبذة والوصف الإعلاني الصغير:</label>
                    <input
                      type="text"
                      placeholder="شاهد كافة مواسم الهيبة بدقة 4K فائقة السرعة مع الترجمة"
                      value={newBannerSubtitle}
                      onChange={(e) => setNewBannerSubtitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">رابط صورة البانر (Horizontal Landscape):</label>
                    <input
                      type="text"
                      value={newBannerImage}
                      onChange={(e) => setNewBannerImage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">بادج التميز (مثل: رائج، حصري، مباشر):</label>
                    <input
                      type="text"
                      value={newBannerBadge}
                      onChange={(e) => setNewBannerBadge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-6 py-3 rounded-xl cursor-pointer"
                    >
                      إضافة البانر لقائمة التناوب
                    </button>
                  </div>
                </form>
              </div>

              {/* Banners active states check */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-[#151515] border border-slate-901 rounded-2xl overflow-hidden relative group">
                    <img src={b.image} alt={b.title} className="h-44 w-full object-cover opacity-70" />
                    <div className="absolute top-3 right-3 bg-slate-950/80 border border-rose-500/20 text-rose-400 text-[10px] font-black px-2.5 py-1 rounded">
                      {b.badge}
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{b.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{b.subtitle}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-905">
                        <span className="text-[10px] text-slate-600">ID: {b.id}</span>
                        <button
                          onClick={() => handleToggleBanner(b.id)}
                          className={`text-xs font-black px-3 py-1.5 rounded-lg border cursor-pointer ${
                            b.active
                              ? 'bg-emerald-650/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                          }`}
                        >
                          {b.active ? 'نشط بالهيرو حالياً' : 'موقف مؤقتاً'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: CATEGORIES / GENRES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="bg-[#151515] border border-slate-900 p-6 rounded-3xl space-y-4">
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">
                  {isRtl ? 'إدراج وتصنيف نوع سينمائي جديد بالصفحة الرئيسية:' : 'Publish Categories:'}
                </span>

                <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">اسم التصنيف بالكامل:</label>
                    <input
                      type="text"
                      placeholder="دراما شامية، غموض ورعب..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">رمز تعبيري (Emoji Icon):</label>
                    <input
                      type="text"
                      placeholder="💥"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3 rounded-xl cursor-pointer"
                  >
                    إضافة تصنيف فرعي جديد
                  </button>
                </form>
              </div>

              <div className="bg-[#151515] border border-slate-900 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-right divide-y divide-slate-800">
                  <thead className="bg-[#05010a] text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-6 py-4">أيقونة القسم</th>
                      <th className="px-6 py-4">اسم التصنيف بالمنصة</th>
                      <th className="px-6 py-4">إجمالي العروض المستضافة</th>
                      <th className="px-6 py-4 text-left">الحالة بالرئيسية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-905 text-xs text-slate-300">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-lg">{c.icon}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-extrabold text-white">{c.nameAr}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-amber-500 font-bold">{c.count} مادة</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded border border-emerald-500/10">نشط وتلقائي</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 6: USERS LICENSES */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="bg-[#151515] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-905 flex items-center justify-between bg-slate-950">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block font-sans">
                    المشاهدون وحسابات فك البث المتصلة ({users.length} مستخدم سجل بالخلايا)
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    تأمين تشفير النشاط 256-بت فعال
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right divide-y divide-slate-800">
                    <thead className="bg-[#04010a] text-slate-550 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-4">رقم وبيانات العضو</th>
                        <th className="px-6 py-4">الحساب الإلكتروني</th>
                        <th className="px-6 py-4">مستوى الترخيص وعلامات VIP</th>
                        <th className="px-6 py-4">الترخيص وتاريخ التسجيل</th>
                        <th className="px-6 py-4 text-left">إجراءات الحظر والتجميد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-905 text-xs text-slate-300">
                      {users.map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-black text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-white text-xs block leading-none">{u.name}</span>
                                <span className="text-[9px] text-[#2ebdcd] font-bold block mt-1">{u.badge}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-sans">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize text-purple-400 font-bold">
                            {u.role === 'admin' ? 'مشرف المنصة الكلي' : 'عضو عائلي أساسي'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-slate-500">{u.joined}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <button
                              onClick={() => handleToggleUserStatus(u.uid)}
                              className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                u.status === 'نشط'
                                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-600/10 border-rose-500/20 text-rose-400'
                              }`}
                            >
                              {u.status === 'نشط' ? 'تجميد وحظر الحساب 🚫' : 'إعادة التنشيط ✓'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-[#151515] border border-slate-900 p-5 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">إجمالي ساعات البث المشاهدة الليلة</span>
                  <span className="text-xl sm:text-2xl font-black text-white block mt-1">11,482 ساعة</span>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-1 block">زيادة بنسبة ٢٧٪ عن الأسبوع الماضي</span>
                </div>

                <div className="bg-[#151515] border border-slate-900 p-5 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">متوسط استهلاك السيرفر الأقصى</span>
                  <span className="text-xl sm:text-2xl font-black text-white block mt-1">3.1 Gbps / Peak</span>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '41%' }}></div>
                  </div>
                  <span className="text-[9px] text-[#2ebecd] mt-1 block">حالة الخوادم مستقرة وآمنة للغاية</span>
                </div>

                <div className="bg-[#151515] border border-slate-900 p-5 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">نسبة تغطية Dolby Atmos</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-500 block mt-1">٩٤.٢٪ من القائمة</span>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-[9px] text-rose-400 mt-1 block">مؤمّن بترخيص الصوت المحيطي</span>
                </div>

              </div>

              {/* Graphic representations pure visual bars */}
              <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 space-y-4">
                <span className="text-xs font-black text-white block">معدل البث المتكرر وتنزيل ملفات 4K حسب الأيام للأسبوع الحالي:</span>
                
                <div className="space-y-3.5 pt-2">
                  {[
                    { day: 'الجمعة (مباراة وعرض العيد)', progress: '94%', count: '١٤,٨٩٠ مشاهدة' },
                    { day: 'الخميس (السهر ومتابعة الحلقات)', progress: '81%', count: '١٢,٤١١ مشاهدة' },
                    { day: 'الأربعاء (ترفيه عائلي)', progress: '64%', count: '٩,٤٣٢ مشاهدة' },
                    { day: 'الثلاثاء (أفلام خفيفة)', progress: '45%', count: '٦,٢١٢ مشاهدة' },
                    { day: 'الأحد (بداية بث جديدة)', progress: '58%', count: '٨,١٢٠ مشاهدة' }
                  ].map((d, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-black">
                        <span className="text-slate-400">{d.day}</span>
                        <span className="text-rose-500">{d.count}</span>
                      </div>
                      <div className="h-3 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden">
                        <div className="h-full bg-gradient-to-l from-rose-600 to-amber-500 rounded-lg" style={{ width: d.progress }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}


          {/* TAB 8: GEMINI AI COPILOT */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in text-right">
              <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
                    <span>إعدادات وتخصيص مساعد الذكاء الاصطناعي (Gemini Workspace)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ضبط وتوليف سلوك ووجهة روبوت المحادثة بالذكاء الاصطناعي لتغيير ترحيبه، نوع التفكير، ومود الردود الفورية للعملاء.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem('ai_assistant_title', aiTitle);
                  localStorage.setItem('ai_assistant_model', aiModel);
                  localStorage.setItem('ai_assistant_welcome_ar', aiWelcomeAr);
                  localStorage.setItem('ai_assistant_welcome_en', aiWelcomeEn);
                  localStorage.setItem('ai_assistant_tone', aiTone);
                  triggerToast(isRtl ? 'تم تحديث مصفوفة الذكاء الاصطناعي لـ Gemini بنجاح! 🤖' : 'Successfully configured AI Matrix!');
                }} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bot Title Override */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 block">اسم المساعد الافتراضي (Assistant Label):</label>
                      <input
                        type="text"
                        value={aiTitle}
                        onChange={(e) => setAiTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl px-4 py-3 text-xs text-white font-bold"
                        required
                      />
                    </div>

                    {/* Gemini Core Model Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 block">مرشح ونموذج الذكاء الاصطناعي الأساسي:</label>
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-550 rounded-xl px-4 py-3 text-xs text-amber-500 font-bold cursor-pointer h-11"
                      >
                        <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (سرعة بث فائقة وآني)</option>
                        <option value="Gemini 2.5 Pro">Gemini 2.5 Pro (تحليل درامي ونقد معقد)</option>
                        <option value="Gemini 1.5 Ultra">Gemini 1.5 Ultra (فلسفة المشاهدة الكونية)</option>
                      </select>
                    </div>
                  </div>

                  {/* AI response tone / temperature mood */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 block">مود الذكاء وانطباع الإجابة (Tone Character):</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-550 rounded-xl px-4 py-3 text-xs text-slate-300 font-bold cursor-pointer h-11"
                    >
                      <option value="creative">🎭 شاعر وفنان (ترشيحات عاطفية وسرد انسيابي مبهج)</option>
                      <option value="academic">📚 ناقد أكاديمي حاد (يركز على تفاصيل الإخراج وحركات الكاميرا والجدل الفني)</option>
                      <option value="brief">⏱️ موجز عملي (إجابات سريعة، نقاط واضحة، تفاصيل فورية)</option>
                      <option value="slang">🌴 بنبرة محلية ودية (أسلوب بسيط، تعليق مرح وفكاهي شبيه بجمهور السينما المحلي)</option>
                    </select>
                  </div>

                  {/* Welcome Greeting AR message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 block">رسالة الترحيب التلقائية بالعربية (Welcome text - AR):</label>
                    <textarea
                      value={aiWelcomeAr}
                      onChange={(e) => setAiWelcomeAr(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl p-4 text-xs text-white min-h-[100px] leading-relaxed font-sans"
                      required
                    />
                  </div>

                  {/* Welcome Greeting EN message */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-slate-400 block text-right font-sans">رسالة الترحيب التلقائية بالإنجليزية (Welcome text - EN):</label>
                    <textarea
                      value={aiWelcomeEn}
                      onChange={(e) => setAiWelcomeEn(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-900 focus:outline-none focus:border-rose-500 rounded-xl p-4 text-xs text-white min-h-[100px] leading-relaxed font-sans"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-8 py-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all animate-pulse"
                    >
                      <Save className="h-4 w-4" />
                      <span>تطبيق وحفظ إعدادات الروبوت</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: LIVE DICTIONARY & L10N TRANSLATIONS OVERRIDES */}
          {activeTab === 'languages' && (
            <div className="space-y-6 animate-fade-in text-right">
              <div className="bg-[#151515] border border-slate-900 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Compass className="h-5 w-5 text-orange-500 animate-spin" />
                      <span>قاموس ومحرر لغات الموقع (Site Translation Overrides)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      قم بتغيير أي مصطلح أو عنوان قائمة بالموقع فوراً دون تعديل الشفرة المصدرية. التعديلات تظهر للزوار فور حفظها!
                    </p>
                  </div>
                  <div className="relative shrink-0 w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="ابحث عن كلمة أو مفتاح..."
                      value={searchTransQuery}
                      onChange={(e) => setSearchTransQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-orange-500/40 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/40 text-xs text-amber-550 font-extrabold flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 animate-bounce" />
                  <span>ملاحظة: اضغط "حفظ" لتطبيق القيمة على المنصة فورياً، أو "افتراضي" للرجوع للقيم الأساسية.</span>
                </div>

                <div className="border border-slate-900 rounded-2xl overflow-hidden">
                  <table className="w-full divide-y divide-slate-800 text-right">
                    <thead className="bg-[#04010a] text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-5 py-3 text-right">اسم المفتاح (Key)</th>
                        <th className="px-5 py-3 text-right">الترجمة الافتراضية</th>
                        <th className="px-5 py-3 text-right">تخصيص القيمة بالعربية (AR)</th>
                        <th className="px-5 py-3 text-right">تخصيص القيمة بالإنجليزية (EN)</th>
                        <th className="px-5 py-3 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
                      {translatableKeys
                        .filter(tk => 
                          tk.key.toLowerCase().includes(searchTransQuery.toLowerCase()) ||
                          tk.defaultAr.toLowerCase().includes(searchTransQuery.toLowerCase()) ||
                          tk.defaultEn.toLowerCase().includes(searchTransQuery.toLowerCase())
                        )
                        .map(tk => {
                          const customAr = localStorage.getItem(`custom_translation_ar_${tk.key}`) || '';
                          const customEn = localStorage.getItem(`custom_translation_en_${tk.key}`) || '';

                          return (
                            <tr key={tk.key} className="hover:bg-slate-950/20 transition-colors">
                              <td className="px-5 py-4 whitespace-nowrap font-mono text-[10px] text-rose-500 font-black">{tk.key}</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className="block text-[11px] font-bold text-white">{tk.defaultAr}</span>
                                <span className="block text-[9px] text-slate-500 italic mt-0.5">{tk.defaultEn}</span>
                              </td>
                              <td className="px-5 py-4">
                                <input
                                  type="text"
                                  placeholder={tk.defaultAr}
                                  defaultValue={customAr}
                                  id={`ar_override_${tk.key}`}
                                  className="bg-slate-950 border border-slate-900 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white font-extrabold"
                                />
                              </td>
                              <td className="px-5 py-4" dir="ltr">
                                <input
                                  type="text"
                                  placeholder={tk.defaultEn}
                                  defaultValue={customEn}
                                  id={`en_override_${tk.key}`}
                                  className="bg-slate-950 border border-slate-900 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white"
                                />
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap text-left">
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => {
                                      const arVal = (document.getElementById(`ar_override_${tk.key}`) as HTMLInputElement)?.value || '';
                                      const enVal = (document.getElementById(`en_override_${tk.key}`) as HTMLInputElement)?.value || '';
                                      handleSaveTranslation(tk.key, arVal, enVal);
                                    }}
                                    className="px-2.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] rounded-lg cursor-pointer transition-all"
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => {
                                      const arEl = document.getElementById(`ar_override_${tk.key}`) as HTMLInputElement;
                                      const enEl = document.getElementById(`en_override_${tk.key}`) as HTMLInputElement;
                                      if (arEl) arEl.value = '';
                                      if (enEl) enEl.value = '';
                                      handleResetTranslation(tk.key, tk.defaultAr, tk.defaultEn);
                                    }}
                                    className="px-2.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-500 hover:text-white font-black text-[10px] rounded-lg cursor-pointer transition-all"
                                  >
                                    افتراضي
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
