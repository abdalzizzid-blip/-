import { MediaItem } from '../types';

export const mockMediaList: MediaItem[] = [
  {
    id: 'm-1',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    type: 'movie',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    backdropUrl: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    rating: 8.9,
    releaseDate: '2024-03-01',
    duration: '2h 46m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    servers: [
      { id: 'srv-1', name: 'KoraStream Ultra (4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'srv-2', name: 'Nvidia Cloud (1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'srv-3', name: 'Backup High-speed (720p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Florence Pugh'],
    director: 'Denis Villeneuve',
    isTrending: true,
    isPopular: true,
    isExclusive: true,
    comments: [
      { id: 'c-1', userId: 'usr-1', userName: 'Youssef Al-Ameri', rating: 5, text: 'A masterpiece! The sound design, cinematography, and acting are flawless. An absolute cinematic triumph.', timestamp: 'May 10, 2026' },
      { id: 'c-2', userId: 'usr-2', userName: 'Layla Salim', rating: 4, text: 'Visually gorgeous! A bit long, but absolutely worth watching in 4K.', timestamp: 'May 12, 2026' }
    ]
  },
  {
    id: 'm-2',
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    type: 'movie',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=400&auto=format&fit=crop',
    rating: 8.7,
    releaseDate: '2014-11-07',
    duration: '2h 49m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    servers: [
      { id: 'srv-1', name: 'KoraStream Premium', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'srv-2', name: 'G-Drive CDN Fast', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    isTopRated: true,
    isPopular: true,
    comments: [
      { id: 'c-3', userId: 'usr-3', userName: 'Samer Bassam', rating: 5, text: 'Nolan is a genius. Hans Zimmer soundtrack elevates physics and family emotions into another dimension.', timestamp: 'May 04, 2026' }
    ]
  },
  {
    id: 'm-3',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    type: 'movie',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop',
    rating: 8.6,
    releaseDate: '2023-07-21',
    duration: '3h 0m',
    genres: ['Biography', 'Drama', 'History'],
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    servers: [
      { id: 'srv-1', name: 'Primary Premium Link', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 'srv-2', name: 'Secondary Mirror', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    director: 'Christopher Nolan',
    isTrending: true,
    isTopRated: true,
    comments: []
  },
  {
    id: 'm-4',
    title: 'Spider-Man: Across the Spider-Verse',
    originalTitle: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    overview: 'After reuniting with Gwen Stacy, Brooklyn\'s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    backdropUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=400&auto=format&fit=crop',
    rating: 8.8,
    releaseDate: '2023-06-02',
    duration: '2h 20m',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    trailerUrl: 'https://www.youtube.com/embed/g8zEX-8K5G0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    servers: [
      { id: 'srv-1', name: 'Direct CDN', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' }
    ],
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
    director: 'Joaquim Dos Santos',
    isPopular: true,
    comments: []
  },
  {
    id: 's-1',
    title: 'Game of Thrones',
    originalTitle: 'Game of Thrones',
    type: 'tv',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.',
    backdropUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
    rating: 9.2,
    releaseDate: '2011-04-17',
    seasonsCount: 8,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    trailerUrl: 'https://www.youtube.com/embed/KPLYYLDtMJ0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    servers: [
      { id: 'srv-1', name: 'HBO Core Svr', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'srv-2', name: 'Backup Mirror', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ],
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage', 'Lena Headey', 'Sophie Turner'],
    creator: 'David Benioff, D.B. Weiss',
    isTrending: true,
    isTopRated: true,
    isExclusive: true,
    comments: [
      { id: 'c-4', userId: 'usr-4', userName: 'KoraFanatic', rating: 5, text: 'Westeros at its absolute finest. Seasons 1-4 are peak television history!', timestamp: 'May 15, 2026' }
    ],
    episodes: [
      { id: 'e-1-1', title: 'Winter Is Coming', season: 1, episodeNumber: 1, duration: '1h 2m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'e-1-2', title: 'The Kingsroad', season: 1, episodeNumber: 2, duration: '56m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'e-1-3', title: 'Lord Snow', season: 1, episodeNumber: 3, duration: '58m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 'e-1-4', title: 'Cripples, Bastards, and Broken Things', season: 1, episodeNumber: 4, duration: '56m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'e-2-1', title: 'The North Remembers', season: 2, episodeNumber: 1, duration: '53m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  },
  {
    id: 's-2',
    title: 'The Last of Us',
    originalTitle: 'The Last of Us',
    type: 'tv',
    overview: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
    backdropUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
    rating: 8.8,
    releaseDate: '2023-01-15',
    seasonsCount: 1,
    genres: ['Action', 'Adventure', 'Drama', 'Horror'],
    trailerUrl: 'https://www.youtube.com/embed/uLtkt8BonwM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    servers: [
      { id: 'srv-1', name: 'High-Speed CDN 1', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
      { id: 'srv-2', name: 'Direct Mirror', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    cast: ['Pedro Pascal', 'Bella Ramsey', 'Gabriel Luna', 'Anna Torv'],
    creator: 'Craig Mazin, Neil Druckmann',
    isTrending: true,
    isPopular: true,
    comments: [],
    episodes: [
      { id: 'e-2-1-1', title: 'When You\'re Lost in the Darkness', season: 1, episodeNumber: 1, duration: '1h 21m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
      { id: 'e-2-1-2', title: 'Infected', season: 1, episodeNumber: 2, duration: '52m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'e-2-1-3', title: 'Long, Long Time', season: 1, episodeNumber: 3, duration: '1h 15m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ]
  },
  {
    id: 's-3',
    title: 'Wednesday',
    originalTitle: 'Wednesday',
    type: 'tv',
    overview: 'Follows Wednesday Addams\' years as a student at Nevermore Academy, as she attempts to master her emerging psychic ability, thwart a monstrous killing spree, and solve the mystery that embroiled her parents.',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop',
    rating: 8.1,
    releaseDate: '2022-11-23',
    seasonsCount: 1,
    genres: ['Comedy', 'Crime', 'Fantasy', 'Mystery'],
    trailerUrl: 'https://www.youtube.com/embed/Di310WS8zLk',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    servers: [
      { id: 'srv-1', name: 'Netflix Svr Relay', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }
    ],
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome', 'Christina Ricci'],
    creator: 'Alfred Gough, Miles Millar',
    isPopular: true,
    isTopRated: false,
    comments: [],
    episodes: [
      { id: 'e-3-1-1', title: 'Wednesday\'s Child Is Full of Woe', season: 1, episodeNumber: 1, duration: '59m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 'e-3-1-2', title: 'Woe Is the Loneliest Number', season: 1, episodeNumber: 2, duration: '48m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ]
  },
  {
    id: 'm-ar-1',
    title: 'كيرة والجن',
    originalTitle: 'Kira & El Gin',
    type: 'movie',
    overview: 'يرصد الفيلم حالة الغليان التي كانت يموج بها الشارع المصري بالتزامن مع اندلاع ثورة 1919، وهو الحدث المشترك الذي يجمع بين أحمد عبدالحي كيرة وعبدالقادر الجن ليشتراكا في النضال ضد الاحتلال الإنجليزي.',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop',
    rating: 8.5,
    releaseDate: '2022-06-30',
    duration: '2h 55m',
    genres: ['Action', 'Drama', 'History', 'Arabic'],
    trailerUrl: 'https://www.youtube.com/embed/Z0pMyq26vNo',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    servers: [
      { id: 'srv-1', name: 'خادم كورا فليكس فائق السرعة', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    cast: ['كريم عبدالعزيز', 'أحمد عز', 'هند صبري', 'سيد رجب'],
    director: 'مروان حامد',
    isTrending: true,
    isPopular: true,
    isArabic: true,
    comments: []
  },
  {
    id: 'm-ar-2',
    title: 'الفيل الأزرق ٢',
    originalTitle: 'The Blue Elephant 2',
    type: 'movie',
    overview: 'تبدأ أحداث الجزء الثاني بعد خمس سنوات من نهاية الجزء الأول، حيث يتزوج الدكتور (يحيى) من (لبنى)، ويتم استدعاءه لقسم الحالات الخطرة (غرب 8)، ويلتقي هناك بمن يتلاعب بحياته وحياة أسرته، ليستعين بحبوب الفيل الأزرق في محاولة منه للسيطرة على الأمور وحل الألغاز.',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    rating: 8.8,
    releaseDate: '2019-07-25',
    duration: '2h 10m',
    genres: ['Drama', 'Horror', 'Mystery', 'Arabic'],
    trailerUrl: 'https://www.youtube.com/embed/J7_6_9vInxU',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    servers: [
      { id: 'srv-1', name: 'خادم المشاهدة بريميوم', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ],
    cast: ['كريم عبدالعزيز', 'نيللي كريم', 'هند صبري', 'إياد نصار'],
    director: 'مروان حامد',
    isTopRated: true,
    isArabic: true,
    comments: []
  },
  {
    id: 's-ar-1',
    title: 'جعفر العمدة',
    originalTitle: 'Gafar El Omda',
    type: 'tv',
    overview: 'يدور العمل في إطار اجتماعي شعبي، حول جعفر العمدة، وهو رجل في العقد الرابع من عمره، متزوج بـ 3 سيدات، ويمتلك شركات للمقاولات ويدخل في صراعات عدة من أجل العثور على ابنه المفقود منذ ١٩ عاماً.',
    backdropUrl: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    rating: 8.4,
    releaseDate: '2023-03-23',
    seasonsCount: 1,
    genres: ['Drama', 'Action', 'Arabic'],
    trailerUrl: 'https://www.youtube.com/embed/n4p3i4I9lKk',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    servers: [
      { id: 'srv-1', name: 'خدمة البث السريعة vip', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ],
    cast: ['محمد رمضان', 'زينة', 'هالة صدقي', 'إيمان العاصي'],
    creator: 'محمد سامي',
    isTrending: true,
    isPopular: true,
    isArabic: true,
    comments: [],
    episodes: [
      { id: 'e-ar1-1', title: 'الحلقة الأولى', season: 1, episodeNumber: 1, duration: '40m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'e-ar1-2', title: 'الحلقة الثانية', season: 1, episodeNumber: 2, duration: '42m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ]
  },
  {
    id: 's-ar-2',
    title: 'الحشاشين',
    originalTitle: 'The Assassins / Al Hashashin',
    type: 'tv',
    overview: 'دور أحداث المسلسل في إطار تاريخي يعود إلى القرن الحادي عشر الميلادي، حول مؤسس طائفة الحشاشين الحسن الصباح، وعلاقته برفاقه وخوضه صراعات قوية لتثبيت دعائم دعوته الباطنية في قلعة ألموت.',
    backdropUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
    rating: 9.1,
    releaseDate: '2024-03-11',
    seasonsCount: 1,
    genres: ['Drama', 'History', 'Action', 'Arabic'],
    trailerUrl: 'https://www.youtube.com/embed/V6_yFclZ5XU',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    servers: [
      { id: 'srv-1', name: 'بث دقة فائقة FHD', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    cast: ['كريم عبدالعزيز', 'فتحي عبدالوهاب', 'ميرنا نور الدين', 'أحمد عيد'],
    creator: 'عبدالرحيم كمال / بيتر ميمي',
    isTrending: true,
    isTopRated: true,
    isArabic: true,
    comments: [],
    episodes: [
      { id: 'e-ar2-1', title: 'عهد الصداقة والعهد القديم', season: 1, episodeNumber: 1, duration: '45m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 'e-ar2-2', title: 'الدعوة السرية وتباشير الصدام', season: 1, episodeNumber: 2, duration: '45m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  }
];
