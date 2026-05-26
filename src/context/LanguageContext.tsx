import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Layout
    home: 'Home',
    movies: 'Movies',
    tvSeries: 'TV Series',
    moviesNav: 'Movies',
    tvSeriesNav: 'TV Series',
    mostWatchedNav: 'Most Watched',
    watchlistNav: 'Watchlist',
    profileNav: 'My Account',
    search: 'Search',
    watchlist: 'Watchlist',
    profile: 'Profile',
    myProfile: 'My Profile',
    adminPanel: 'Admin Panel',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    theatreModeActive: 'Theatre Mode: Active',
    portalCopyright: 'KoraFlix Streaming Portal © 2026. Powered by TMDB & Firebase Auth.',
    welcomeBanner: 'Welcome to KoraFlix Premium – Your Home for Unlimited Movies & TV Streaming',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // Home Page
    nowShowing: 'Now Showing',
    mostWatched: 'Most Watched',
    arabicMovies: 'Arabic Movies',
    arabicSeries: 'Arabic TV Series',
    foreignMovies: 'International Movies',
    recentlyAdded: 'Recently Added',
    spotlight: 'Blockbuster Spotlight',
    streamNow: 'Stream Now',
    moreDetails: 'More Details',
    trendingWeekly: 'Trending Weekly Hits',
    popularMovies: 'Popular Movies',
    popularTv: 'Popular TV Series',
    topRated: 'Top Rated Masterpieces',
    browseAllSearch: 'Browse All Search →',
    viewAllMovies: 'View All Movies →',
    viewAllTv: 'View All TV Series →',
    tmdbTitle: 'Activate Unlimited Live Streaming & TMDB Fetching',
    tmdbDesc: 'KoraFlix is pre-populated with high-definition catalog fallback data. To browse millions of movie assets directly from the official TMDB catalog, paste your personal api key below.',
    enterKeyPlaceholder: 'Enter TMDB v3 API Key...',
    updateKey: 'Update Key',
    activate: 'Activate',
    loadingChannels: 'Loading theatre channels...',
    
    // Details Page
    movieType: 'Movie',
    tvType: 'TV Show',
    exclusiveStream: 'Exclusive Stream',
    ratingLabel: 'Rating',
    seasonsCount: 'Seasons',
    releasedLabel: 'Released',
    playWatchNow: 'PLAY & WATCH NOW',
    savedInWatchlist: 'Saved in Watchlist',
    addToWatchlist: 'Add to Watchlist',
    overview: 'Overview',
    noOverview: 'No narrative overview available for this title.',
    seasonEpisodes: 'Season Episodes',
    noEpisodes: 'No TV episodes resolved for this season.',
    officialTrailer: 'Official Trailer HD',
    userCritique: 'User Critique & Reviews',
    yourRating: 'Your Rating',
    reviewPlaceholder: 'Describe your review. What did you think of the cinematography, narrative writing, or audio score?',
    postReview: 'Post Review',
    signInToReview: 'Please Sign In to post reviews or rate this film.',
    firstReview: 'Be the first to leave review feedback!',
    featuredCast: 'Featured Cast',
    castNotListed: 'Cast information not listed.',
    productionCrew: 'Production Crew',
    director: 'Director',
    showCreator: 'Show Creator',
    genres: 'Genres',
    languages: 'Languages',
    languageAudio: 'English (Stereo 5.1 / Atmos)',
    byLabel: 'By',
    backHome: 'Back Home',
    mediaNotFound: 'Media Not Found',
    mediaNotFoundDesc: "We couldn't retrieve information about this title. Please re-check the identifier.",
    
    // Movies & TV Catalog Pages
    moviesCatalog: 'Movies Catalog',
    moviesCatalogDesc: 'Explore high-definition feature films curated globally.',
    tvSeriesHub: 'TV Series Hub',
    tvSeriesHubDesc: 'Binge-watch leading Arabic and international television dramas.',
    noMoviesFound: 'No Movies Found',
    noMoviesDesc: 'Try relaxing your filter parameters, searching for another keyword, or resetting fields.',
    noShowsFound: 'No TV Series Found',
    noShowsDesc: 'Try relaxing your filter parameters, searching for another keyword, or resetting fields.',
    sortBy: 'Sort By',
    popularRank: 'Ranks: Popularity',
    topRatedCritique: 'Critique: Top Rated',
    latestReleases: 'Date: Latest First',
    filtersLabel: 'Genre Filtering',

    // Search Page
    searchTitle: 'Instant Unified Search',
    searchDesc: 'Index through millions of entertainment assets instantly.',
    searchPlaceholder: 'Search movies, TV series, actors or genres...',
    searchResults: 'Search Results for',
    noResults: 'No media matches found. Explore alternate keywords or reset filters.',
    allGenres: 'All Genres',
    allTypes: 'All Types',
    sortRating: 'Rating: High to Low',
    sortYear: 'Year: Newest First',
    readyToDiscover: 'Discover Global Masters',
    searchNoResultsDesc: 'Analyze spelling checks or filter criteria, or query our AI assistant for tailored suggestions!',
    searchPromptDesc: 'Locate specific movie titles, series names, genres, directors or core actors instantly.',
    showAll: 'Show All Content',
    
    // Video Player & Streaming
    nowPlaying: 'Now Streaming:',
    serverLabel: 'Stream Server Node:',
    serverActive: 'Connected Svr',
    backToDetails: 'Back to Details',
    speedLabel: 'Speed multiplier',
    autoPlayNext: 'Auto-play Next',
    unsupportedStream: 'This stream is fully responsive. Enjoy modern smooth buffers.',
    notAuthorizedStream: 'Authenticating stream endpoints...',
    chooseEpisode: 'Choose Episode',
    episodePlay: 'Episode',
    
    // Profile Page
    membershipStatus: 'Membership: Premium',
    joinedLabel: 'Watchtime Tracker Active',
    savedCollection: 'Your Curated Saved Collection',
    collectionDesc: 'Your bookmarked movies and serials to stream later.',
    watchlistDesc: 'Stream your bookmarked titles anytime, we synchronize lists in cloud database.',
    watchlistEmptyDesc: 'Your collection is empty. Check our homepage spotlight displays or query our Gemini assistant for recommendations!',
    noWatchlistItems: 'Your customized list is empty. Add blockbusters to stack them here!',
    adminPrivilege: 'Authorized Administrator Access Active',
    historyLabel: 'Stream History & Progress',
    noHistoryItems: "You haven't streamed any titles yet!",
    tier: 'Subscription Tier',

    // Genres
    action: 'Action',
    adventure: 'Adventure',
    drama: 'Drama',
    'sci-fi': 'Sci-Fi',
    scifi: 'Sci-Fi',
    horror: 'Horror',
    comedy: 'Comedy',
    history: 'History',
    animation: 'Animation',
    fantasy: 'Fantasy',
    biography: 'Biography',
    mystery: 'Mystery',
    thriller: 'Thriller',
    romantic: 'Romantic',
    crime: 'Crime',
    family: 'Family',
    arabic: 'Arabic',
    all: 'All',
  },
  ar: {
    // Navigation & Layout
    home: 'الرئيسية',
    movies: 'الأفلام',
    tvSeries: 'المسلسلات',
    moviesNav: 'أفلام',
    tvSeriesNav: 'مسلسلات',
    mostWatchedNav: 'الأكثر مشاهدة',
    watchlistNav: 'المفضلة',
    profileNav: 'حسابي',
    search: 'البحث',
    watchlist: 'قائمتي',
    profile: 'الملف الشخصي',
    myProfile: 'ملفي الشخصي',
    adminPanel: 'لوحة الإشراف',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    theatreModeActive: 'وضع السينما: مفعل',
    portalCopyright: 'بوابة البث كورا فليكس © 2026. بدعم من TMDB و Firebase Auth.',
    welcomeBanner: 'مرحباً بكم في كورا فليكس بريميوم – وجهتكم الفريدة لبث غير محدود للأفلام والمسلسلات',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    
    // Home Page
    nowShowing: 'يعرض الآن',
    mostWatched: 'الأكثر مشاهدة',
    arabicMovies: 'أفلام عربية',
    arabicSeries: 'مسلسلات عربية',
    foreignMovies: 'أفلام أجنبية',
    recentlyAdded: 'أضيف حديثاً',
    spotlight: 'أضواء البطولة',
    streamNow: 'شاهد الآن',
    moreDetails: 'تفاصيل أكثر',
    trendingWeekly: 'الأكثر رواجاً هذا الأسبوع',
    popularMovies: 'أفلام رائجة',
    popularTv: 'مسلسلات رائجة',
    topRated: 'روائع التقييم العالمي',
    browseAllSearch: 'تصفح الكل ←',
    viewAllMovies: 'استكشف كل الأفلام ←',
    viewAllTv: 'استكشف كل المسلسلات ←',
    tmdbTitle: 'تفعيل جلب البيانات الحية والبث غير المحدود',
    tmdbDesc: 'تم تزويد كورا فليكس مسبقاً بقائمة غنية وممتازة. لتصفح ملايين العناوين وتحديثها فورياً من كتالوج TMDB الرسمي، الصق مفتاح API v3 الخاص بك أدناه.',
    enterKeyPlaceholder: 'أدخل مفتاح TMDB API v3...',
    updateKey: 'تحديث المفتاح',
    activate: 'تفعيل',
    loadingChannels: 'جاري تحميل العناوين السينمائية...',
    
    // Details Page
    movieType: 'فيلم سينمائي',
    tvType: 'مسلسل تلفزيوني',
    exclusiveStream: 'عرض حصري بريميوم',
    ratingLabel: 'التقييم',
    seasonsCount: 'مواسم',
    releasedLabel: 'سنة الإصدار',
    playWatchNow: 'تشغيل وبدء العرض',
    savedInWatchlist: 'محفوظ في قائمتي',
    addToWatchlist: 'أضف إلى قائمتي',
    overview: 'نبذة عن العمل',
    noOverview: 'لا يتوفر ملخص نصي لهذه المادة حالياً.',
    seasonEpisodes: 'حلقات المواسم',
    noEpisodes: 'لم يتم العثور على حلقات لهذا الموسم.',
    officialTrailer: 'العرض الدعائي الرسمي HD',
    userCritique: 'آراء وتقييمات الأعضاء',
    yourRating: 'تقييمك الشخصي',
    reviewPlaceholder: 'اكتب رأيك بالتفصيل هنا... ما هو انطباعك عن جودة الإخراج، الحبكة الدرامية، والسيناريو؟',
    postReview: 'نشر التقييم',
    signInToReview: 'يرجى تسجيل الدخول لتتمكن من كتابة رأيك وتقييم هذا العنوان.',
    firstReview: 'كن أول من يكتب رأيه حول هذا العمل ويحث الآخرين على متابعته!',
    featuredCast: 'أبرز الممثلين والطاقم',
    castNotListed: 'تفاصيل طاقم التمثيل غير مدرجة حالياً.',
    productionCrew: 'فريق العمل والإنتاج',
    director: 'مخرج العمل',
    showCreator: 'مبتكر السلسلة',
    genres: 'التصنيفات والنوع',
    languages: 'لغات العرض والأوديو',
    languageAudio: 'الإنجليزية (ستيريو 5.1 / دولبي أتموس)',
    byLabel: 'بواسطة',
    backHome: 'العودة للرئيسية',
    mediaNotFound: 'العنوان غير موجود',
    mediaNotFoundDesc: 'عذراً، لم نتمكن من العثور على المادة المطلوبة. يرجى مراجعة معرف العنوان للتحقق.',
    
    // Movies & TV Catalog Pages
    moviesCatalog: 'فهرس الأفلام اللامعة',
    moviesCatalogDesc: 'استكشف روائع الأفلام السينمائية العالمية والمحلية بجودة فائقة.',
    tvSeriesHub: 'ملتقى المسلسلات',
    tvSeriesHubDesc: 'مجموعات متكاملة من أحدث وأقوى الأعمال الدرامية العربية والعالمية.',
    noMoviesFound: 'لم يتم العثور على أفلام',
    noMoviesDesc: 'حاول تغيير معايير البحث والفرز أو تصفير مصافي التصنيف المدرجة.',
    noShowsFound: 'لم يتم العثور على مسلسلات',
    noShowsDesc: 'حاول تغيير معايير البحث والفرز أو اختيار تصنيف درامي مغاير.',
    sortBy: 'ترتيب حسب',
    popularRank: 'شهرة ورواج العروض',
    topRatedCritique: 'التقييم الأعلى عالمياً',
    latestReleases: 'تاريخ الإصدار: الأحدث أولاً',
    filtersLabel: 'تصنيف العرض',

    // Search Page
    searchTitle: 'البحث الموحد الفوري',
    searchDesc: 'تنقل وابحث عبر ملايين المواد الترفيهية الفخمة فوراً.',
    searchPlaceholder: 'ابحث عن فيلم، مسلسل، ممثل، مخرج أو تصنيف درامي...',
    searchResults: 'نتائج البحث عن',
    noResults: 'لم يتم العثور على عناوين مطابقة. حاول البحث بكلمة مغايرة أو تصفير مصافي الفرز.',
    allGenres: 'جميع التصنيفات',
    allTypes: 'جميع الأنواع',
    sortRating: 'التقييم: الأعلى أولاً',
    sortYear: 'التاريخ: الأحدث أولاً',
    readyToDiscover: 'استكشف عالم المحتوى السينمائي',
    searchNoResultsDesc: 'عذراً، لم نجد أي مادة مطابقة. يمكنك مراجعة الإملاء أو سؤال مساعد الذكاء الاصطناعي لترشيح الأفضل لك!',
    searchPromptDesc: 'ابحث فوراً بذكاء عن عناوين، أسماء مسلسلات، ممثلين، مخرجين أو تصنيفات سينمائية مفضلة.',
    showAll: 'عرض كافة المواد',
    
    // Video Player & Streaming
    nowPlaying: 'أنت تشاهد حالياً:',
    serverLabel: 'خادم البث المباشر (Node):',
    serverActive: 'خادم بث مباشر متصل',
    backToDetails: 'العودة لصفحة التفاصيل',
    speedLabel: 'سرعة تشغيل المواد',
    autoPlayNext: 'الحلقة التالية تلقائياً',
    unsupportedStream: 'موجه البث متوافق بالكامل وتلقائي لمشاهدة خالية من التقطيع.',
    notAuthorizedStream: 'جاري تأمين منفذ البث للشبكة...',
    chooseEpisode: 'اختر الحلقة',
    episodePlay: 'الحلقة',
    
    // Profile Page
    membershipStatus: 'نوع العضوية: بريميوم VIP',
    joinedLabel: 'متعقب وقت العرض نشط بالكامل',
    savedCollection: 'قائمتك المفضلة والمحفوظة للعرض لاحقاً',
    collectionDesc: 'عناوينك المحفوظة التي ترغب بمتابعتها عندما تجد الوقت المناسب.',
    watchlistDesc: 'شاهد قائمة عناوينك المفضلة والمحفوظة المتزامنة سحابياً مع حسابك في أي وقت.',
    watchlistEmptyDesc: 'قائمتك المفضلة فارغة حالياً. تصفح عروض الصفحة الرئيسية المميزة أو اسأل مساعد الذكاء الاصطناعي!',
    noWatchlistItems: 'قائمتك المخصصة فارغة حالياً. أضف بعض الروائع والمسلسلات لتظهر هنا!',
    adminPrivilege: 'صلاحيات الإشراف الإداري على المنصة مفعلة',
    historyLabel: 'سجل العرض وتقدم المتابعة',
    noHistoryItems: 'لم تقم ببدء بث أي عنوان بعد، دعنا نبدأ باختيار روائع الليلة!',
    tier: 'فئة الإشتراك',

    // Genres / التصنيفات
    action: 'أكشن',
    adventure: 'مغامرة',
    drama: 'دراما',
    'sci-fi': 'خيال علمي',
    scifi: 'خيال علمي',
    horror: 'رعب',
    comedy: 'كوميدي',
    history: 'تاريخي',
    animation: 'رسوم متحركة',
    fantasy: 'خيال / أساطير',
    biography: 'سيرة ذاتية',
    mystery: 'غموض',
    thriller: 'تشويق وإثارة',
    romantic: 'رومانسية',
    crime: 'جريمة',
    family: 'عائلي',
    arabic: 'عربي',
    all: 'الكل',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('koraflix_lang');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('koraflix_lang', lang);
    // Apply RTL/LTR dir and lang attribute globally so the body layout shifts fully
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    const custom = localStorage.getItem(`custom_translation_${lang}_${key}`);
    if (custom) return custom;
    return dictionary[lang][key] || dictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used inside a LanguageProvider');
  }
  return context;
};
