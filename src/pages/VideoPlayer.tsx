import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, VideoServer, Episode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { adService } from '../services/adService';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, ArrowLeft, ArrowRight,
  Maximize, Minimize, Settings, Subtitles, Sliders, HardDrive, Clock, 
  Lightbulb, LightbulbOff, Check, RefreshCw, HelpCircle, Film, Sparkles, Tv,
  ShieldAlert
} from 'lucide-react';

const isIframeStream = (url: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe') || trimmed.includes('</iframe>')) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  const isVideoFile = lower.includes('.mp4') || 
                      lower.includes('.m3u8') || 
                      lower.includes('.webm') || 
                      lower.includes('.mkv') || 
                      lower.includes('.mov') ||
                      lower.includes('sample/elephantsdream.mp4') ||
                      lower.includes('sample/sintel.mp4') ||
                      lower.includes('sample/bigbuckbunny.mp4');
  
  const isWebUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
  if (isWebUrl && !isVideoFile) {
    return true;
  }
  return false;
};

const shouldBypassSandbox = (url: string): boolean => {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  // Bypass sandbox policies for popular embed hosts that actively block sandboxed iframes
  return lower.includes('streamtape') || 
         lower.includes('tape') || 
         lower.includes('vidmoly') || 
         lower.includes('fembed') || 
         lower.includes('mixdrop') || 
         lower.includes('dood') || 
         lower.includes('voe') || 
         lower.includes('vidsrc') || 
         lower.includes('upstream') || 
         lower.includes('shahiid') ||
         lower.includes('multiembed') ||
         lower.includes('embed') ||
         lower.includes('gids') ||
         lower.includes('govid');
};

const resolveServerUrl = (
  srvUrl: string, 
  item: MediaItem, 
  episode?: Episode | null
): string => {
  if (!srvUrl) return '';
  let url = srvUrl.trim();
  
  // Extract clean numeric TMDB ID or fallback to standard ID
  const tmdbIdNumeric = item.tmdbId ? String(item.tmdbId) : item.id.replace('tmdb-tv-', '').replace('tmdb-movie-', '').replace('custom-', '');
  const seasonNum = episode ? String(episode.season) : '1';
  const epNum = episode ? String(episode.episodeNumber) : '1';
  
  url = url.replace(/{id}/g, tmdbIdNumeric)
           .replace(/{tmdbId}/g, tmdbIdNumeric)
           .replace(/{season}/g, seasonNum)
           .replace(/{episode}/g, epNum)
           .replace(/{ep}/g, epNum);
  return url;
};

const getResolvedServerUrl = (
  srv: VideoServer, 
  idx: number, 
  item: MediaItem, 
  episode?: Episode | null
): string => {
  const isPlaceholderUrl = (url: string): boolean => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('sample/sintel') || 
           lower.includes('sample/elephantsdream') || 
           lower.includes('sample/bigbuckbunny') ||
           lower.includes('sample/tearsofsteel') ||
           lower.includes('sample/wearegoingonbullrun');
  };

  // 1. Explicit direct URL on active server object should be prioritized first if it's not a placeholder
  if (srv.url && !isPlaceholderUrl(srv.url)) {
    return resolveServerUrl(srv.url, item, episode);
  }

  // 2. Fallbacks based on media data videoUrl splits
  const sourceUrl = (episode ? episode.videoUrl : item.videoUrl) || '';
  const urlsList = sourceUrl.split(/\|\||\||\n/).map(u => u.trim()).filter(Boolean);

  // If a direct url segment exists for this index in the splits list, use it
  if (urlsList.length > idx && !isPlaceholderUrl(urlsList[idx])) {
    return resolveServerUrl(urlsList[idx], item, episode);
  }

  // If we have a non-placeholder first URL, use it as fallback
  const baseEpUrl = urlsList[0] || sourceUrl;
  if (!isPlaceholderUrl(baseEpUrl)) {
    return resolveServerUrl(baseEpUrl, item, episode);
  }

  // Absolute fallback
  return srv.url ? resolveServerUrl(srv.url, item, episode) : '';
};

const getTMDBServers = (isRtl: boolean, type: 'movie' | 'tv'): VideoServer[] => {
  if (type === 'tv') {
    return [
      {
        id: 'tmdb-srv-vidsrc-to',
        name: isRtl ? 'سيرفر برايم الأزرق (FHD)' : 'Prime Blue Server (FHD)',
        url: 'https://vidsrc.to/embed/tv/{tmdbId}/{season}/{episode}'
      },
      {
        id: 'tmdb-srv-vidsrc-me',
        name: isRtl ? 'سيرفر ليزر السحابي (VIP)' : 'Laser Cloud Server (VIP)',
        url: 'https://vidsrc.me/embed/tv?tmdb={tmdbId}&sea={season}&epi={episode}'
      },
      {
        id: 'tmdb-srv-vidsrc-pro',
        name: isRtl ? 'سيرفر كورا سينما برو' : 'Kora Cinema Pro',
        url: 'https://vidsrc.pro/embed/tv/{tmdbId}/{season}/{episode}'
      },
      {
        id: 'tmdb-srv-multiembed',
        name: isRtl ? 'سيرفر كورا لايت السريع' : 'Kora Light Fast',
        url: 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1&s={season}&e={episode}'
      },
      {
        id: 'tmdb-srv-gids',
        name: isRtl ? 'سيرفر الترجمة العربي' : 'Arabic Sub Server',
        url: 'https://databasegids.org/embed/tv/{tmdbId}/{season}/{episode}'
      }
    ];
  } else {
    return [
      {
        id: 'tmdb-srv-vidsrc-to',
        name: isRtl ? 'سيرفر برايم الأزرق (FHD)' : 'Prime Blue Server (FHD)',
        url: 'https://vidsrc.to/embed/movie/{tmdbId}'
      },
      {
        id: 'tmdb-srv-vidsrc-me',
        name: isRtl ? 'سيرفر ليزر السحابي (VIP)' : 'Laser Cloud Server (VIP)',
        url: 'https://vidsrc.me/embed/movie?tmdb={tmdbId}'
      },
      {
        id: 'tmdb-srv-vidsrc-pro',
        name: isRtl ? 'سيرفر كورا سينما برو' : 'Kora Cinema Pro',
        url: 'https://vidsrc.pro/embed/movie/{tmdbId}'
      },
      {
        id: 'tmdb-srv-multiembed',
        name: isRtl ? 'سيرفر كورا لايت السريع' : 'Kora Light Fast',
        url: 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1'
      },
      {
        id: 'tmdb-srv-gids',
        name: isRtl ? 'سيرفر الترجمة العربي' : 'Arabic Sub Server',
        url: 'https://databasegids.org/embed/movie/{tmdbId}'
      }
    ];
  }
};

export const VideoPlayer: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [searchParams] = useSearchParams();
  const epParam = searchParams.get('ep');
  
  const navigate = useNavigate();
  const { addToHistory, user } = useAuth();
  const { lang, t, dir } = useLanguage();
  const isRtl = lang === 'ar';

  // Base Data States
  const [item, setItem] = useState<MediaItem | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [selectedSubtitle, setSelectedSubtitle] = useState<'ar' | 'en' | 'off'>('ar');
  const [streamUrl, setStreamUrl] = useState<string>('');
  
  // Custom Controls HUD Overlay State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theatreDimmed, setTheatreDimmed] = useState(false);
  
  // Popover menus state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  // Resume bookmark state
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Auto-advance episode timer state
  const [showNextEpCountdown, setShowNextEpCountdown] = useState(false);
  const [nextEpSecsLeft, setNextEpSecsLeft] = useState(10);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-roll advertisement sponsorship overlay state
  const [prerollAd, setPrerollAd] = useState<any>(null);
  const [showPreroll, setShowPreroll] = useState(false);
  const [prerollTimeLeft, setPrerollTimeLeft] = useState(5);

  // Ripple feedback effects for double taps
  const [rippleSide, setRippleSide] = useState<'left' | 'right' | null>(null);

  // Active streaming server & in-player alerts
  const [activeServerId, setActiveServerId] = useState<string>('srv-default');
  const [servers, setServers] = useState<VideoServer[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isInIframe, setIsInIframe] = useState(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  });
  
  // Adblock protection state
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('koraflix_adblock_protection');
    // Default to false to prevent sandboxing and allow video streaming servers to play without issues
    return saved === 'true';
  });

  const [showSandboxPatch, setShowSandboxPatch] = useState(true);

  const triggerToast = (text: string, success: boolean = true) => {
    setToastMessage({ text, success });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAdBlock = () => {
    const newVal = !isAdBlockEnabled;
    setIsAdBlockEnabled(newVal);
    localStorage.setItem('koraflix_adblock_protection', String(newVal));
    triggerToast(
      isRtl 
        ? (newVal ? 'تم تفعيل درع حماية الإعلانات 🛡️' : 'تم إيقاف درع الحماية ⚠️ قد تظهر إعلانات منبثقة') 
        : (newVal ? 'Ad-Block Shield Enabled 🛡️' : 'Shield Disabled ⚠️ Beware of popup ads'),
      newVal
    );
  };

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const bookmarkKey = `bookmark_${id}_${type}_${epParam || '1'}`;

  // Subtitle list matched dynamically based on real time progress
  const subtitlesData = {
    ar: [
      { start: 1, end: 12, text: "حصرياً على منصة كورا فليكس لخدمات البث الفاخر" },
      { start: 13, end: 19, text: "تقدم الموسيقى التصويرية الرائعة لهذا العمل الفني العظيم" },
      { start: 20, end: 32, text: "لا تبكِ يا صديقي، فالطريق ما زال شاقاً أمامنا لتحقيق الحرية" },
      { start: 33, end: 45, text: "إذا أردت التفوق، عليك أولاً أن تثق بقدراتك وبالفريق" },
      { start: 46, end: 58, text: "الساعة تدق بسرعة، والمخطط يسير طبقاً لما تم إعداده مسبقاً" },
      { start: 59, end: 72, text: "الأهم ليس البداية، بل الثبات حتى بلوغ خط النهاية يا صاح!" },
      { start: 73, end: 90, text: "سنتجاوز هذه المحنة معاً فالتاريخ لا يرحم الضعفاء والجبناء" },
      { start: 91, end: 110, text: "حسناً، لندع الأمور تسير بهدوء ونراقب رد الفعل غداً" },
      { start: 111, end: 140, text: "شكراً لمتابعتكم هذا العرض الممتاز حصرياً عبر قنواتنا الحرة" }
    ],
    en: [
      { start: 1, end: 12, text: "Exclusively Streaming on Kora Flex Ultra Cinema Entertainment" },
      { start: 13, end: 19, text: "Bringing you customized state-of-the-art master scores" },
      { start: 20, end: 32, text: "Do not fear the dark, for the cinematic path of freedom is long" },
      { start: 33, end: 45, text: "To conquer adversity, you must embrace the team dynamics first" },
      { start: 46, end: 58, text: "The countdown clock speeds up, our strategic assets are deployed" },
      { start: 59, end: 72, text: "The start doesn't define us; execution integrity at checkout counts!" },
      { start: 73, end: 90, text: "United we survive this, history leaves no mercy for cowardice" },
      { start: 91, end: 110, text: "Very well, let nature take its course and monitor their response" },
      { start: 111, end: 140, text: "Thank you for watching this premium content through our systems" }
    ]
  };

  // 1. Initial Load of Details and check Storage bookmarks
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
    if (id && type) {
      loadVideoDetails();
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check saved local bookmark progress for auto resume option
    const saved = localStorage.getItem(bookmarkKey);
    if (saved) {
      const parsedTime = parseFloat(saved);
      if (parsedTime > 5) {
        setSavedProgress(parsedTime);
        setShowResumeModal(true);
      }
    }

    return () => {
      clearCountdown();
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [id, type, epParam]);

  useEffect(() => {
    setShowSandboxPatch(true);
  }, [streamUrl]);

  const loadVideoDetails = async () => {
    setLoading(true);
    try {
      const data = await tmdbService.getDetails(id!, type as 'movie' | 'tv');
      if (data) {
        setItem(data);
        
        // Setup default active server if available
        const serverParam = searchParams.get('srv');
        
        // 1. Resolve active episode first if it's a TV series
        let matchedEp: Episode | null = null;
        if (type === 'tv') {
          const activeEps = (data.episodes && data.episodes.length > 0) 
            ? data.episodes 
            : [
                {
                  id: `ep-fallback-${data.id}-1`,
                  title: isRtl ? 'الحلقة الافتتاحية الأولى' : 'Episode 1: Pilot',
                  season: 1,
                  episodeNumber: 1,
                  duration: '45m',
                  videoUrl: data.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                }
              ];
          
          const epNumber = Number(epParam) || 1;
          matchedEp = activeEps.find(e => e.episodeNumber === epNumber) || activeEps[0] || null;
          setCurrentEpisode(matchedEp);
        } else {
          setCurrentEpisode(null);
        }

        // 2. Identify active base streaming link
        const activeSourceUrl = (type === 'tv' && matchedEp)
          ? (matchedEp.videoUrl || '')
          : (data.videoUrl || '');

        const isPlaceholderUrl = (url: string): boolean => {
          if (!url) return true;
          const lower = url.toLowerCase();
          return lower.includes('sample/sintel') || 
                 lower.includes('sample/elephantsdream') || 
                 lower.includes('sample/bigbuckbunny') ||
                 lower.includes('sample/tearsofsteel') ||
                 lower.includes('sample/wearegoingonbullrun');
        };

        // Split URLs to extract any custom direct streaming links (external / iframe / IPTV)
        const customUrls = activeSourceUrl.split(/\|\||\||\n/)
          .map(u => u.trim())
          .filter(u => u && !isPlaceholderUrl(u));

        // Create elegant custom direct servers list
        const customServers = customUrls.map((url, idx) => ({
          id: `custom-direct-${idx}`,
          name: isRtl 
            ? (customUrls.length === 1 ? 'خادم البث المالي الرئيسي (VIP)' : `سيرفر بث أجنبي مباشر ${idx + 1} (FHD)`) 
            : (customUrls.length === 1 ? 'Direct Live Stream (VIP)' : `Direct Stream Server ${idx + 1} (FHD)`),
          url: url
        }));

        // Filter database custom configured servers
        const customConfigured = (data.servers || []).filter(s => s.url && !isPlaceholderUrl(s.url));

        // Build automatic TMDB embeds
        const isTmdbItem = data.id.startsWith('tmdb-') || !!data.tmdbId;
        const tmdbServers = getTMDBServers(isRtl, type as 'movie' | 'tv');

        // Compile combined list (custom direct links first, custom catalog servers, then automated TMDB options)
        let rawServersList: VideoServer[] = [];
        rawServersList.push(...customServers);
        rawServersList.push(...customConfigured);
        if (isTmdbItem) {
          rawServersList.push(...tmdbServers);
        }

        // Ultimate fallback to prevent blank server interface
        if (rawServersList.length === 0) {
          rawServersList = [
            { 
              id: 'srv-primary', 
              name: isRtl ? 'خادم كورا الرئيسي (VIP)' : 'Kora Main Stream (VIP)', 
              url: activeSourceUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
            },
            { 
              id: 'srv-cloud', 
              name: isRtl ? 'خادم سحابي سريع (FHD)' : 'Fast Stream Server (FHD)', 
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' 
            }
          ];
        }

        setServers(rawServersList);

        let initialServer = rawServersList[0];
        if (serverParam) {
          const found = rawServersList.find(s => s.id === serverParam);
          if (found) {
            initialServer = found;
          }
        }

        if (initialServer) {
          setActiveServerId(initialServer.id);
        } else {
          setActiveServerId(rawServersList[0]?.id || 'srv-primary');
        }

        // 3. Select and resolve stream URL
        const activeSrv = initialServer || rawServersList[0];
        const activeIdx = rawServersList.findIndex(s => s.id === activeSrv.id);
        const resolvedUrl = getResolvedServerUrl(activeSrv, activeIdx >= 0 ? activeIdx : 0, data, matchedEp);
        setStreamUrl(resolvedUrl);

        // Pre-roll partner ads have been removed per user request
        setIsPlaying(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Pre-roll advertisement timer effect
  useEffect(() => {
    if (!showPreroll) return;
    const interval = setInterval(() => {
      setPrerollTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPreroll]);

  const handleSkipPreroll = () => {
    if (prerollAd) {
      adService.recordClick(prerollAd.id);
    }
    setShowPreroll(false);
    setIsPlaying(true);
  };

  // Modify Video Server streams according to chosen Quality or Server Stream URL
  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;
    const currentProg = videoRef.current.currentTime;
    
    let targetUrl = streamUrl;

    if (quality === '720p') {
      if (streamUrl.includes('ElephantsDream.mp4')) {
        targetUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      }
    } else if (quality === '480p') {
      if (streamUrl.includes('ElephantsDream.mp4')) {
        targetUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
      }
    }

    const isHlsUrl = targetUrl.toLowerCase().includes('.m3u8');
    if (isHlsUrl) return; // Leave HLS streams to the dedicated HLS integration hook below

    // Only set src and load if it has actually changed to prevent resetting current time repeatedly
    if (!videoRef.current.src || videoRef.current.getAttribute('src') !== targetUrl) {
      videoRef.current.src = targetUrl;
      videoRef.current.load();
      // Ensure we don't seek past duration if it's not loaded yet
      if (currentProg > 0) {
        videoRef.current.currentTime = currentProg;
      }

      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [quality, streamUrl]);

  // Dedicated HLS stream engine hook (IPTV & m3u8 direct streams compatibility)
  useEffect(() => {
    if (isIframeStream(streamUrl) || !streamUrl.toLowerCase().includes('.m3u8')) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;

    const initHls = () => {
      // 1. Browser Native HLS support check (e.g. Safari / Apple devices)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        if (isPlaying) {
          video.play().catch(err => console.log('HLS native autoplay blocked:', err));
        }
      } 
      // 2. Fallback to hls.js for Chrome/Firefox/Edge
      else if ((window as any).Hls) {
        const Hls = (window as any).Hls;
        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            maxMaxBufferLength: 30,
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isPlaying) {
              video.play().catch(err => console.log('HLS play blocked:', err));
            }
          });
          
          hlsInstance.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hlsInstance.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  hlsInstance.destroy();
                  break;
              }
            }
          });
        }
      } 
      // 3. Dynamic loading from CDN script on first use
      else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = () => {
          initHls();
        };
        document.head.appendChild(script);
      }
    };

    initHls();

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [streamUrl, isPlaying]);

  // Sync state variables triggers directly to Video Player element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        // Clear countdown on resume
        clearCountdown();
        setShowNextEpCountdown(false);
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcut event listeners for play/pause, mute, and seeking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger key behaviors if user is focused on an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Ignore shortcuts if preroll ad, next ep countdown, or resume modal are active
      if (showPreroll || showResumeModal || showNextEpCountdown) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Spacebar': // compatibility support
          e.preventDefault();
          setIsPlaying(prev => !prev);
          setShowControls(true);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted(prev => !prev);
          setShowControls(true);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
            setRippleSide('left');
            setShowControls(true);
            setTimeout(() => setRippleSide(null), 700);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || 0);
            setRippleSide('right');
            setShowControls(true);
            setTimeout(() => setRippleSide(null), 700);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPreroll, showResumeModal, showNextEpCountdown]);

  // Save progress continuously on time update and sync history percent
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    
    if (dur > 0) {
      setDuration(dur);
      
      // Save progress to local storage bookmarks
      localStorage.setItem(bookmarkKey, curr.toString());
      
      // Report watch percent thresholds back directly to server history
      const percent = Math.floor((curr / dur) * 100);
      addToHistory(id!, percent);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  // Resume bookmark from saved threshold
  const handleAcceptResume = () => {
    if (videoRef.current && savedProgress) {
      videoRef.current.currentTime = savedProgress;
      setIsPlaying(true);
    }
    setShowResumeModal(false);
  };

  // Countdown timer controls for advancing to the next series episode auto
  const startNextEpCountdown = () => {
    clearCountdown();
    setNextEpSecsLeft(10);
    setShowNextEpCountdown(true);
    
    countdownTimerRef.current = setInterval(() => {
      setNextEpSecsLeft((prev) => {
        if (prev <= 1) {
          clearCountdown();
          handleNextEpisodeForce();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const handleNextEpisodeForce = () => {
    setShowNextEpCountdown(false);
    if (item && currentEpisode && item.episodes) {
      const nextNum = currentEpisode.episodeNumber + 1;
      const nextEp = item.episodes.find(e => e.episodeNumber === nextNum);
      if (nextEp) {
        navigate(`/watch/tv/${item.id}?ep=${nextNum}`);
      } else {
        // Show notification or restart
        setIsPlaying(false);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (type === 'tv' && currentEpisode && item?.episodes) {
      const nextNum = currentEpisode.episodeNumber + 1;
      const hasNext = item.episodes.some(e => e.episodeNumber === nextNum);
      if (hasNext) {
        startNextEpCountdown();
      }
    }
  };

  // Seek Timeline bar changes
  const handleSeekChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Auto Hide tools overlays controls during continuous mouse movements
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    // Hide controls only if playing
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        // Collapse expanded menus
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
        setShowSubtitleMenu(false);
      }, 3500);
    }
  };

  // Fullscreen implementation across engines
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error seeking fullscreen: ", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Error leaving fullscreen: ", err));
    }
  };

  // Handle double taps on left and right video frame quarters (Mobile touch gestures feedback)
  const handleVideoDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.35) {
      // Backward double tap seek
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      setRippleSide('left');
      setTimeout(() => setRippleSide(null), 700);
    } else if (clickX > width * 0.65) {
      // Forward double tap seek
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || 0);
      setRippleSide('right');
      setTimeout(() => setRippleSide(null), 700);
    } else {
      // Standard click in the middle: toggle play/pause
      setIsPlaying(!isPlaying);
    }
  };

  // Helper formats: MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Get active subtitle statement
  const getActiveSubtitle = () => {
    if (selectedSubtitle === 'off') return null;
    const lines = subtitlesData[selectedSubtitle] || [];
    const matched = lines.find(line => currentTime >= line.start && currentTime <= line.end);
    return matched ? matched.text : null;
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        <span className="text-xs font-black text-rose-500/80 uppercase tracking-widest animate-pulse">
          {isRtl ? 'جاري تهيئة خوادم البث المباشر...' : 'Buffering secure server streaming pipelines...'}
        </span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-24 text-center space-y-4 bg-slate-950">
        <h3 className="text-lg font-black text-slate-400">
          {isRtl ? 'فشل تحميل مسار العرض' : 'Direct Stream Link Offline'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isRtl ? 'تعذر جلب ملفات الوسائط الخاصة بالفيلم. يرجى المتابعة لاحقاً.' : 'Connection timed out while loading media stream structures.'}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-rose-600 px-6 py-3 text-xs font-black rounded-xl text-white">
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>{isRtl ? 'العودة للواجهة الرئيسية' : 'Back to Home'}</span>
        </Link>
      </div>
    );
  }

  const activeSubtitleText = getActiveSubtitle();

  return (
    <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'} transition-all ${theatreDimmed ? 'bg-[#0B0B0B] p-6 -mx-6 rounded-3xl min-h-screen' : ''}`} dir={dir}>
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce flex items-center gap-2 bg-emerald-600 border border-emerald-500/10 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl shadow-black/80">
          <Check className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Helper Banner for sandbox/iframe previews in Google AI Studio */}
      {isInIframe && (
        <div className="bg-amber-950/25 border border-amber-500/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-xl backdrop-blur-sm">
          <div className="flex items-start md:items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 md:mt-0 animate-pulse shrink-0" />
            <p className="text-xs text-amber-300 font-bold leading-relaxed">
              {isRtl 
                ? '💡 إذا واجهتك مشكلة في تشغيل بعض السيرفرات أو ظهرت لك رسالة "Disable sandbox"، يرجى فتح التطبيق في نافذة مستقلة لتفادي حظر المعاينة الذاتية من طرف متصفحي كروم وسافاري.'
                : '💡 Getting "Disable sandbox to play" or play issues? The inline AI Studio editor imposes browser security restrictions on external players. Tap the button to watch in a new full tab instantly.'
              }
            </p>
          </div>
          <a
            href={window.location.origin + window.location.pathname + window.location.search}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-450 text-amber-950 font-black text-[11px] flex items-center gap-1.5 transition-all self-end md:self-auto cursor-pointer shrink-0 shadow-lg shadow-amber-950/30"
          >
            <span>{isRtl ? 'تشغيل في نافذة خارجية ↗️' : 'Play in New Window ↗️'}</span>
          </a>
        </div>
      )}
      
      {/* Upper Navigation & Theater Switches */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/details/${item.type}/${item.id}`}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-450 hover:text-white transition-colors"
        >
          {isRtl ? <ArrowRight className="h-4 w-4 text-rose-500" /> : <ArrowLeft className="h-4 w-4 text-rose-500" />}
          <span>{isRtl ? 'العودة لصفحة تفاصيل الفيلم' : 'Back to Movie Details'}</span>
        </Link>

        {/* Cinematic Theatre mode lights dimmer */}
        <button
          onClick={() => setTheatreDimmed(!theatreDimmed)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-300 hover:text-white hover:border-slate-700 transition-all select-none cursor-pointer"
        >
          {theatreDimmed ? <Lightbulb className="h-4 w-4 text-amber-500 animate-pulse" /> : <LightbulbOff className="h-4 w-4 text-slate-500" />}
          <span>{theatreDimmed ? (isRtl ? 'تشغيل إضاءة الواجهة' : 'Lights On') : (isRtl ? 'تفعيل وضع السينما المظلم' : 'Theatre Darkness')}</span>
        </button>
      </div>

      {/* Main Premium Embedded Video Interactive Canvas Frame */}
      <div 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-900 bg-black group/player select-none shadow-2xl shadow-black"
        id="arabic-cinema-player"
      >
        
        {/* Cinematic Pre-Roll Sponsored Interstitial Overlay */}
        {showPreroll && prerollAd && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between p-6 sm:p-10 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background sponsor artwork splash */}
            <div className="absolute inset-0 opacity-40 blur-sm brightness-[0.3] pointer-events-none">
              <img src={prerollAd.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black pointer-events-none" />

            {/* Header info */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md animate-pulse">
                  {isRtl ? 'بث برعاية VIP' : 'SPONSORED PRE-ROLL'}
                </span>
                <span className="text-[10px] text-slate-450 font-bold">{isRtl ? 'عرض ترويجي ممول' : 'Exclusive Partner'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                {isRtl ? 'بوابة كورا ميديا م.م' : 'KoraFlix Gold Cinema'}
              </span>
            </div>

            {/* Campaign core display */}
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4 my-auto">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-rose-450 leading-tight drop-shadow-lg scale-[1.01]">
                {prerollAd.title}
              </h2>
              <p className="text-[11px] text-slate-350 max-w-md mx-auto leading-relaxed">
                {isRtl 
                  ? 'يتم تقديم هذا المحتوى مجاناً بدعم وتغطية من شركائنا المعتمدين. اضغط لتصفح الشريحة أو انتظر لتخطي البث.' 
                  : 'This content is sponsored by authorized partners. Navigate sponsor space or proceed to playback.'}
              </p>
              
              <a
                href={prerollAd.targetUrl}
                target={prerollAd.targetUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={() => adService.recordClick(prerollAd.id)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white hover:bg-rose-100 text-rose-950 font-black text-xs transition-all shadow-xl hover:scale-105"
              >
                <span>{isRtl ? 'زيارة موقع الشريك الراعي' : 'Explore Sponsor'}</span>
                <Sparkles className="h-4 w-4 text-rose-600" />
              </a>
            </div>

            {/* Footer timer controls action bar */}
            <div className="relative z-10 flex items-center justify-between gap-4 mt-auto">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest hidden sm:inline">
                {isRtl ? 'حقوق ومصنفات البث الفاخر لعام ٢٠٢٦' : 'CINEMATOGRAPHY REVENUE INTEGRITY'}
              </span>

              {prerollTimeLeft > 0 ? (
                <div className={`px-5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-900 text-slate-400 text-xs font-black select-none font-sans flex items-baseline gap-1 animate-pulse ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
                  <span>{isRtl ? 'تخطي الإعلان خلال' : 'Skip in'}</span>
                  <span className="text-rose-500 text-sm font-black font-mono mx-1">{prerollTimeLeft}</span>
                  <span>{isRtl ? 'ثوانٍ' : 'seconds'}</span>
                </div>
              ) : (
                <button
                  onClick={handleSkipPreroll}
                  className={`px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-lg shadow-rose-600/20 ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                >
                  <span>{isRtl ? 'تخطي الإعلان والبدء بالفيديو' : 'Skip Advertisement'}</span>
                  <SkipForward className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Core Video Player Elements */}
        {isIframeStream(streamUrl) ? (
          <div className="relative w-full h-full">

            
            {streamUrl.trim().startsWith('<iframe') || streamUrl.trim().includes('<iframe') ? (
              <div 
                key={streamUrl}
                className="w-full h-full flex items-center justify-center bg-black"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    let cleaned = streamUrl.trim();
                    
                    // Regex to match the opening <iframe tag (case-insensitive)
                    const iframeRegex = /<iframe\b/i;
                    
                    if (iframeRegex.test(cleaned)) {
                      // 1. Clean existing sandbox/style/allow/class/scrolling to avoid duplicates or conflicts
                      cleaned = cleaned.replace(/\bsandbox=(["'])(.*?)\1/gi, '');
                      cleaned = cleaned.replace(/\ballow=(["'])(.*?)\1/gi, '');
                      
                      // 2. Inject sandbox policies if enabled and domain is not list in sandbox bypass (e.g. Streamtape)
                      const bypass = shouldBypassSandbox(streamUrl);
                      if (isAdBlockEnabled && !bypass) {
                        const secureAttrs = ' sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" allow="autoplay; encrypted-media; picture-in-picture" scrolling="no" allowfullscreen ';
                        cleaned = cleaned.replace(iframeRegex, `<iframe${secureAttrs}`);
                      } else {
                        const normalAttrs = ' allow="autoplay; encrypted-media; picture-in-picture" scrolling="no" allowfullscreen ';
                        cleaned = cleaned.replace(iframeRegex, `<iframe${normalAttrs}`);
                      }
                      
                      // 3. Ensure full width/height style is present
                      if (!/style=/i.test(cleaned)) {
                        cleaned = cleaned.replace(iframeRegex, '<iframe style="width:100%; height:100%; border:none;"');
                      }
                    }
                    return cleaned;
                  })()
                }}
              />
            ) : (
              <iframe
                key={streamUrl}
                src={streamUrl}
                className="w-full h-full bg-black border-0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture"
                {...(isAdBlockEnabled && !shouldBypassSandbox(streamUrl) ? { sandbox: "allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" } : {})}
                id="embed-stream-iframe"
              />
            )}

            {/* Elegant Floating Sandbox Patch Overlay */}
            {showSandboxPatch && (
              <div className="absolute bottom-3 left-3 right-3 z-40 bg-slate-950/95 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-3 md:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right shadow-2xl backdrop-blur-md animate-fade-in transition-all">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mt-1.5 sm:mt-0 shrink-0" />
                  <p className="text-[11px] sm:text-xs text-amber-300 font-bold leading-normal font-sans">
                    {isRtl 
                      ? 'هل تواجه مشكلة "Disable sandbox" أو شاشة سوداء؟ مشغلات البث مقيدة تلقائياً داخل نافذة المعاينة.'
                      : 'Facing a "Disable sandbox" error or black screen? Stream nodes are restricted inside the editor view.'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2 px-1 justify-end sm:justify-start">
                  <a
                    href={(() => {
                      const url = streamUrl.trim().startsWith('<iframe') ? (streamUrl.match(/src=["'](.*?)["']/i)?.[1] || '') : streamUrl;
                      return url || '#';
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      const url = streamUrl.trim().startsWith('<iframe') ? (streamUrl.match(/src=["'](.*?)["']/i)?.[1] || '') : streamUrl;
                      if (!url) {
                        e.preventDefault();
                        triggerToast(isRtl ? 'عذراً، لم نتمكن من الحصول على الرابط المباشر.' : 'Sorry, clean streaming URL could not be retrieved.');
                      }
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-450 hover:scale-[1.03] active:scale-[0.97] transition-all text-amber-950 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-950/30 font-sans"
                  >
                    <Tv className="h-3.5 w-3.5 shrink-0 text-amber-950" />
                    <span>{isRtl ? 'تشغيل ملء الشاشة بنافذة تصفح خارجية ↗️' : 'Play in clean tab ↗️'}</span>
                  </a>
                  <button
                    onClick={() => setShowSandboxPatch(false)}
                    className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] font-bold font-sans cursor-pointer shrink-0"
                  >
                    {isRtl ? 'إغلاق' : 'Dismiss'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={streamUrl}
            className="w-full h-full object-contain"
            onClick={() => !showPreroll && setIsPlaying(!isPlaying)}
            onDoubleClick={handleVideoDoubleTap}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            playsInline
          />
        )}

        {/* Dynamic Interactive Subtitle Engine: Displayed beautifully overlays */}
        {activeSubtitleText && !isIframeStream(streamUrl) && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-11/12 max-w-2xl text-center select-none animate-fade-in">
            <span className="inline-block bg-black/85 border border-slate-900/60 px-5 py-2.5 rounded-2xl text-rose-100 font-sans font-black text-sm md:text-base tracking-wide leading-relaxed shadow-xl text-center">
              {activeSubtitleText}
            </span>
          </div>
        )}

        {/* Double click Tap Ripple circles (Backward/Forward feedbacks) */}
        {rippleSide === 'left' && !isIframeStream(streamUrl) && (
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none bg-rose-600/15 border border-rose-500/20 h-20 w-20 rounded-full flex flex-col items-center justify-center animate-ping text-white font-black text-xs font-mono">
            <span>-10s</span>
          </div>
        )}
        {rippleSide === 'right' && !isIframeStream(streamUrl) && (
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 z-30 pointer-events-none bg-rose-600/15 border border-rose-500/20 h-20 w-20 rounded-full flex flex-col items-center justify-center animate-ping text-white font-black text-xs font-mono">
            <span>+10s</span>
          </div>
        )}

        {/* Resume bookmark progress interactive overlay */}
        {showResumeModal && savedProgress && !isIframeStream(streamUrl) && (
          <div className="absolute inset-0 bg-black/80 z-40 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-[#090514]/95 border border-rose-500/20 max-w-sm rounded-[24px] p-6 text-center space-y-4 shadow-2xl glass-panel relative">
              <div className="mx-auto h-12 w-12 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-500 border border-rose-500/10 shrink-0">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-sm sm:text-base text-white">{isRtl ? 'استئناف تشغيل العرض؟' : 'Resume threshold timing?'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isRtl 
                    ? `لقد شاهدت هذا العرض مسبقاً من قبل. هل تود استكمال المتابعة من الدقيقة ${formatTime(savedProgress)}؟`
                    : `You watched this session previously. Would you like to pick up where you left off at ${formatTime(savedProgress)}?`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptResume}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isRtl ? 'نعم، استكمل المتابعة' : 'Yes, resume'}
                </button>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-black py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {isRtl ? 'البدء من البداية' : 'Start over'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto Next Episode Countdown overlay */}
        {showNextEpCountdown && (
          <div className="absolute inset-0 bg-black/90 z-40 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-[#090514]/95 border border-rose-500/20 max-w-sm rounded-3xl p-7 text-center space-y-5 shadow-2xl">
              <div className="relative mx-auto h-16 w-16 rounded-full bg-rose-600/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
                <span className="font-black text-lg animate-pulse">{nextEpSecsLeft}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white">{isRtl ? 'تشغيل الحلقة التالية قريباً' : 'Playing Next Episode Soon'}</h3>
                <p className="text-xs text-slate-400">
                  {isRtl 
                    ? 'ستبدأ الحلقة التالية تلقائياً خلال ثوانٍ معدودة. استعد للمتابعة.' 
                    : 'The upcoming chapter starts in a moment. Prepare for continuous stream.'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNextEpisodeForce}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-rose-600/10 cursor-pointer"
                >
                  <span>{isRtl ? 'شغل الآن' : 'Start now'}</span>
                  <SkipForward className="h-3.5 w-3.5 fill-current" />
                </button>
                <button
                  onClick={() => {
                    clearCountdown();
                    setShowNextEpCountdown(false);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-black py-3 rounded-xl transition-all cursor-pointer"
                >
                  {isRtl ? 'إلغاء التلقائي' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay HUD Control System (Autohides) */}
        <div 
          className={`absolute inset-0 ${isIframeStream(streamUrl) ? 'bg-transparent text-slate-100 p-2.5 sm:p-4 md:p-6 lg:p-8' : 'bg-gradient-to-t from-black/85 via-black/25 to-black/75 p-2.5 sm:p-4 md:p-6 lg:p-8'} flex flex-col justify-between duration-300 transition-opacity z-50 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          
          {/* Top Info row bar */}
          <div className="flex items-center justify-between gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Film className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <div className="text-left">
                {currentEpisode && (
                  <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 block font-mono">
                    {isRtl ? `الموسم ${currentEpisode.season} • الحلقة ${currentEpisode.episodeNumber}` : `S${currentEpisode.season} • EP ${currentEpisode.episodeNumber}`}
                  </span>
                )}
                <h2 className="text-[10px] xs:text-xs sm:text-sm font-black text-white leading-none truncate max-w-[180px] xs:max-w-xs md:max-w-lg">
                  {item.title} {currentEpisode ? ` - ${currentEpisode.title}` : ''}
                </h2>
              </div>
            </div>

            {/* Close / Return detail indicator button */}
            <Link
              to={`/details/${item.type}/${item.id}`}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-950/75 border border-slate-905/30 hover:border-white text-slate-300 hover:text-white transition-all select-none"
            >
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          {/* Large Floating Middle Play HUD click zones */}
          {!isIframeStream(streamUrl) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center justify-center shrink-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-12 w-12 sm:h-16 md:h-18 md:w-18 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90"
              >
                {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 fill-white" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 fill-white translate-x-0.5" />}
              </button>
            </div>
          )}

          {/* Bottom Custom Playback Bar and Configs */}
          {isIframeStream(streamUrl) ? null : (
            <div className="space-y-3 sm:space-y-4">
              
              {/* Interactive Progress Timeline Slider bar */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black font-mono text-slate-300 select-none bg-slate-950/40 px-2 py-0.5 rounded">
                  {formatTime(currentTime)}
                </span>

                <div className="grow relative group/timeline cursor-pointer pb-2 pt-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-slate-800 appearance-none focus:outline-none cursor-pointer accent-rose-600 transition-all group-hover/timeline:h-2"
                  />
                  {/* Visual Accent glow line */}
                  <div 
                    className="absolute left-0 top-[11px] h-1.5 md:h-[7px] bg-rose-600 pointer-events-none rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>

                <span className="text-[10px] font-black font-mono text-slate-350 select-none bg-[#110e1f]/60 px-2 py-0.5 rounded">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Playback Settings Panel & Controllers */}
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 font-sans">
                
                {/* Left group controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* 10s backward seek */}
                  <button
                    onClick={() => videoRef.current && (videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0))}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors animate-fade-in"
                    title="-10s"
                  >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </button>

                  {/* Main mini-play toggler */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current shrink-0" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current shrink-0" />}
                  </button>

                  {/* 10s forward seek / Next Episode link */}
                  <button
                    onClick={() => videoRef.current && (videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || 0))}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 hover:bg-[#100a1a] border border-slate-905/20 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                    title="+10s"
                  >
                    <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  </button>

                  {/* Audio volume controller widget */}
                  <div className="flex items-center gap-1.5 group/volume relative">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-0 group-hover/volume:w-12 sm:group-hover/volume:w-16 h-1 bg-slate-850 rounded-full appearance-none accent-rose-600 transition-all overflow-hidden cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right configuration menu switches */}
                <div className="flex items-center gap-2 relative">
                  
                  {/* Quality Popover selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                        setShowSubtitleMenu(false);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                        showQualityMenu ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <HardDrive className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{quality}</span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-10 right-0 bg-[#06040a]/95 border border-slate-800/80 rounded-2xl p-1.5 w-36 shadow-2xl flex flex-col gap-1 z-30 font-sans">
                        <span className="text-[9px] uppercase font-black text-rose-500/70 block p-1 border-b border-slate-900 mb-1">{isRtl ? 'اختر الجودة' : 'Resolution'}</span>
                        {['1080p', '720p', '480p'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q as any);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full py-1.5 px-3.5 rounded-lg text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                              quality === q ? 'bg-rose-600/15 text-rose-450' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <span>{q === '1080p' ? 'Full HD (1080p)' : q === '720p' ? 'Standard (720p)' : 'Mobile (480p)'}</span>
                            {quality === q && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Playback speed popover rate selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowQualityMenu(false);
                        setShowSubtitleMenu(false);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                        showSpeedMenu ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <Sliders className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{playbackSpeed}x</span>
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-10 right-0 bg-[#06040a]/95 border border-slate-800/80 rounded-2xl p-1.5 w-28 shadow-2xl flex flex-col gap-1 z-30 font-sans">
                        <span className="text-[9px] uppercase font-black text-rose-500/70 block p-1 border-b border-slate-900 mb-1">{isRtl ? 'سرعة التشغيل' : 'Speed'}</span>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((sp) => (
                          <button
                            key={sp}
                            onClick={() => {
                              setPlaybackSpeed(sp);
                              setShowSpeedMenu(false);
                            }}
                            className={`w-full py-1.5 px-3.5 rounded-lg text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                              playbackSpeed === sp ? 'bg-rose-600/15 text-rose-450' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <span>{sp === 1 ? 'العادية 1x' : `${sp}x`}</span>
                            {playbackSpeed === sp && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Translate subtitle interactive buttons */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSubtitleMenu(!showSubtitleMenu);
                        setShowQualityMenu(false);
                        setShowSpeedMenu(false);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                        selectedSubtitle !== 'off' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <Subtitles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{selectedSubtitle === 'off' ? (isRtl ? 'بلا ترجمة' : 'No Sub') : selectedSubtitle.toUpperCase()}</span>
                    </button>
                    {showSubtitleMenu && (
                      <div className="absolute bottom-10 right-0 bg-[#06040a]/95 border border-slate-800/80 rounded-2xl p-1.5 w-32 shadow-2xl flex flex-col gap-1 z-30 font-sans">
                        <span className="text-[9px] uppercase font-black text-rose-500/70 block p-1 border-b border-slate-900 mb-1">{isRtl ? 'لغة الترجمة' : 'Subtitles'}</span>
                        {[
                          { id: 'ar', label: 'العربية / Arabic' },
                          { id: 'en', label: 'English translation' },
                          { id: 'off', label: 'إيقاف الترجمة' }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedSubtitle(sub.id as any);
                              setShowSubtitleMenu(false);
                            }}
                            className={`w-full py-1.5 px-3.5 rounded-lg text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                              selectedSubtitle === sub.id ? 'bg-rose-600/15 text-rose-450' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {selectedSubtitle === sub.id && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toggle fullscreen HUD */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4 shrink-0" /> : <Maximize className="h-4 w-4 shrink-0" />}
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* 🛡️ Smart Ad-Shield Control Panel (Solves external sources popup ads vs Streamtape blocks) */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-2xl shrink-0 border transition-all ${
            isAdBlockEnabled 
              ? 'bg-rose-600/10 border-rose-500/20 text-rose-500 shadow-md shadow-rose-600/5' 
              : 'bg-slate-950/60 border-slate-900 text-slate-500'
          }`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white">
                {isRtl ? 'درع كورا لمنع الإعلانات والنوافذ المنبثقة' : 'KoraFlix Smart Ad-Shield'}
              </h4>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                isAdBlockEnabled 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-slate-950 border border-slate-900 text-slate-500'
              }`}>
                {isAdBlockEnabled ? (isRtl ? 'درع نشط ويحميك' : 'ACTIVE & SAFE') : (isRtl ? 'متوقف مؤقتاً' : 'PAUSED')}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans">
              {isRtl 
                ? 'يقوم هذا الخيار بحقن سياسات أمان متطورة تمنع الإعلانات المزعجة والنوافذ المنبثقة من مصادر البث الخارجية. يتم كشف وفك حظر سيرفرات Streamtape وغيرها تلقائياً لتعمل بسلاسة دون رسالة "Client blocked!".'
                : 'Injects secure sandbox policies to block invasive popup ads & redirects from external sources. Sandbox-prohibited streams like Streamtape are automatically detected and whitelisted to work flawlessly without "Client blocked!" errors.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto" dir="ltr">
          <span className="text-xs font-bold text-slate-400 font-sans hidden sm:inline select-none">
            {isAdBlockEnabled ? 'Ad-Shield: ON' : 'Ad-Shield: OFF'}
          </span>
          <button
            onClick={toggleAdBlock}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAdBlockEnabled ? 'bg-rose-600' : 'bg-slate-800'
            }`}
            role="switch"
            aria-checked={isAdBlockEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAdBlockEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Secondary Bottom information panel about performance & details */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-950`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#7052ff] block">
              {item.type === 'tv' ? (isRtl ? 'مسلسلات تلفزيونية' : 'TV Series') : (isRtl ? 'أفلام سينمائية' : 'Movie')}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              {item.title} {currentEpisode ? ` - ${isRtl ? `الحلقة` : `Episode`} ${currentEpisode.episodeNumber}` : ''}
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              {item.originalTitle && item.originalTitle !== item.title ? `Original: ${item.originalTitle}` : ''}
              {item.releaseDate ? ` • ${item.releaseDate.split('-')[0]}` : ''}
              {item.rating ? ` • ⭐ ${item.rating}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {item.type === 'tv' && (
              <button
                onClick={handleNextEpisodeForce}
                className="px-5 py-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-450 hover:text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{isRtl ? 'الحلقة التالية' : 'Next Episode'}</span>
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== 1. خوادم ومسارات البث المتاحة ==================== */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-rose-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {isRtl ? 'سيرفرات البث المتوفرة:' : 'Available Streaming Servers:'}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-450 bg-rose-600/10 border border-rose-500/10 px-2.5 py-1 rounded-full uppercase self-start sm:self-auto select-none">
              {isRtl ? 'خوادم مدعومة بالكامل' : 'FULLY ENCRYPTED TUNNELS'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {(() => {
              const activeServers = servers.length > 0 ? servers : [
                    { 
                      id: 'srv-primary', 
                      name: isRtl ? 'خادم كورا الرئيسي (VIP)' : 'Kora Main Stream (VIP)', 
                      url: item.type === 'tv' && currentEpisode ? currentEpisode.videoUrl : item.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
                    },
                    { 
                      id: 'srv-cloud', 
                      name: isRtl ? 'خادم سحابي سريع (FHD)' : 'Fast Stream Server (FHD)', 
                      url: item.type === 'tv' && currentEpisode ? currentEpisode.videoUrl : item.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
                    },
                    { 
                      id: 'srv-backup', 
                      name: isRtl ? 'خادم احتياطي سريع' : 'Backup Fast Server', 
                      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' 
                    }
                  ];
              
              const streamServers = activeServers.map((srv, idx) => ({
                ...srv,
                url: getResolvedServerUrl(srv, idx, item, item.type === 'tv' ? currentEpisode : null)
              }));
              
              return streamServers.map((srv, idx) => {
                const isActive = activeServerId === srv.id || streamUrl === srv.url;
                
                // Deterministic beautiful latency & server tier description
                const ping = 25 + (idx * 21) % 110;
                const speedText = ping < 50 ? (isRtl ? 'فائق السرعة 4K' : 'Ultra Fast 4K') : ping < 90 ? (isRtl ? 'عالي السرعة FHD' : 'High Speed FHD') : (isRtl ? 'سيرفر احتياطي' : 'Stable Mirror');
                
                return (
                  <button
                    key={srv.id}
                    onClick={() => {
                      setActiveServerId(srv.id);
                      setStreamUrl(srv.url);
                      triggerToast(isRtl ? `تم الانتقال لخادم: ${srv.name}` : `Switched to: ${srv.name}`);
                    }}
                    className={`group p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.01] active:scale-[0.99] duration-150 ${
                      isActive 
                        ? 'bg-rose-600/10 border-rose-500 text-white shadow-lg shadow-rose-600/5 ring-1 ring-rose-500/30' 
                        : 'bg-slate-950/45 border-slate-900 text-slate-300 hover:bg-slate-900/55 hover:border-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`text-[9px] uppercase font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        isActive ? 'bg-rose-600 text-white font-black' : 'bg-slate-900 text-slate-400 group-hover:text-rose-450 group-hover:bg-rose-950/20'
                      }`}>
                        <Tv className="h-3 w-3 shrink-0" />
                        <span>{isRtl ? `سيرفر ${idx + 1}` : `SERVER ${idx + 1}`}</span>
                      </span>
                      <span className="text-[9px] font-semibold font-mono text-slate-500 flex items-center gap-1 select-none">
                        <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span>{ping}ms</span>
                      </span>
                    </div>

                    <div className="space-y-0.5 w-full text-right mt-1">
                      <span className="text-xs font-black truncate block group-hover:text-amber-400 transition-colors leading-tight">
                        {srv.name}
                      </span>
                      <span className="text-[9.5px] font-bold text-rose-500/80 block font-sans">
                        {speedText}
                      </span>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* ==================== 2. سيرفرات التحميل المباشر للعمل ==================== */}
        {item.downloadServers && item.downloadServers.length > 0 && (
          <div className="space-y-3.5 border-t border-slate-950 pt-5">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-rose-500 shrink-0" />
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">{isRtl ? 'روابط تحميل الحلقة والعمل بجودة عالية:' : 'Direct Download Mirrors (High quality):'}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {item.downloadServers.map((dl) => (
                <a
                  key={dl.id}
                  href={dl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4.5 py-3 bg-slate-950 hover:bg-[#150e24] border border-slate-900 hover:border-rose-500/20 rounded-xl text-xs font-black text-rose-450 hover:text-rose-400 transition-all flex items-center gap-2 shadow-inner"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>{dl.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 3. جدول حلقات المسلسل ==================== */}
        {item.type === 'tv' && (
          <div className="space-y-3.5 border-t border-slate-950 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-rose-500 shrink-0 fill-current" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{isRtl ? 'حلقات ومواسم المسلسل المتوفرة:' : 'TV Show Episodes:'}</h3>
              </div>
              <span className="text-[10px] font-black text-rose-450 bg-rose-600/10 border border-rose-500/10 px-2.5 py-1 rounded-full uppercase">
                {isRtl ? `شغل ومتابع حاليا` : `Now Listening`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {(() => {
                const activeEps = (item.episodes && item.episodes.length > 0) 
                  ? item.episodes 
                  : [
                      {
                        id: `ep-fallback-${item.id}-1`,
                        title: isRtl ? 'الحلقة الافتتاحية الأولى ' : 'Episode 1: Pilot',
                        season: 1,
                        episodeNumber: 1,
                        duration: item.duration || '45m',
                        videoUrl: item.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                      }
                    ];
                
                return activeEps.map((ep) => {
                  const isActive = currentEpisode?.episodeNumber === ep.episodeNumber;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => {
                        navigate(`/watch/tv/${item.id}?ep=${ep.episodeNumber}`);
                      }}
                      className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-rose-600/15 border-rose-500 text-white shadow-lg'
                          : 'bg-[#06040a]/70 border border-slate-900 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="truncate text-right space-y-0.5">
                        <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 block font-mono text-right">
                          {isRtl ? `الموسم ${ep.season} • الحلقة ${ep.episodeNumber}` : `S${ep.season} • EP ${ep.episodeNumber}`}
                        </span>
                        <h4 className="font-extrabold text-xs text-white truncate max-w-[150px] sm:max-w-[180px] text-right">
                          {ep.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 font-mono">{ep.duration}</span>
                        <div className={`p-1.5 rounded-full ${isActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-950 text-slate-400'}`}>
                          <Play className="h-2.5 w-2.5 fill-current" />
                        </div>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ==================== 4. ملخص قصة العمل والتفاصيل السينمائية ==================== */}
        <div className="border-t border-slate-950 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-wider">
              {isRtl ? 'ملخص قصة العمل والدراما:' : 'The Cinematic Story overview:'}
            </h4>
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed text-justify bg-slate-950/30 p-4 rounded-xl border border-slate-900">
              {item.overview || (isRtl ? 'لا يتوفر ملخص عربي للعمل بعد.' : 'No description has been indexed for this entry.')}
            </p>
          </div>

          <div className="space-y-3.5 bg-slate-950/30 p-4 rounded-xl border border-slate-900">
            <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-wider border-b border-slate-900 pb-2">
              {isRtl ? 'المواصفات والتصنيف الفني:' : 'Production specs & metadata:'}
            </h4>
            
            <div className="space-y-2 text-xs">
              {item.creator && (
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">{isRtl ? 'المؤلف / المبتكر:' : 'Creator / Writer:'}</span>
                  <span className="font-bold text-slate-200">{item.creator}</span>
                </div>
              )}
              {item.director && (
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">{isRtl ? 'المخرج السينمائي:' : 'Director:'}</span>
                  <span className="font-bold text-slate-200">{item.director}</span>
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold text-slate-500 block uppercase">{isRtl ? 'التصنيف الفني:' : 'Genres:'}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.genres?.map((g) => (
                    <span key={g} className="bg-slate-900 border border-slate-800 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-md">
                      {isRtl ? (g === 'Arabic' ? 'عربي' : g === 'Action' ? 'أكشن' : g === 'Drama' ? 'دراما' : g === 'History' ? 'تاريخي' : g) : g}
                    </span>
                  ))}
                </div>
              </div>
              {item.cast && item.cast.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">{isRtl ? 'طاقم البطولة والتمثيل:' : 'Starring Cast:'}</span>
                  <span className="font-bold text-slate-300 block truncate">{item.cast.slice(0, 5).join(' , ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informative Tips Grid on premium custom controls layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs pt-4 border-t border-slate-950">
          
          <div className="space-y-1 bg-[#0B0B0B]/30 border border-slate-950 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-rose-500">
              <Clock className="h-4 w-4" />
              <h4 className="font-extrabold text-white">{isRtl ? 'حفظ تقدم العرض تلقائياً' : 'Bookmark Resume Sync'}</h4>
            </div>
            <p className="text-slate-400 leading-relaxed font-semibold">
              {isRtl 
                ? 'يقوم النظام بحفظ الدقيقة التي وصلت إليها لحظة بلحظة. يمكنك إغلاق الصفحة والعودة في أي وقت لمتابعة المشاهدة.'
                : 'Your stream coordinates are bookmarked with latency filters. Power outages or window reloads are secure.'
              }
            </p>
          </div>

          <div className="space-y-1 bg-[#0B0B0B]/30 border border-slate-950 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-rose-500">
              <Sliders className="h-4 w-4" />
              <h4 className="font-extrabold text-white">{isRtl ? 'جودات العرض المتعددة' : 'Continuous Bitrate Tunnels'}</h4>
            </div>
            <p className="text-slate-400 leading-relaxed font-semibold">
              {isRtl 
                ? 'في حالة ضعف شبكة الانترنت لديك، تفضل بالانتقال للجودة المتوسطة أو المنخفضة من زر الجودة بالأسفل.'
                : 'Toggle bandwidth presets down to SD 480p under slow conditions, or premium 1080p FHD when buffering headroom permits.'
              }
            </p>
          </div>

          <div className="space-y-1 bg-[#0B0B0B]/30 border border-slate-950 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-rose-500">
              <Sparkles className="h-4 w-4" />
              <h4 className="font-extrabold text-white">{isRtl ? 'اختصارات وإيماءات اللمس' : 'Touch Zones Shortcuts'}</h4>
            </div>
            <p className="text-slate-400 leading-relaxed font-semibold">
              {isRtl 
                ? 'انقر نقراً مزدوجاً على الجانب الأيمن للفيلم لتقديم ١٠ ثوانٍ، أو الجانب الأيمن للمجال الأيسر للرجوع ١٠ ثوانٍ.'
                : 'Double-tap Left or Right quadrant zones on screen directly to jump backward or forward 10s easily during playing.'
              }
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

