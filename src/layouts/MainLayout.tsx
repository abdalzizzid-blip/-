import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Film, Home, Search, Heart, User, Shield, LogOut, Menu, X, Settings, Tv, Flame, Crown, Sparkles, Compass, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { lang, dir, t, setLang } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearchQuery)}`);
      setSearchOpen(false);
      setQuickSearchQuery('');
    }
  };

  const navItems = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/discover', label: lang === 'ar' ? 'اكتشاف' : 'Discover', icon: Compass },
    { to: '/movies', label: t('moviesNav'), icon: Film },
    { to: '/tv-series', label: t('tvSeriesNav'), icon: Tv },
    { to: '/search?sort=popular', label: t('mostWatchedNav'), icon: Flame },
    { to: '/watchlist', label: t('watchlistNav'), icon: Heart },
    { to: '/profile', label: t('profileNav'), icon: User },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const isRtl = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col antialiased selection:bg-rose-600/30 selection:text-white">
      {/* Top Banner Ticker */}
      <div className={`transition-all duration-300 text-center py-1.5 px-4 text-[10px] sm:text-[11px] font-black tracking-wide text-white uppercase select-none flex items-center justify-center gap-2 overflow-hidden shrink-0 ${
        isOnline 
          ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500' 
          : 'bg-amber-600 border-b border-amber-500/30'
      }`}>
        <span className={`flex h-2 w-2 rounded-full bg-white shrink-0 ${isOnline ? 'animate-pulse' : 'animate-ping'}`} />
        <span>
          {isOnline 
            ? t('welcomeBanner') 
            : (lang === 'ar' ? '⚠️ وضع تصفح الطوارئ (دون اتصال) نشط حالياً - العرض من الذاكرة الاحتياطية' : '⚠️ Off-grid Sandbox Mode active - Streaming metadata from local buffer')}
        </span>
      </div>

      {/* Primary Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo - Styled premium, minimal gold + dark cinematic */}
          <div className="flex items-center gap-3.5 shrink-0 select-none">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-gradient-to-br from-amber-500 to-amber-400 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/20">
                <Crown className="h-5 w-5 text-slate-950 fill-slate-950" />
              </div>
              <span className="text-xl font-black font-mono tracking-tighter bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
                KORA<span className="text-amber-500 font-extrabold text-shadow-amber font-sans">FLIX</span>
              </span>
            </Link>

            {/* Glowing Brand Guideline Access badge */}
            <Link
              to="/brand"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 hover:bg-amber-500/15 text-[10px] font-black tracking-widest text-[#D4AF37] transition-all duration-300 shadow-md animate-pulse shrink-0"
              title={lang === 'ar' ? 'عرض الهوية البصرية VIP' : 'Explore VIP Brand Guide'}
            >
              <Sparkles className="h-3 w-3 animate-spin duration-5000" />
              <span>{lang === 'ar' ? 'الهوية الممتازة' : 'CORE BRAND VIP'}</span>
            </Link>
          </div>

          {/* Desktop NavLinks */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-rose-600/10 text-rose-500 shadow-sm border border-rose-500/10'
                        : 'text-slate-450 hover:text-white hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User & Search Controls with Language Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Inline Offline Status Indicator */}
            {!isOnline && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/10 border border-rose-500/20 text-[10px] font-black text-rose-500 animate-pulse shrink-0">
                <WifiOff className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'دون اتصال' : 'OFFLINE'}</span>
              </span>
            )}

            {/* Language Switch Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 transition-all duration-200 flex items-center gap-1 select-none shadow-inner"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <span>🌐</span>
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Quick Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-xl transition-all duration-200 ${searchOpen ? 'bg-rose-600/10 text-rose-500 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              title={t('search')}
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Admin Quick panel */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-md shadow-emerald-950/20"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{t('adminPanel')}</span>
                  </Link>
                )}

                {/* Profile Widget */}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'}
                    alt={user.displayName || 'Profile'}
                    className="h-8.5 w-8.5 rounded-full object-cover border border-slate-800 group-hover:border-rose-500 transition-all duration-300 shadow-md shadow-black"
                  />
                  <span className="hidden sm:inline text-xs font-black text-slate-300 group-hover:text-white max-w-[80px] truncate leading-tight">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-900 transition-all cursor-pointer"
                  title={t('signOut')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition-all shadow-md shadow-rose-600/20"
              >
                {t('signIn')}
              </Link>
            )}

            {/* Mobile Nav Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Global Search Overlay (Styled smooth and elegant) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-0 right-0 z-40 bg-slate-950/95 border-b border-slate-800/80 p-4 shadow-xl shadow-black/90 backdrop-blur-md"
          >
            <form onSubmit={handleQuickSearch} className="max-w-3xl mx-auto relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-rose-500/50 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all font-medium placeholder-slate-500"
                autoFocus
              />
              <button
                type="submit"
                className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors`}
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer (Sliding Menu) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              initial={{ x: isRtl ? -280 : 280 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? -280 : 280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 bottom-0 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} w-72 bg-slate-950 border-slate-900 p-6 flex flex-col gap-6 shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black tracking-widest text-slate-450 uppercase">{t('filtersLabel')}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-450 hover:text-white hover:bg-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? 'bg-rose-600/10 text-rose-500 shadow-sm border border-rose-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                        isActive
                          ? 'bg-emerald-600/10 text-emerald-500 shadow-sm border border-emerald-500/10'
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <Shield className="h-4.5 w-4.5 shrink-0" />
                    <span>{t('adminPanel')}</span>
                  </NavLink>
                )}                
              </div>

              <div className="mt-auto border-t border-slate-900 pt-4 flex flex-col gap-3">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900/50 hover:bg-rose-600/15 text-slate-350 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-xs font-bold transition-all cursor-pointer shadow-inner"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('signOut')}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition-all shadow-md shadow-rose-600/20"
                  >
                    {t('signIn')}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Body Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:px-8 pb-24 md:pb-8 flex flex-col justify-start">
        {children}
      </main>

      {/* Cinema-themed Footer */}
      <footer className="shrink-0 mt-12 bg-slate-950 border-t border-slate-900/40 py-8 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 font-medium">
            {t('portalCopyright')}
          </div>
          <div className="flex gap-4 font-black tracking-wide text-slate-450 items-center">
            <span className="hover:text-rose-500 cursor-pointer transition-colors">{t('privacyPolicy')}</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">{t('termsOfService')}</span>
            <Link to="/brand" className="hover:text-amber-400 text-amber-500 transition-colors font-black uppercase tracking-wider text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ⚡ {lang === 'ar' ? 'الهوية البصرية VIP' : 'Brand Identity VIP'}
            </Link>
            <span className="hover:text-amber-500 cursor-pointer transition-colors text-slate-600">{t('theatreModeActive')}</span>
          </div>
        </div>
      </footer>

      {/* Bottom Nav Bar (Explicit Mobile-view Drawer Menu for instant Native Vibe!) */}
      <div className="fixed bottom-0 left-0 right-0 z-35 bg-slate-950/90 backdrop-blur-lg border-t border-slate-900 py-2.5 px-4 flex md:hidden justify-around items-center text-slate-400 text-center select-none shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <NavLink
          to="/"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9px] font-black tracking-wide ${isActive ? 'text-rose-500 scale-105' : 'text-slate-500'} transition-all`}
        >
          <Home className="h-5 w-5" />
          <span>{t('home')}</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9px] font-black tracking-wide ${isActive ? 'text-rose-500 scale-105' : 'text-slate-500'} transition-all`}
        >
          <Search className="h-5 w-5" />
          <span>{t('search')}</span>
        </NavLink>
        <NavLink
          to="/watchlist"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9px] font-black tracking-wide ${isActive ? 'text-rose-500 scale-105' : 'text-slate-500'} transition-all`}
        >
          <Heart className="h-5 w-5" />
          <span>{t('watchlist')}</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9px] font-black tracking-wide ${isActive ? 'text-rose-500 scale-105' : 'text-slate-500'} transition-all`}
        >
          <User className="h-5 w-5" />
          <span>{t('profile')}</span>
        </NavLink>
      </div>
    </div>
  );
};
