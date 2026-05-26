import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create instances
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Set up server-side memory store for news, comments, and movies to make it interactive across users!
let serverMovies = [
  {
    id: 'm1',
    titleAr: 'سيد الخواتم: رفقة الخاتم',
    titleEn: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'movie',
    descriptionAr: 'في عالم خيالي، يبدأ قزم سلام طامح رحلة خطيرة لتدمير الخاتم الأوحد الأسطوري الذي يهدد العالم بأسره بالظلام الأبدي.',
    descriptionEn: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=400&auto=format&fit=crop',
    rating: 8.8,
    releaseYear: '2001',
    duration: '2h 58m',
    genres: ['خيال', 'مغامرة', 'أكشن'],
    trailerUrl: 'https://www.youtube.com/embed/V75dMMBU2K0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    servers: [
      { id: 'srv1_1', nameAr: 'سيرفر VIP السحابي (FHD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'srv1_2', nameAr: 'سيرفر البث السريع (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'srv1_3', nameAr: 'سيرفر الاحتياط (SD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    actors: ['إليجاه وود', 'إيان ماكيلين', 'فيجو مورتينسين', 'أورلاندو بلوم'],
    director: 'بيتر جاكسون',
    isExclusive: true,
    comments: [
      { id: 'c1', userName: 'خالد السعيد', rating: 5, text: 'من أعظم أفلام الفانتازيا في التاريخ، الإخراج والموسيقى التصويرية لا مثيل لهما.', timestamp: 'قبل يومين' },
      { id: 'c2', userName: 'سارة العتيبي', rating: 4, text: 'أجواء خيالية رائعة جداً، والقصة تحبس الأنفاس طوال الوقت.', timestamp: 'قبل 4 ساعات' }
    ]
  },
  {
    id: 'm2',
    titleAr: 'بين النجوم',
    titleEn: 'Interstellar',
    type: 'movie',
    descriptionAr: 'رحلة فضائية ملحمية لإنقاذ البشرية. يسافر فريق من المستكشفين عبر ثقب دودي في محاولة لضمان بقاء البشرية في الفضاء الخارجي بعد دمار المحاصيل الأرضية.',
    descriptionEn: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=400&auto=format&fit=crop',
    rating: 8.7,
    releaseYear: '2014',
    duration: '2h 49m',
    genres: ['خيال علمي', 'دراما', 'مغامرة'],
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    servers: [
      { id: 'srv2_1', nameAr: 'سيرفر الرفع الرئيسي (Big Buck)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'srv2_2', nameAr: 'سيرفر رديف فائق السرعة', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ],
    actors: ['ماثيو ماكونهي', 'آن هاثاواي', 'جيسيكا شاستاين', 'مايكل كين'],
    director: 'كريستوفر نولان',
    isExclusive: false,
    comments: [
      { id: 'c3', userName: 'محب الفضاء', rating: 5, text: 'النهاية عبقرية، وقدم المخرج نولان عملاً علمياً دقيقاً وعاطفياً جداً.', timestamp: 'قبل 3 أيام' }
    ]
  },
  {
    id: 'm3',
    titleAr: 'الفيل الأزرق 2',
    titleEn: 'The Blue Elephant 2',
    type: 'movie',
    descriptionAr: 'تبدأ أحداث هذا الجزء بعد 5 سنوات من الجزء الأول، حيث يلتقي الدكتور يحيى بحالة نفسية جديدة في عنبر 8 غرب، تقلب حياته وحياة أسرته رأساً على عقب وتتلاعب بعقله.',
    descriptionEn: 'Five years after the events of the first part, Yahya is called to serve in division 8 west, where he meets someone who plays with his brain.',
    bannerUrl: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400&auto=format&fit=crop',
    rating: 8.3,
    releaseYear: '2019',
    duration: '2h 10m',
    genres: ['رعب', 'غموض', 'إثارة'],
    trailerUrl: 'https://www.youtube.com/embed/eorLg9tZz2I',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    servers: [
      { id: 'srv3_1', nameAr: 'سيرفر البث العربي الرئيسي', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 'srv3_2', nameAr: 'سيرفر السحاب الاحتياطي', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    actors: ['كريم عبد العزيز', 'هند صبري', 'نيللي كريم', 'إياد نصار'],
    director: 'مروان حامد',
    isExclusive: true,
    comments: [
      { id: 'c4', userName: 'منذر السينمائي', rating: 5, text: 'أفضل تتابع رعب وغموض في السينما العربية الحديثة! هند صبري تفوقت على نفسها.', timestamp: 'قبل يوم' }
    ]
  },
  {
    id: 's1',
    titleAr: 'صراع العروش',
    titleEn: 'Game of Thrones',
    type: 'series',
    descriptionAr: 'تتسابق عدة عائلات نبيلة في قارة خيالية للسيطرة على العرش الحديدي للممالك السبع، بينما يستيقظ خطر غامض وقاتل في الشمال المتجمد.',
    descriptionEn: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
    rating: 9.2,
    releaseYear: '2011-2019',
    duration: '8 مواسم',
    genres: ['خيال', 'دراما', 'أكشن'],
    trailerUrl: 'https://www.youtube.com/embed/KPLYYLDtMJ0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    servers: [
      { id: 'srvs1_1', nameAr: 'سيرفر HBO الرئيسي', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'srvs1_2', nameAr: 'سيرفر البث الرديف', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ],
    actors: ['KIT HARKINGTON', 'إميليا كلارك', 'بيتر دينكلاج', 'لينا هيدي'],
    director: 'ديفيد بينيوف',
    isExclusive: false,
    comments: [
      { id: 'c5', userName: 'بدر العلي', rating: 4, text: 'مستوى استثنائي في أول 6 مواسم، النهاية كانت متسرعة قليلاً لكن يظل أيقونة لن تتكرر.', timestamp: 'قبل أسبوع' }
    ]
  },
  {
    id: 's2',
    titleAr: 'أشياء غريبة',
    titleEn: 'Stranger Things',
    type: 'series',
    descriptionAr: 'عندما يختفي طفل صغير في ظروف غامضة من بلدة صغيرة، يكشف أصدقاؤه وعائلته وشرطة البلدة عن مؤامرة حكومية سرية وعالم موازٍ مرعب وفتاة ذات قدرات خارقة.',
    descriptionEn: 'When a young boy vanishes, a small town uncovers a mystery involving supernatural forces and secret experiments.',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop',
    rating: 8.7,
    releaseYear: '2016-الآن',
    duration: '4 مواسم',
    genres: ['خيال علمي', 'رعب', 'غموض'],
    trailerUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    servers: [
      { id: 'srvs2_1', nameAr: 'سيرفر البث الرئيسي (Netflix)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'srvs2_2', nameAr: 'سيرفر السحاب الرديف', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ],
    actors: ['ميلي بوبي براون', 'وينونا رايدر', 'ديفيد هاربر', 'فين وولفهارد'],
    director: 'الأخوة دافر',
    isExclusive: true,
    comments: []
  }
];

let serverNews = [
  {
    id: 'n1',
    title: 'الإعلان رسمياً عن بدء تصوير فيلم Dune: Part Three الشهر القادم والمخرج يعد بمفاجآت ملحمية',
    summary: 'أكد المخرج دينيس فيلنوف أن سيناريو الجزء الثالث من الملحمة الفضائية قد اكتمل بالكامل بمشاركة أبطال العمل الكبار.',
    content: 'في تصريح حماسي لعشاق الخيال العلمي والسينما العالمية، أكد المخرج العالمي دينيس فيلنوف رسمياً أن عملية تصوير الجزء الثالث المنتظر "Dune: Messiah" ستبدأ رسمياً مع بداية الشهر القادم في الأردن وإيطاليا. \n\nوأضاف فيلنوف أن هذا الجزء سيركز بشدة على نضج شخصية بول أتريدس والعواقب السياسية والدينية لاختياراته في كوكب أراكيس المثير. كما تم التأكيد على انضمام أسماء جديدة قوية لطاقم العمل، من بينها المرشحة للأوسكار فلورنس بيو والجميلة تيموثي شالاماي وزيندايا الذين سيعودون بعقود حصرية لإنتاج عمل تكلل ميزانيته بـ 250 مليون دولار كأضخم ميزانيات القرن الحالي للفانتازيا والسينما الفضائية العميقة.',
    author: 'أحمد كمال (محرر السينما العالمية)',
    date: '2026-05-20',
    category: 'اخبار_عاجلة' as const,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    likes: 342,
    views: 1250
  },
  {
    id: 'n2',
    title: 'مهرجان كان السينمائي يفتتح دورته الجديدة وسط حضور عالمي وتألق عربي لافت للأبصار',
    summary: 'انطلق أسبوع السينما الأبرز في فرنسا بمشاركة ما يزيد عن سبعة أفلاف عربية متميزة حصدت إعجاب نقاد السينما الدوليين في الليلة الأولى.',
    content: 'وسط أجواء من البهجة والبريق السينمائي العريق، انطلقت مساء الأمس فعاليات مهرجان كان السينمائي الدولي في دورته الـ79، بمشاركة نخبة من ألمع نجوم الإخراج والتمثيل حول العالم. \n\nشهد الحفل الافتتاحي حضوراً غفيراً للمخرجين والمنتجين العرب، مع مشاركة غير مسبوقة للسينما المصرية والمغربية في المسابقة الرسمية وقسم "نظرة ما". وقد عبر رئيس لجنة التحكيم عن سعادته بالتوسع الفكري والثقافي الذي تبرزه الأعمال العربية في معالجة القضايا الإنسانية المعاصرة والتحولات الاجتماعية، متوقعاً حصد جوائز رئيسية هامة هذا العام.',
    author: 'نور الهدى',
    date: '2026-05-19',
    category: 'مؤتمرات_وجوائز' as const,
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    likes: 189,
    views: 840
  },
  {
    id: 'n3',
    title: 'تسريبات حصرية من كواليس تصوير مسلسل "Stranger Things" الموسم الأخير تثير هلع وحماسة الجماهير',
    summary: 'صورة مسربة للممثلة ميلي بوبي براون تشير إلى تحول جذري ومواجهة خارقة وأخيرة في عالم المقلوب تنهي القصة التاريخية للمسلسل.',
    content: 'تداولت منصات التواصل الاجتماعي ومواقع معجبين غربية بعض الصور عالية الجودة المسربة من مواقع إنتاج وتصوير مسلسل الخيال العلمي والغموض الشهير "الأشياء الغريبة" في أتلانتا. \n\nالصور أظهرت بوضوح مواقع مدمرة تشبه بلدة هوكينز الخيالية مغطاة برماد وأشواك العالم المقلوب المظلم، مع ظهور خاص للفتاة إليفن (ميلي بوبي براون) بزي جديد حاد يوحي بمواجهة ملحمية وحاسمة لإنقاذ بلدتها. وأفاد مصدر مقرب من الأخوة دافر أن الحلقة الأخيرة ستتجاوز مدتها الساعتين والنصف كتجربة سينمائية فريدة تليق بختام رحلة استمرت عقداً كاملاً.',
    author: 'جمال شاكر',
    date: '2026-05-17',
    category: 'كواليس' as const,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    likes: 512,
    views: 2310
  }
];

// Global Website Application Settings Model
let serverSettings = {
  nameAr: 'سينما فيجن',
  nameEn: 'CinemaVision',
  taglineAr: 'منصة احترافية وعصرية لمتابعة واستعراض الأفلام والمسلسلات الحصرية، كتابة ونشر أخبار السينما أولاً بأول، مع مساعد توصيات ذكي مدعوم بـ Gemini AI.',
  taglineEn: 'A professional and modern platform for tracking and reviewing exclusive movies and series, publishing cinema news, with an intelligent recommendation assistant powered by Gemini AI.',
  logoType: 'icon', // 'icon' | 'image'
  logoIcon: 'Film',
  logoUrl: '',
  accentColor: 'gold', // 'gold' | 'crimson' | 'purple' | 'emerald'
  footerText: 'منصة سينما فيجن © 2026. كافة الحقوق محفوظة.',
  contactTelegram: 'https://t.me/yourchannel',
  contactEmail: 'info@cinemavision.com',
  allowComments: true,
  announcementText: '🔥 جديد وحصري: تم إضافة قسم "المساعد الذكي" المطور للرد على استفساراتكم السينمائية بدعم من Gemini 3.5!'
};

// Lazy-initialize Gemini SDK to prevent crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// ---------------------- API Routes ----------------------

// Get all movies
app.get('/api/movies', (req, res) => {
  res.json({ success: true, movies: serverMovies });
});

// Add comment/review to movie
app.post('/api/movies/:id/comment', (req, res) => {
  const { id } = req.params;
  const { userName, rating, text } = req.body;
  
  if (!userName || !text) {
    res.status(400).json({ success: false, message: 'الاسم والمحتوى مطلوبان' });
    return;
  }

  const movie = serverMovies.find(m => m.id === id);
  if (!movie) {
    res.status(404).json({ success: false, message: 'الفيلم غير موجود' });
    return;
  }

  if (!movie.comments) {
    movie.comments = [];
  }

  const newComment = {
    id: `c_${Date.now()}`,
    userName,
    rating: Number(rating) || 5,
    text,
    timestamp: 'الآن'
  };

  movie.comments.unshift(newComment);
  res.json({ success: true, comment: newComment, movie });
});

// Get all cinema news
app.get('/api/news', (req, res) => {
  res.json({ success: true, news: serverNews });
});

// Publish a new cinema news article
app.post('/api/news', (req, res) => {
  const { title, summary, content, author, category, imageUrl } = req.body;

  if (!title || !content || !author) {
    res.status(400).json({ success: false, message: 'العنوان، المحتوى، واسم الكاتب مطلوبة للنشر' });
    return;
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
  ];

  const selectedImage = imageUrl || defaultImages[Math.floor(Math.random() * defaultImages.length)];

  const newArticle = {
    id: `n_${Date.now()}`,
    title,
    summary: summary || (content.length > 100 ? content.substring(0, 97) + '...' : content),
    content,
    author,
    date: new Date().toISOString().split('T')[0],
    category: category || 'أخبار عاجلة',
    imageUrl: selectedImage,
    likes: 0,
    views: 1
  };

  serverNews.unshift(newArticle);
  res.json({ success: true, article: newArticle });
});

// Like a news article
app.post('/api/news/:id/like', (req, res) => {
  const { id } = req.params;
  const article = serverNews.find(a => a.id === id);
  if (!article) {
    res.status(404).json({ success: false, message: 'الخبر غير موجود' });
    return;
  }
  article.likes += 1;
  res.json({ success: true, likes: article.likes });
});

// Admin: Add new movie or series
app.post('/api/movies', (req, res) => {
  const {
    titleAr, titleEn, type, descriptionAr, descriptionEn,
    bannerUrl, posterUrl, rating, releaseYear, duration,
    genres, trailerUrl, videoUrl, servers, actors, director, isExclusive
  } = req.body;

  if (!titleAr || !titleEn || !descriptionAr) {
    res.status(400).json({ success: false, message: 'العناوين العربية والإنجليزية وقصة العمل مطلوبة' });
    return;
  }

  const defaultBanner = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop';
  const defaultPoster = 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=400&auto=format&fit=crop';

  const defaultVideo = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
  const finalServers = Array.isArray(servers) && servers.length > 0 
    ? servers 
    : [{ id: 'srv_default', nameAr: 'سيرفر البث الرئيسي الافتراضي', url: defaultVideo }];

  const newMovie = {
    id: `m_${Date.now()}`,
    titleAr,
    titleEn,
    type: type || 'movie',
    descriptionAr,
    descriptionEn: descriptionEn || '',
    bannerUrl: bannerUrl || defaultBanner,
    posterUrl: posterUrl || defaultPoster,
    rating: Number(rating) || 8.0,
    releaseYear: releaseYear || '2026',
    duration: duration || '120m',
    genres: Array.isArray(genres) ? genres : ['غموض'],
    trailerUrl: trailerUrl || 'https://www.youtube.com/embed/V75dMMBU2K0',
    videoUrl: finalServers[0].url || defaultVideo,
    servers: finalServers,
    actors: Array.isArray(actors) ? actors : ['ممثل رئيسي'],
    director: director || 'مخرج مبدع',
    isExclusive: !!isExclusive,
    comments: []
  };

  serverMovies.unshift(newMovie);
  res.json({ success: true, movie: newMovie });
});

// Admin: Delete movie or series
app.delete('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const initialCount = serverMovies.length;
  serverMovies = serverMovies.filter(m => m.id !== id);
  if (serverMovies.length === initialCount) {
    res.status(404).json({ success: false, message: 'العمل الفني غير موجود' });
    return;
  }
  res.json({ success: true, message: 'تم حذف العمل الفني بنجاح' });
});

// Admin: Toggle movie or series exclusive status
app.put('/api/movies/:id/toggle-exclusive', (req, res) => {
  const { id } = req.params;
  const movie = serverMovies.find(m => m.id === id);
  if (!movie) {
    res.status(404).json({ success: false, message: 'العمل الفني غير موجود' });
    return;
  }
  movie.isExclusive = !movie.isExclusive;
  res.json({ success: true, movie });
});

// Admin: Delete news article
app.delete('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const initialCount = serverNews.length;
  serverNews = serverNews.filter(a => a.id !== id);
  if (serverNews.length === initialCount) {
    res.status(404).json({ success: false, message: 'الخبر غير موجود' });
    return;
  }
  res.json({ success: true, message: 'تم حذف الخبر بنجاح' });
});

// Admin: Delete specific comment from a movie
app.delete('/api/movies/:movieId/comments/:commentId', (req, res) => {
  const { movieId, commentId } = req.params;
  const movie = serverMovies.find(m => m.id === movieId);
  if (!movie) {
    res.status(404).json({ success: false, message: 'العمل الفني غير موجود' });
    return;
  }

  if (!movie.comments) {
    res.status(404).json({ success: false, message: 'لا توجد تعليقات' });
    return;
  }

  const initialCount = movie.comments.length;
  movie.comments = movie.comments.filter(c => c.id !== commentId);

  if (movie.comments.length === initialCount) {
    res.status(404).json({ success: false, message: 'التعليق غير موجود' });
    return;
  }

  res.json({ success: true, message: 'تم حذف التعليق بنجاح', movie });
});

// AI Cinema Assistant Chat Endpoint using GoogleGenAI
app.post('/api/gemini/chat', async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'من فضلك أرسل سؤالاً للمساعد' });
    return;
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback with offline cinematic simulation
      const offlineAnswers = [
       "أنا المساعد الذكي للأفلام والمسلسلات. يبدو أنه لم يتم إعداد مفتاح API الخاص بـ Gemini حالياً، ولكن يسعدني إخبارك أن سلسلة أفلام 'The Lord of the Rings' الحائزة على 17 جائزة أوسكار هي من أفضل توصيات المغامرة والفانتازيا، وسلسلة 'Interstellar' لكريستوفر نولان هي وجهتك لعلم الفضاء والغموض والدراما المؤثرة! هل تود الاستفسار عن فيلم معين؟",
       "مرحباً بك! كسينما فيجن حالياً في الوضع غير المتصل لعدم تفعيل مفتاح الذكاء الاصطناعي. أنصحك بمشاهدة فيلم الخيال العلمي الرائع 'Inception' إذا كنت تفضل الحبكات المعقدة وعوالم الأحلام المتداخلة، أو المسلسل الكوري الأيقوني 'Squid Game' للإثارة الحصرية والغموض المشوق!",
       "أهلاً بك! في عالم الأفلام، يعتبر فيلم 'الفيل الأزرق 2' من أعمق أفلام الإثارة والغموض النفسي العربية. إذا كنت تبحث عن ترشيحات مخصصة، حاول كتابة ما تشعر به وسأرتب لك قائمة رائعة!"
      ];
      const randomAnswer = offlineAnswers[Math.floor(Math.random() * offlineAnswers.length)];
      res.json({ text: randomAnswer, systemOffline: true });
      return;
    }

    const systemPrompt = `أنت مساعد سينمائي ذكي محترف ومرح من ${serverSettings.nameAr} (${serverSettings.nameEn}).
مهمتك مساعدة المستخدمين العرب في اختيار أفضل الأفلام والمسلسلات، وتقديم توصيات مخصصة وحصرية ملهمة في السينما العربية والعالمية، وكتابة ملخصات شيقة، والإجابة عن تساؤلات الممثلين والجوائز بكلام منسق وجذاب ومريح بصيغة كاتب مقالات سينمائية مميز.
تأكد من الرد بلغة عربية فصحى راقية وسهلة مع استخدام علامات الترقيم وتنسيق إخراج جميل.`;

    const chatHistory = history ? history.map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })) : [];

    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'عذراً، حدث خطأ ما أثناء معالجة طلبك عبر الذكاء الاصطناعي. حاول مرة أخرى.' });
  }
});

// ------------------ Dynamic Ads Management API ------------------

let serverAds = [
  {
    id: 'ad-home-top',
    title: 'تخفيضات عيد الفطر: باقة كورا فليكس VIP بريميوم بخصم 50%',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&fit=crop',
    targetUrl: '/profile',
    position: 'top' as const,
    isActive: true,
    clicksCount: 142
  },
  {
    id: 'ad-home-middle',
    title: 'تغطية البث المباشر الكبرى: بطولة دوري أبطال أوروبا وسوبر ديربي إيطاليا ليلة اليوم بدقة 4K',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&fit=crop',
    targetUrl: '/',
    position: 'middle' as const,
    isActive: true,
    clicksCount: 89
  },
  {
    id: 'ad-details-sidebar',
    title: 'استمتع بمشاهدة سينمائية خالية من التشويش - اشترك في العضوية بلاتينيوم 💎',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&fit=crop',
    targetUrl: '/profile',
    position: 'sidebar' as const,
    isActive: true,
    clicksCount: 64
  },
  {
    id: 'ad-video-preroll',
    title: 'رعاية الشريك الرياضي الرسمي: تابع أحدث مباريات كأس العالم للأندية مباشرة وحصرياً',
    imageUrl: 'https://images.unsplash.com/photo-1542204172-e7052809a86e?q=80&w=1200&fit=crop',
    targetUrl: 'https://www.google.com',
    position: 'footer' as const, // Also serves as preroll sponsorship
    isActive: true,
    clicksCount: 215
  }
];

// Get all ads
app.get('/api/ads', (req, res) => {
  res.json({ success: true, ads: serverAds });
});

// Create new ad
app.post('/api/ads', (req, res) => {
  const { id, title, imageUrl, targetUrl, position, isActive, clicksCount } = req.body;

  if (!title || !imageUrl) {
    res.status(400).json({ success: false, message: 'العنوان وصورة الإعلان مطلوبة' });
    return;
  }

  const newAd = {
    id: id || `ad_${Date.now()}`,
    title,
    imageUrl,
    targetUrl: targetUrl || '#',
    position: position || 'top',
    isActive: isActive !== undefined ? !!isActive : true,
    clicksCount: clicksCount !== undefined ? Number(clicksCount) : 0
  };

  serverAds.push(newAd);
  res.json({ success: true, ad: newAd });
});

// Update an existing ad completely
app.put('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  const { title, imageUrl, targetUrl, position, isActive, clicksCount } = req.body;
  const adIndex = serverAds.findIndex(a => a.id === id);
  if (adIndex === -1) {
    res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    return;
  }
  
  serverAds[adIndex] = {
    ...serverAds[adIndex],
    title: title !== undefined ? title : serverAds[adIndex].title,
    imageUrl: imageUrl !== undefined ? imageUrl : serverAds[adIndex].imageUrl,
    targetUrl: targetUrl !== undefined ? targetUrl : serverAds[adIndex].targetUrl,
    position: position !== undefined ? position : serverAds[adIndex].position,
    isActive: isActive !== undefined ? !!isActive : serverAds[adIndex].isActive,
    clicksCount: clicksCount !== undefined ? Number(clicksCount) : serverAds[adIndex].clicksCount
  };
  
  res.json({ success: true, ad: serverAds[adIndex] });
});

// Toggle ad status
app.put('/api/ads/:id/toggle', (req, res) => {
  const { id } = req.params;
  const ad = serverAds.find(a => a.id === id);
  if (!ad) {
    res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    return;
  }
  ad.isActive = !ad.isActive;
  res.json({ success: true, ad });
});

// Increment click count (Analytics Event Endpoint)
app.post('/api/ads/:id/click', (req, res) => {
  const { id } = req.params;
  const ad = serverAds.find(a => a.id === id);
  if (!ad) {
    res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    return;
  }
  ad.clicksCount += 1;
  res.json({ success: true, clicksCount: ad.clicksCount });
});

// Real-Time Click Tracking Pixel Endpoint (Serves 1x1 transparent GIF)
app.get('/api/ads/:id/pixel.gif', (req, res) => {
  const { id } = req.params;
  const ad = serverAds.find(a => a.id === id);
  if (ad) {
    ad.clicksCount += 1;
  }
  
  // 1x1 transparent GIF base64 buffer
  const pixelHex = '47494638396101000100800000ffffffffffff21f90401000000002c00000000010001000002024401003b';
  const pixelBuffer = Buffer.from(pixelHex, 'hex');
  
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixelBuffer.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(pixelBuffer);
});

// Delete an ad banner
app.delete('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = serverAds.length;
  serverAds = serverAds.filter(a => a.id !== id);
  if (serverAds.length === initialLength) {
    res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    return;
  }
  res.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
});

// ------------------ App Settings API Endpoints ------------------

// Get global settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: serverSettings });
});

// Update global settings
app.put('/api/settings', (req, res) => {
  const { 
    nameAr, nameEn, taglineAr, taglineEn, logoType,
    logoIcon, logoUrl, accentColor, footerText, 
    contactTelegram, contactEmail, allowComments, announcementText 
  } = req.body;

  if (nameAr) serverSettings.nameAr = nameAr;
  if (nameEn) serverSettings.nameEn = nameEn;
  if (taglineAr !== undefined) serverSettings.taglineAr = taglineAr;
  if (taglineEn !== undefined) serverSettings.taglineEn = taglineEn;
  if (logoType) serverSettings.logoType = logoType;
  if (logoIcon) serverSettings.logoIcon = logoIcon;
  if (logoUrl !== undefined) serverSettings.logoUrl = logoUrl;
  if (accentColor) serverSettings.accentColor = accentColor;
  if (footerText !== undefined) serverSettings.footerText = footerText;
  if (contactTelegram !== undefined) serverSettings.contactTelegram = contactTelegram;
  if (contactEmail !== undefined) serverSettings.contactEmail = contactEmail;
  if (allowComments !== undefined) serverSettings.allowComments = !!allowComments;
  if (announcementText !== undefined) serverSettings.announcementText = announcementText;

  res.json({ success: true, message: 'تم حفظ إعدادات التطبيق بنجاح', settings: serverSettings });
});

// ------------------ Vite Integration Setup ------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 CinemaVision server is running happily on port ${PORT}`);
  });
}

startServer();
