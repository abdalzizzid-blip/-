import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, VideoServer, Episode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, ArrowLeft, ArrowRight,
  Maximize, Minimize, Settings, Subtitles, Sliders, HardDrive, Clock, 
  Lightbulb, LightbulbOff, Check, RefreshCw, HelpCircle, Film, Sparkles, Tv
} from 'lucide-react';

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

  // Ripple feedback effects for double taps
  const [rippleSide, setRippleSide] = useState<'left' | 'right' | null>(null);

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

  const loadVideoDetails = async () => {
    setLoading(true);
    try {
      const data = await tmdbService.getDetails(id!, type as 'movie' | 'tv');
      if (data) {
        setItem(data);
        
        // Setup Video URL path according to media type
        if (type === 'tv' && data.episodes) {
          const epNumber = Number(epParam) || 1;
          const matchedEp = data.episodes.find(e => e.episodeNumber === epNumber) || data.episodes[0];
          setCurrentEpisode(matchedEp || null);
          if (matchedEp) {
            setStreamUrl(matchedEp.videoUrl);
          }
        } else {
          setStreamUrl(data.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Modify Video Server streams according to chosen Quality (Mocked dynamic switching)
  useEffect(() => {
    if (!videoRef.current) return;
    const currentProg = videoRef.current.currentTime;
    
    // Quality URL variations mapping
    let targetUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    if (currentEpisode) {
      targetUrl = currentEpisode.videoUrl;
    } else if (item) {
      targetUrl = item.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    }

    if (quality === '720p') {
      targetUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    } else if (quality === '480p') {
      targetUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
    }

    videoRef.current.src = targetUrl;
    videoRef.current.load();
    videoRef.current.currentTime = currentProg;

    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [quality, currentEpisode]);

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
        className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-900 bg-black group/player select-none shadow-2xl shadow-black relative"
        id="arabic-cinema-player"
      >
        
        {/* Core Video Player Elements */}
        <video
          ref={videoRef}
          src={streamUrl}
          className="w-full h-full object-contain"
          onClick={() => setIsPlaying(!isPlaying)}
          onDoubleClick={handleVideoDoubleTap}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          playsInline
        />

        {/* Dynamic Interactive Subtitle Engine: Displayed beautifully overlays */}
        {activeSubtitleText && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-11/12 max-w-2xl text-center select-none animate-fade-in">
            <span className="inline-block bg-black/85 border border-slate-900/60 px-5 py-2.5 rounded-2xl text-rose-100 font-sans font-black text-sm md:text-base tracking-wide leading-relaxed shadow-xl text-center">
              {activeSubtitleText}
            </span>
          </div>
        )}

        {/* Double click Tap Ripple circles (Backward/Forward feedbacks) */}
        {rippleSide === 'left' && (
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none bg-rose-600/15 border border-rose-500/20 h-20 w-20 rounded-full flex flex-col items-center justify-center animate-ping text-white font-black text-xs font-mono">
            <span>-10s</span>
          </div>
        )}
        {rippleSide === 'right' && (
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 z-30 pointer-events-none bg-rose-600/15 border border-rose-500/20 h-20 w-20 rounded-full flex flex-col items-center justify-center animate-ping text-white font-black text-xs font-mono">
            <span>+10s</span>
          </div>
        )}

        {/* Resume bookmark progress interactive overlay */}
        {showResumeModal && savedProgress && (
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
          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/75 flex flex-col justify-between p-4 sm:p-6 duration-300 transition-opacity z-20 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          
          {/* Top Info row bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <div className="text-left">
                {currentEpisode && (
                  <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 block font-mono">
                    {isRtl ? `الموسم ${currentEpisode.season} • الحلقة ${currentEpisode.episodeNumber}` : `S${currentEpisode.season} • EP ${currentEpisode.episodeNumber}`}
                  </span>
                )}
                <h2 className="text-xs sm:text-sm font-black text-white leading-none truncate max-w-xs md:max-w-lg">
                  {item.title} {currentEpisode ? ` - ${currentEpisode.title}` : ''}
                </h2>
              </div>
            </div>

            {/* Close / Return detail indicator button */}
            <Link
              to={`/details/${item.type}/${item.id}`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-950/75 border border-slate-905/30 hover:border-white text-slate-300 hover:text-white transition-all select-none"
            >
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          {/* Large Floating Middle Play HUD click zones */}
          <div className="flex items-center justify-center shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-14 w-14 sm:h-18 sm:w-18 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90"
            >
              {isPlaying ? <Pause className="h-6 w-6 sm:h-8 sm:w-8 fill-white" /> : <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-white translate-x-0.5" />}
            </button>
          </div>

          {/* Bottom Custom Playback Bar and Configs */}
          <div className="space-y-4">
            
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

              <span className="text-[10px] font-black font-mono text-slate-350 select-none bg-slate-950/40 px-2 py-0.5 rounded">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback Settings Panel & Controllers */}
            <div className="flex flex-wrap items-center justify-between gap-4 font-sans">
              
              {/* Left group controls */}
              <div className="flex items-center gap-3">
                {/* 10s backward seek */}
                <button
                  onClick={() => videoRef.current && (videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0))}
                  className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="-10s"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                </button>

                {/* Main mini-play toggler */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4 fill-current shrink-0" /> : <Play className="h-4 w-4 fill-current shrink-0" />}
                </button>

                {/* 10s forward seek / Next Episode link */}
                <button
                  onClick={() => videoRef.current && (videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || 0))}
                  className="p-2 rounded-xl bg-slate-950/50 hover:bg-[#100a1a] border border-slate-905/20 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                  title="+10s"
                >
                  <SkipForward className="h-4 w-4 shrink-0" />
                </button>

                {/* Audio volume controller widget */}
                <div className="flex items-center gap-1.5 group/volume relative">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-905/20 hover:border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 shrink-0" /> : <Volume2 className="h-4 w-4 shrink-0" />}
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
                    className="w-0 group-hover/volume:w-16 h-1 bg-slate-850 rounded-full appearance-none accent-rose-600 transition-all overflow-hidden cursor-pointer"
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                      showQualityMenu ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white_hover:border-slate-800'
                    }`}
                  >
                    <HardDrive className="h-3.5 w-3.5" />
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                      showSpeedMenu ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white_hover:border-slate-800'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all select-none cursor-pointer border ${
                      selectedSubtitle !== 'off' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950/75 border-slate-850 text-slate-300 hover:text-white_hover:border-slate-800'
                    }`}
                  >
                    <Subtitles className="h-3.5 w-3.5" />
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
                  className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4 shrink-0" /> : <Maximize className="h-4 w-4 shrink-0" />}
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Secondary Bottom information panel about performance & details */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-950`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-rose-500 block">
              {isRtl ? 'القناة النشطة حالياً' : 'Active Channel Stream ID'}
            </span>
            <h1 className="text-lg font-black text-white leading-tight">
              {item.title} {currentEpisode ? ` - ${t('episodePlay')} ${currentEpisode.episodeNumber}` : ''}
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              {item.originalTitle && item.originalTitle !== item.title ? `Original Title: ${item.originalTitle}` : ''}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {item.type === 'tv' && item.episodes && (
              <button
                onClick={handleNextEpisodeForce}
                className="px-5 py-3 bg-slate-950 border border-slate-850 text-slate-300 hover:text-white hover:border-slate-800 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
              >
                <span>{isRtl ? 'الحلقة التالية' : 'Next Episode'}</span>
                <SkipForward className="h-4 w-4 text-rose-500 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Informative Tips Grid on premium custom controls layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
          
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

