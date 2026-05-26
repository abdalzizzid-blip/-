import React, { useState, useEffect } from 'react';
import { adService } from '../services/adService';
import { AdBanner } from '../types';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface AdPlacementProps {
  position: 'top' | 'middle' | 'sidebar' | 'footer';
  className?: string;
}

export const AdBannerPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const { lang, t } = useLanguage();
  const isRtl = lang === 'ar';
  
  const [ad, setAd] = useState<AdBanner | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Load advertisements dynamically and filter matching active ones
    const allAds = adService.getAds();
    const activeAdsOfPosition = allAds.filter(a => a.position === position && a.isActive);
    
    if (activeAdsOfPosition.length > 0) {
      // Pick the first active ad, or randomly select one if multiple are active
      const randomAd = activeAdsOfPosition[Math.floor(Math.random() * activeAdsOfPosition.length)];
      setAd(randomAd);
    } else {
      setAd(null);
    }
  }, [position]);

  const handleAdClick = () => {
    if (ad) {
      adService.recordClick(ad.id);
    }
  };

  if (isDismissed || !ad) {
    return null;
  }

  // Styles vary beautifully based on position
  const getPositionStyles = () => {
    const hoverEffects = 'transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:shadow-rose-600/5 hover:border-rose-500/30 ';
    switch (position) {
      case 'top':
        return hoverEffects + 'w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-slate-900 bg-gradient-to-r from-rose-950/20 via-slate-950 to-[#12050b] p-1.5 md:p-2 shadow-xl';
      case 'middle':
        return hoverEffects + 'w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-slate-900 bg-gradient-to-r from-slate-950 via-[#101010] to-[#1a1410] p-1 shadow-2xl';
      case 'sidebar':
        return hoverEffects + 'w-full rounded-2xl overflow-hidden border border-slate-900 bg-gradient-to-b from-[#111] via-[#0b0b0b] to-[#120505] p-2 shadow-lg';
      case 'footer':
        return hoverEffects + 'w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border border-slate-900 bg-slate-950 p-2 shadow-xl';
      default:
        return hoverEffects + 'w-full rounded-xl overflow-hidden';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4 }}
        className={`relative group ${getPositionStyles()} ${className}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Ad Body Content Container */}
        <div className="relative overflow-hidden rounded-2xl bg-black">
          {/* Ad Image with high performance backdrop */}
          <a
            href={ad.targetUrl}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="block relative overflow-hidden aspect-[21/9] sm:aspect-[24/6] md:aspect-[32/8] lg:aspect-[38/7] w-full"
            style={position === 'sidebar' ? { aspectRatio: '4/5' } : {}}
          >
            <img
              src={ad.imageUrl}
              alt={ad.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out brightness-[0.7] group-hover:brightness-[0.8]"
            />
            
            {/* Ambient vignette background overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
            
            {/* Overlay Details */}
            <div className={`absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col justify-end text-right ${isRtl ? 'items-end' : 'items-start text-left'}`}>
              
              {/* Premium Sponsor Tag */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-600/90 text-white mb-2 shadow-md">
                <Sparkles className="h-3 w-3 animate-pulse" />
                {isRtl ? 'إعلان ممول VIP' : 'PRIME SPONSORSHIP'}
              </span>

              {/* Title */}
              <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white leading-tight max-w-2xl drop-shadow-md group-hover:text-rose-450 transition-colors">
                {ad.title}
              </h4>
              
              {/* Call to action hint */}
              <span className="mt-2 text-[10px] items-center gap-1.5 font-bold text-slate-300 group-hover:text-white flex border-b border-rose-500/20 group-hover:border-rose-500/80 pb-0.5 transition-all">
                <span>{isRtl ? 'انقر للاستكشاف والاشتراك' : 'Click to explore rewards'}</span>
                <ExternalLink className="h-3 w-3" />
              </span>

            </div>
          </a>

          {/* Absolute Dismiss Close Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 h-8 w-8 rounded-full bg-black/75 hover:bg-rose-600 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title={isRtl ? 'إغلاق الإعلان' : 'Dismiss Ad'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
