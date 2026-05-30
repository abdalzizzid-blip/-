import { MediaItem } from '../types';

export const initialMockMediaList: MediaItem[] = [
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
      { id: 'c-1', userId: 'usr-1', userName: 'Youssef Al-Ameri', rating: 5, text: 'A masterpiece! The sound design, cinematography, and acting are flawless.', timestamp: 'May 10, 2026' }
    ]
  },
  {
    id: 'm-2',
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    type: 'movie',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
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
    comments: []
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
      { id: 'srv-1', name: 'Primary Premium Link', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
    isTrending: true,
    isTopRated: true,
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
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage', 'Lena Headey'],
    creator: 'David Benioff, D.B. Weiss',
    isTrending: true,
    isTopRated: true,
    isExclusive: true,
    comments: [],
    episodes: [
      { id: 'e-1-1', title: 'Winter Is Coming', season: 1, episodeNumber: 1, duration: '1h 2m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'e-1-2', title: 'The Kingsroad', season: 1, episodeNumber: 2, duration: '56m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
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
    cast: ['كريم عبدالعزيز', 'أحمد عز', 'هند صبري'],
    director: 'مروان حامد',
    isTrending: true,
    isPopular: true,
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
    genres: ['Drama', 'Arabic'],
    trailerUrl: 'https://www.youtube.com/embed/M0_K1IubRk8',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    servers: [
      { id: 'srv-1', name: 'سيرفر جعفر الرئيسي', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    ],
    cast: ['محمد رمضان', 'مي كساب', 'زينة', 'هالة صدقي'],
    creator: 'محمد سامي',
    isTrending: true,
    isPopular: true,
    isArabic: true,
    episodes: [
      { id: 'e-g-1', title: 'الحلقة الأولى', season: 1, episodeNumber: 1, duration: '42m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'e-g-2', title: 'الحلقة الثانية', season: 1, episodeNumber: 2, duration: '40m', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  }
];
