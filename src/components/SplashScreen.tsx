import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Volume2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [muted, setMuted] = useState(false);

  // Play corporate luxury streaming audio chime
  const playLuxuryChime = () => {
    try {
      if (muted) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      
      // Master Gain setup
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.25);
      masterGain.gain.setValueAtTime(0.4, ctx.currentTime + 1.0);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      masterGain.connect(ctx.destination);

      // Low foundation warm cinematic rumble (C2 @ 65Hz)
      const rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(65.41, ctx.currentTime);
      
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.45, ctx.currentTime);
      rumbleOsc.connect(rumbleGain).connect(masterGain);
      
      // Luxurious cinematic champagne chord (C4, E4, G4, B4, D5)
      const frequencies = [261.63, 329.63, 392.00, 493.88, 587.33];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const delay = idx * 0.1; // arpeggiated swipe
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        // Subtle pitch glide mimicking an orchestra warming up/focusing
        osc.frequency.exponentialRampToValueAtTime(freq * 1.005, ctx.currentTime + delay + 1.2);
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.002, ctx.currentTime + delay);
        oscGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + delay + 0.2);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.2);
        
        osc.connect(oscGain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 2.8);
      });

      // Shimmering golden dust high-pass chime sweep
      const shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(1200, ctx.currentTime + 0.5);
      shimmerOsc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 1.6);
      
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.001, ctx.currentTime + 0.5);
      shimmerGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.7);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      
      shimmerOsc.connect(shimmerGain).connect(masterGain);

      rumbleOsc.start();
      shimmerOsc.start();
      
      rumbleOsc.stop(ctx.currentTime + 2.8);
      shimmerOsc.stop(ctx.currentTime + 2.8);
    } catch (err) {
      console.warn("Chime blocked by browser gesture rules.", err);
    }
  };

  useEffect(() => {
    // Stage 1: Fast initial glow
    const t1 = setTimeout(() => {
      setStep(1);
      // Play sound directly on user activity or immediately
      playLuxuryChime();
    }, 400);

    // Stage 2: Split golden arcs and cinema beam expansion
    const t2 = setTimeout(() => {
      setStep(2);
    }, 1200);

    // Stage 3: Majestic reveal of Kufic calligraphy "كورا فليكس"
    const t3 = setTimeout(() => {
      setStep(3);
    }, 2000);

    // Stage 4: Zoom & fade screen
    const t4 = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#030408] flex items-center justify-center overflow-hidden">
      {/* Absolute Dark Cinematic Canvas Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,9,19,0.9),rgba(3,4,8,1))] z-0" />
      
      {/* Micro Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#080c18_1px,transparent_1px),linear-gradient(to_bottom,#080c18_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {/* Cinematic Golden Ambient Flares */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
      />
      <div className="absolute w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] top-1/3 left-1/3 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-lg px-6">
        
        {/* Animated Kora Logo sphere container */}
        <div className="relative flex items-center justify-center">
          
          {/* External Rotating Cinematic Ribbon */}
          <motion.div 
            initial={{ scale: 0.1, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 45, damping: 12, delay: 0.1 }}
            className="w-36 h-36 rounded-full border border-dashed border-amber-500/20 flex items-center justify-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t border-b border-t-amber-500/40 border-b-amber-500/10"
            />
          </motion.div>

          {/* Internal Glowing Crown / Emblem */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, delay: 0.3 }}
            className="absolute rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-4 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
          >
            <Crown className="h-10 w-10 text-slate-950 fill-slate-950 stroke-1" />
          </motion.div>

          {/* Sparkling Gold Dust points */}
          {step >= 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1.8, opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"
            />
          )}
        </div>

        {/* Cinematic Text Reveal Frame */}
        <div className="space-y-4">
          
          {/* App Title - Latin */}
          <h1 className="overflow-hidden relative leading-tight">
            <motion.span
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="inline-block text-4xl font-black tracking-widest font-mono text-white"
            >
              KORA<span className="text-amber-500 text-shadow-amber font-sans">FLIX</span>
            </motion.span>
          </h1>

          {/* Luxurious Kufic Calligraphy Placeholder/Label */}
          <div className="h-8 overflow-hidden relative">
            {step >= 2 && (
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-lg font-black text-amber-500 tracking-wider font-sans select-none"
              >
                كورا فليكس
              </motion.p>
            )}
          </div>

          {/* Micro Slogan */}
          <div className="h-5 overflow-hidden relative">
            {step >= 3 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block"
              >
                {/* Sparkles */}
                <Sparkles className="h-3 w-3 inline mr-1 text-amber-500 animate-spin" />
                <span>Luxury Arabic-First Streaming</span>
              </motion.span>
            )}
          </div>

        </div>

        {/* Infinite loading progress bar mimicking Netflix's dynamic zoom effect */}
        <div className="w-48 bg-slate-950 h-[3px] rounded-full overflow-hidden border border-slate-900 absolute bottom-12 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_8px_rgba(212,175,55,1)]"
          />
        </div>

        {/* Optional Manual play trigger for the beautiful brand audio chord if browser gesture blocks */}
        <button
          onClick={playLuxuryChime}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer backdrop-blur opacity-50 hover:opacity-100 transition-all select-none"
        >
          <Volume2 className="h-3 w-3" />
          <span>Play Cinematic Sound</span>
        </button>

      </div>
    </div>
  );
};
