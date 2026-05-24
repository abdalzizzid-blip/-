import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Download,
  Maximize2,
  Play,
  Palette,
  Type,
  Volume2,
  Award,
  Sliders,
  CheckCircle2,
  Shield,
  Layers,
  Heart,
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';

// Use the exact saved paths for the generated corporate visuals
const BRAND_ICON_PATH = '/src/assets/images/koraflix_icon_1779417972224.png';
const BRAND_SPLASH_PATH = '/src/assets/images/koraflix_splash_1779417991597.png';

export const BrandGuidelines: React.FC = () => {
  const { lang, t } = useLanguage();
  const isRtl = lang === 'ar';

  // State managers
  const [activeSplashSim, setActiveSplashSim] = useState(false);
  const [splashLoadingProgress, setSplashLoadingProgress] = useState(0);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [selectedLoader, setSelectedLoader] = useState<'orbit' | 'ripple' | 'kora'>('kora');
  const [loaderSpeed, setLoaderSpeed] = useState<number>(1.5); // seconds per loop
  const [loaderSize, setLoaderSize] = useState<number>(64); // pixels

  // Trigger copy-to-clipboard helper for color hex codes
  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  // Synthesizes a beautiful luxurious cinematic startup chord chime
  const playCinematicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      
      // Master Gain for safety
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime + 1.2);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
      masterGain.connect(ctx.destination);

      // Low foundation warm bass note (C2 / 65Hz)
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(65.41, ctx.currentTime);
      
      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
      bassOsc.connect(bassGain).connect(masterGain);
      
      // Mid fundamental chord sweep (G3, C4, E4)
      const frequencies = [196.00, 261.63, 329.63, 493.88]; // G3, C4, E4, B4 (maj7 vibe)
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const delay = idx * 0.12; // Arpeggiated entry
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        // Exponential glide up slightly
        osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + delay + 1.2);
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        oscGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.2);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.4);
        
        osc.connect(oscGain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 3.0);
      });

      // Ambient sparkling gold dust synth (High notes sweep)
      const sparkleOsc = ctx.createOscillator();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.4); // B5
      sparkleOsc.frequency.exponentialRampToValueAtTime(1975.53, ctx.currentTime + 1.5); // B6
      
      const sparkleGain = ctx.createGain();
      sparkleGain.gain.setValueAtTime(0.001, ctx.currentTime + 0.4);
      sparkleGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.6);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
      
      sparkleOsc.connect(sparkleGain).connect(masterGain);

      bassOsc.start();
      sparkleOsc.start();
      
      bassOsc.stop(ctx.currentTime + 3.0);
      sparkleOsc.stop(ctx.currentTime + 3.0);
    } catch (err) {
      console.warn("Web Audio API blocked or unsupported:", err);
    }
  };

  // Launch simulated splash screen sequence
  const startSplashSimulation = () => {
    setActiveSplashSim(true);
    setSplashLoadingProgress(0);
    playCinematicChime();

    // Increment loading mock bar
    const duration = 2500; // 2.5s duration
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min((currentStep / steps) * 100, 100);
      setSplashLoadingProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setActiveSplashSim(false);
        }, 600);
      }
    }, intervalTime);
  };

  return (
    <div className="space-y-12">
      
      {/* Dynamic Bilingual Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/60 overflow-hidden shadow-2xl">
        {/* Subtle royal background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-black uppercase tracking-widest leading-none">
              <Crown className="h-3.5 w-3.5 animate-bounce" />
              <span>{isRtl ? 'الهوية البصرية الفاخرة' : 'Premium Luxury Brand Hub'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>{isRtl ? 'دليل هوية كورا فليكس' : 'KoraFlix Identity Manual'}</span>
              <span className="text-amber-500">كورا فليكس</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-450 max-w-2xl leading-relaxed">
              {isRtl
                ? 'مرحباً بك في وثيقة التصميم وهوية البث الموحدة لمنصة كورا فليكس. تم بناء الأصول لتجمع بين فخامة الذهب الملوكي والغموض السينمائي لتقديم تجربة ترفيهية عربية-أولى متطورة.'
                : 'Welcome to the unified design guidelines and streaming identity hub for KoraFlix. Built meticulously to blend majestic champagne gold with obsidian cinematics, creating an elite Arabic-first streaming platform.'}
            </p>
          </div>
          
          <button
            onClick={startSplashSimulation}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-450 text-slate-950 text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 flex items-center gap-3.5 shadow-lg shadow-amber-500/25 border border-amber-300/20 transition-all cursor-pointer"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            <span>{isRtl ? 'شغل شاشة البدء السينمائية' : 'Simulate Splash Intro'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 1. Core assets showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module A: App Icon Creator */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'أيقونة التطبيق الرسمية' : 'OFFICIAL APP ICON'}</span>
            </div>
            <h2 className="text-lg font-black text-white">{isRtl ? 'أيقونة كورا فليكس دائرية مصقولة' : 'The Golden Sculpted Icon'}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl 
                ? 'أيقونة المنصة هي عبارة عن مزيج يدمج الكرة الذهبية الأنيقة (كورا) مع شريط الحركة السينمائي (فليكس)؛ معبرة عن التكامل الحرفي بين عالم المستديرة الساحرة والدراما الفاخرة.'
                : 'The visual symbol represents a sophisticated luxury marriage of a spherical gold champion globe (Kora) bound by a cinematic ribbon of dramatic frames (Flix) on a deep onyx canvas.'}
            </p>
          </div>

          {/* Visual container showcasing the generated App Icon with dynamic mockup */}
          <div className="relative overflow-hidden rounded-xl bg-slate-950 p-6 border border-slate-850 flex items-center justify-center min-h-[220px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* The Mock App Grid Layout */}
            <div className="flex flex-col items-center gap-3.5 group">
              <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-amber-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.8)] transition-all group-hover:scale-105 duration-300">
                <img
                  src={BRAND_ICON_PATH}
                  alt="KoraFlix App Icon"
                  className="w-32 h-32 rounded-[22px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-tr from-amber-500/30 to-transparent blur-md opacity-30 group-hover:opacity-60 transition-opacity" />
              </div>
              <span className="text-[11px] font-mono tracking-widest text-amber-500 font-bold uppercase">koraflix_icon.png</span>
            </div>
          </div>

          {/* Asset Info & Action */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="text-[10px] text-slate-500 leading-normal">
              <p>Format: High definition Webp / PNG</p>
              <p>Theme: Royal Gold & Slate</p>
            </div>
            <a
              href={BRAND_ICON_PATH}
              download="koraflix_icon.png"
              target="_blank"
              rel="noreferrer"
              className="px-4.5 py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 hover:bg-amber-500/5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isRtl ? 'عرض المصدر' : 'Open Source Image'}</span>
            </a>
          </div>
        </div>

        {/* Module B: Branding Splash Screen Design */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'شاشة الإقلاع والترويج' : 'CINEMATIC SPLASH'}</span>
            </div>
            <h2 className="text-lg font-black text-white">{isRtl ? 'اللوحة الإعلانية وشاشة البدء' : 'Promotional Title Cards'}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl 
                ? 'شاشة البدء تقدم نص الشعار الفاخر "KoraFlix" يعلو خطاً كوفياً عربياً استثنائياً "كورا فليكس" ببريق ذهبي ملوكي يبرز تحت إنارة قوية لتدشين انطباع حاد بالفخامة.'
                : 'The cinematic title card and greeting display fuses modern structural letterings with a luxurious glowing Kufic calligraphy "كورا فليكس", draped with particles of absolute visual gold.'}
            </p>
          </div>

          {/* Widescreen Mock Display of the Splash Screen */}
          <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-850 aspect-video group flex items-center justify-center">
            <img
              src={BRAND_SPLASH_PATH}
              alt="KoraFlix Splash Visual"
              className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Ambient vignette and overlay actions */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-2">
              <button
                onClick={startSplashSimulation}
                className="p-3.5 rounded-full bg-amber-500 text-slate-950 hover:scale-110 active:scale-90 transition-transform shadow-xl shadow-amber-500/30 cursor-pointer"
                title={isRtl ? 'معاينة مليئة بالحركة والمؤثرات' : 'Simulate Live Intro'}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="text-[10px] text-slate-500 leading-normal">
              <p>Composition: Cinematic 16:9 Landscape</p>
              <p>Typeface: Custom Gold Kufic Arabic</p>
            </div>
            <a
              href={BRAND_SPLASH_PATH}
              download="koraflix_splash.png"
              target="_blank"
              rel="noreferrer"
              className="px-4.5 py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 hover:bg-amber-500/5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isRtl ? 'عرض المصدر' : 'Open Source Image'}</span>
            </a>
          </div>
        </div>

      </div>

      {/* Grid 2: Core Guidelines and Colors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Visual Color System */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-500">
              <Palette className="h-4.5 w-4.5" />
              <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'مجموعة ألوان الامتياز' : 'GOLD & DARK SYSTEM'}</span>
            </div>
            <h3 className="text-base font-black text-white">{isRtl ? 'لوحة ألوان المنصة المعتمدة' : 'The Corporate Colors'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isRtl
                ? 'مجموعة الألوان الخاصة بنا مبنية بعناية لتعكس التميز المطلق، والتباين الفخم للمحيط السينمائي الداكن.'
                : 'A curated color system formulated to deliver eye comfort, premium contrast, and immediate VIP distinction.'}
            </p>
          </div>

          {/* Color Blocks */}
          <div className="space-y-3">
            {[
              { name: isRtl ? 'الذهب المصقول الملوكي' : 'Royal Champagne Gold', hex: '#D4AF37', usage: 'Primary brand insignia, accents, borders', bg: 'bg-[#D4AF37] text-slate-950' },
              { name: isRtl ? 'غسق شاشات شاهد بريميوم' : 'Shahid VIP Deep Midnight', hex: '#060913', usage: 'Platform canvas backdrop', bg: 'bg-[#060913] text-white border border-slate-800' },
              { name: isRtl ? 'لون التوهج الفاخر للمحيط' : 'Onyx Black', hex: '#0B0B0B', usage: 'Contrast sheets and scroll system', bg: 'bg-[#0B0B0B] text-white' },
              { name: isRtl ? 'الأزرق الزيتي للبطاقات' : 'Deep Slate-Blue Card Back', hex: '#0D1222', usage: 'Structural components, panels, tabs', bg: 'bg-[#0D1222] text-slate-200' },
              { name: isRtl ? 'التوهج التكنولوجي الرقمي' : 'Shahid Digital Green', hex: '#13E27D', usage: 'Active toggles, highlights, exclusive labels', bg: 'bg-[#13E27D] text-slate-950' },
            ].map((color) => (
              <div
                key={color.hex}
                onClick={() => copyColorToClipboard(color.hex)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 cursor-pointer transition-all"
                title="Click to copy Hex code"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-black text-[13px] ${color.bg}`}>Gold</div>
                  <div className="leading-tight text-left">
                    <p className="text-xs font-black text-slate-200">{color.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{color.usage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {copiedColor === color.hex ? 'Copied!' : color.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Typography standards */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500">
                <Type className="h-4.5 w-4.5" />
                <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'تصميم الخطوط والاتساق' : 'TYPOGRAPHY SYNERGY'}</span>
              </div>
              <h3 className="text-base font-black text-white">{isRtl ? 'الرصانة والوضوح السينمائي' : 'Font Hierarchy'}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isRtl
                  ? 'خطوط منصة كورا فليكس معززة تكنولوجياً بحزمة خطوط القاهرة والتاجوال لتقديم راحة قراءة مذهلة.'
                  : 'A gorgeous typography bundle utilizing premium, geometric Arabic typefaces supporting optimal legibility of details.'}
              </p>
            </div>

            {/* Typography Specimens */}
            <div className="space-y-4">
              <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono text-slate-500">DISPLAY HEADING (100% Bold)</span>
                <p className="font-sans font-black text-lg text-white leading-normal">
                  {isRtl ? 'عالم الدراما الفخمة' : 'The Home of Elite Drama'}
                </p>
                <p className="text-[11px] text-slate-400">Cairo ExtraBold / Tajawal Heavy</p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono text-slate-500">UI / CONTENT BODY (Medium)</span>
                <p className="font-sans font-medium text-xs text-slate-300 leading-relaxed">
                  {isRtl 
                    ? 'شاهد مسلسلات وأفلام حصرية مشفرة في لوحة تحكم واحدة متزامنة مباشرة بالخوادم من خلال كورا فليكس الرياضية والترفيهية.'
                    : 'Stream exclusive matches, high definition serials, and live channels, synchronized instantly into a unified web console.'}
                </p>
                <p className="text-[11px] text-slate-400">Cairo Medium / IBM Plex Arabic</p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono text-slate-500">TECHNICAL CODES / STATS</span>
                <p className="font-mono text-[11px] text-amber-400">
                  SECURE_CORP_STB_NODE_ACTIVE_200 OK
                </p>
                <p className="text-[10px] text-slate-450">JetBrains Mono 500</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
            <span className="font-bold text-slate-400">Rule: </span>
            {isRtl
              ? 'تجنب تمطيط الحروف أو وضع أحجام خطوط شاذة تصعب على العميل تصفح الفهرس من الهاتف.'
              : 'Strict touch target sizing rules to prevent layout shifting and overlap under RTL system conversions.'}
          </div>
        </div>

        {/* Card 3: Brand Guidelines and Core Pillars */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500">
                <Volume2 className="h-4.5 w-4.5" />
                <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'الأركان والمشاعية الصوتية' : 'SONIC & VOICE IDENTITY'}</span>
              </div>
              <h3 className="text-base font-black text-white">{isRtl ? 'الهوية الصوتية والرسالة' : 'Pillars of Influence'}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isRtl
                  ? 'رؤية المنصة تكتمل عبر تفاعل سمعي وبصري فريد ينبض بقدوم روائع المحتوى مباشرة.'
                  : 'Delivering multisensory cues that reinforce high-end cinematic standards, from luxury golden loading bars to interactive audio chimes.'}
              </p>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-300">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="font-black text-white">{isRtl ? 'صوت الفخامة' : 'Warm Luxury Chord'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isRtl ? 'نغمة سنثسايزر ذهبية مجسمة هادئة' : 'Triangular analog sweeping chime with major7 resonance.'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="font-black text-white">{isRtl ? 'الأصالة أولاً' : 'Arabic-First Legacy'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isRtl ? 'فن منمق للخطوط والنداءات لراحة المواطن العربي' : 'Elevated native layouts rendering RTL structures with modern aesthetics.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="font-black text-white">{isRtl ? 'البساطة والسرعة' : 'Minimal Platform'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isRtl ? 'عزل كامل للتشتت مع تركيز الترفيه فقط' : 'Zero bloat, dark backgrounds, high visibility to video content.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={playCinematicChime}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-amber-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Volume2 className="h-4.5 w-4.5 animate-pulse" />
            <span>{isRtl ? 'استمع للنغمة السينمائية VIP' : 'Play Brand Audio Chime'}</span>
          </button>
        </div>

      </div>

      {/* Grid 3: Interactive Loading Animation Playground */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-rose-500">
              <Sliders className="h-4.5 w-4.5" />
              <span className="text-xs font-black uppercase tracking-widest">{isRtl ? 'متلقي تجارب الحركة' : 'VISUAL ANIMATION PLAYGROUND'}</span>
            </div>
            <h3 className="text-lg font-black text-white">{isRtl ? 'اختبار مؤشر التحميل والانتظار' : 'Golden Loading Animation Lab'}</h3>
            <p className="text-xs text-slate-400">
              {isRtl 
                ? 'خصص وجرب شكل وسرعة مؤشرات التحميل والانتظار الذهبية الفاخرة المعتمدة ببوابتنا.'
                : 'Configure and review the premium animated load cues used natively when fetching media streams.'}
            </p>
          </div>

          {/* Loader Selectors */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'kora', label: isRtl ? 'التوهج النبضي الذهبي' : 'Pulsing Gold Kora' },
              { id: 'ripple', label: isRtl ? 'الموجات المتتالية السينمائية' : 'Cinematic Ripples' },
              { id: 'orbit', label: isRtl ? 'المدار الدائري الكلاسيكي' : 'Classic Golden Orbit' }
            ].map((loader) => (
              <button
                key={loader.id}
                onClick={() => setSelectedLoader(loader.id as any)}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer uppercase ${
                  selectedLoader === loader.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                }`}
              >
                {loader.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Playground Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Slider Controls */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black text-slate-350 dark:text-slate-200">
                <span>{isRtl ? 'السرعة (ثانية/دورة)' : 'Cycle Duration (s)'}</span>
                <span className="font-mono text-amber-500">{loaderSpeed}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={loaderSpeed}
                onChange={(e) => setLoaderSpeed(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black text-slate-350 dark:text-slate-200">
                <span>{isRtl ? 'الحجم والإنارة (بكسل)' : 'Component Size (px)'}</span>
                <span className="font-mono text-amber-500">{loaderSize}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={loaderSize}
                onChange={(e) => setLoaderSize(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tech details code */}
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-450 leading-relaxed">
              <span className="text-slate-600">// Active CSS Definition</span>
              <p className="text-amber-500">duration: {loaderSpeed}s</p>
              <p className="text-amber-500">dimension: {loaderSize}px</p>
              <p className="text-rose-400">palette: Royal Champagne Gold</p>
            </div>
          </div>

          {/* Canvas Render Area */}
          <div className="md:col-span-2 overflow-hidden rounded-xl bg-slate-950 p-12 border border-slate-850 min-h-[220px] flex flex-col items-center justify-center relative">
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-500 uppercase font-mono tracking-widest">
              Live CSS Render Frame
            </div>

            {/* Dynamic CSS animations rendering directly */}
            <div className="flex items-center justify-center min-h-[140px]">
              {selectedLoader === 'kora' && (
                <div className="relative flex items-center justify-center">
                  <div
                    style={{
                      width: `${loaderSize}px`,
                      height: `${loaderSize}px`,
                      animationDuration: `${loaderSpeed}s`
                    }}
                    className="rounded-full bg-gradient-to-tr from-amber-500 inside-border-amber to-amber-200 animate-pulse opacity-85 shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                  />
                  <div className="absolute font-black text-[10px] text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded uppercase font-mono select-none pointer-events-none scale-90">
                    KORA
                  </div>
                </div>
              )}

              {selectedLoader === 'ripple' && (
                <div className="relative flex items-center justify-center">
                  {[1, 2, 3].map((val) => (
                    <div
                      key={val}
                      style={{
                        width: `${loaderSize}px`,
                        height: `${loaderSize}px`,
                        animationDelay: `${(val - 1) * (loaderSpeed / 3)}s`,
                        animationDuration: `${loaderSpeed}s`
                      }}
                      className="absolute rounded-full border border-amber-500/50 animate-ping shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    />
                  ))}
                  <div className="h-4 w-4 rounded-full bg-amber-500" />
                </div>
              )}

              {selectedLoader === 'orbit' && (
                <div
                  style={{
                    width: `${loaderSize}px`,
                    height: `${loaderSize}px`,
                    animationDuration: `${loaderSpeed}s`
                  }}
                  className="rounded-full border-t-2 border-r-2 border-b border-l border-amber-500 border-t-amber-500 border-r-transparent animate-spin"
                />
              )}
            </div>

            <span className="text-[10px] text-slate-550 font-mono tracking-widest mt-6 select-none uppercase">
              {selectedLoader} Loader - Speed: {loaderSpeed}s loop
            </span>
          </div>

        </div>
      </div>

      {/* Live Splash Simulator Overlay Frame */}
      <AnimatePresence>
        {activeSplashSim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-transparent overflow-hidden"
          >
            {/* Soft Ambient glowing colors radiating behind title */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/15 rounded-full blur-[150px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Interactive Close button */}
            <button
              onClick={() => setActiveSplashSim(false)}
              className="absolute top-6 right-6 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer"
            >
              {isRtl ? 'إغلاق المعاينة ×' : 'Close Sandbox Simulator ×'}
            </button>

            {/* Core Splash Display */}
            <div className="text-center space-y-8 max-w-xl w-full">
              
              {/* Image Banner representing the customized Arabic calligraphy visual */}
              <div className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 p-2.5 border border-amber-500/15 shadow-[0_24px_50px_rgba(0,0,0,0.85)]">
                <img
                  src={BRAND_SPLASH_PATH}
                  alt="KoraFlix Premium Corporate Logo"
                  className="w-full rounded-xl object-contain shadow-inner"
                  referrerPolicy="no-referrer"
                />
                
                {/* Embedded Glow Rings */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-rose-500/15 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Loader progress and indicators */}
              <div className="space-y-3.5 px-6">
                
                {/* Custom Elegant Horizontal Load Bar */}
                <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden w-full">
                  <div
                    style={{ width: `${splashLoadingProgress}%` }}
                    className="absolute h-full left-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-75 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono select-none">
                  <span className="text-amber-500 font-bold tracking-widest uppercase">
                    {splashLoadingProgress < 100 ? (isRtl ? 'جاري الاتصال الآمن...' : 'ESTABLISHING SECURE STREAM...') : (isRtl ? 'اكتمل التحميل' : 'LOADED SUCCESS')}
                  </span>
                  <span className="text-slate-450 font-bold">{Math.round(splashLoadingProgress)}%</span>
                </div>
              </div>

              {/* Micro copy and Arabic footer details */}
              <div className="space-y-1.5 opacity-60">
                <p className="text-[12px] font-black tracking-widest text-white uppercase font-mono">
                  KORAFLIX ENTERTAINMENT NETWORK
                </p>
                <p className="text-[10px] text-slate-500">
                  {isRtl ? 'رقم الإيداع الفني والمصادقة الحيوية لمكافحة القرصنة نشطة' : 'Corporate Brand Certification Secured & Registered'}
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
