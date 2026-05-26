import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Film, User, Mail, Lock, ShieldAlert, AlertTriangle, ArrowRight, Chrome } from 'lucide-react';

export const LoginRegister: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t, dir } = useLanguage();
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(isRtl ? 'جميع الحقول مطلوبة لإجراء المصادقة بنجاح.' : 'All credential fields are required.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'login') {
        await signIn(email.trim(), password.trim());
      } else {
        if (!displayName.trim()) {
          setErrorMsg(isRtl ? 'الاسم الكامل مطلوب لإنشاء الحساب الجديد.' : 'Display name is required for registration.');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password.trim(), displayName.trim());
      }
      // Successful auth
      navigate(from, { replace: true });
    } catch (e: any) {
      setErrorMsg(e.message || (isRtl ? 'حدث خطأ في المصادقة. يرجى التحقق من البريد الإلكتروني وكلمة المرور بشكل صحيح.' : 'Authentication failed. Please verify username and passwords.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`py-12 md:py-20 flex justify-center items-center ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden dark:glass-panel">
        
        {/* Glow backlight decor */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 z-10" />

        {/* Branding header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-1.5 justify-center">
            <div className="bg-rose-600 p-2 rounded-xl">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black font-mono tracking-tighter text-white">
              KORA<span className="text-rose-500">FLIX</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-white mt-3">
            {isRtl ? 'مرحباً بك في مسرح كورا فليكس' : 'Welcome to Cinema Theater'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRtl ? 'سجل دخولك لمزامنة قائمة بوابتك المفضلة وسجل البث المباشر الموثق.' : 'Sign in to sync watchlist items and streaming history logs.'}
          </p>
        </div>

        {/* Local session error notifications */}
        {errorMsg && (
          <div className={`bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${isRtl ? 'text-right' : 'text-left'} leading-relaxed`}>
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab switches */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850 select-none">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/15'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/15'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isRtl ? 'إنشاء حساب' : 'Register'}
          </button>
        </div>

        {/* Main form */}
        <form onSubmit={handleAuthSubmit} className={`space-y-4 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
          
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">
                {isRtl ? 'اسم العرض الكامل' : 'Display Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isRtl ? 'أدخل اسمك الكريم هنا...' : 'Enter your name...'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-semibold`}
                  required={activeTab === 'register'}
                />
                <User className={`h-4 w-4 text-slate-500 absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">
              {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-semibold`}
                required
              />
              <Mail className={`h-4 w-4 text-slate-500 absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">
              {isRtl ? 'كلمة المرور السرية' : 'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-xs text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-semibold`}
                required
              />
              <Lock className={`h-4 w-4 text-slate-500 absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 leading-none select-none active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? (isRtl ? 'جاري التحقق...' : 'Processing...') : activeTab === 'login' ? (isRtl ? 'الدخول للحساب' : 'Access Account') : (isRtl ? 'إنشاء حساب جديد' : 'Get Started Now')}</span>
            <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {/* Divider separator */}
        <div className="relative flex items-center justify-center my-3 select-none">
          <div className="absolute inset-x-0 h-px bg-slate-800" />
          <span className="relative px-3 bg-slate-900 text-[9px] font-black uppercase text-slate-400 tracking-wider">
            {isRtl ? 'أو المتابعة والمزامنة بلمسة واحدة عبر' : 'Or Sync securely with'}
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={async () => {
            setErrorMsg('');
            setLoading(true);
            try {
              await signInWithGoogle();
              navigate(from, { replace: true });
            } catch (err: any) {
              setErrorMsg(err.message || 'Google Sign-In failed.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Chrome className="h-4 w-4 text-rose-500 animate-pulse" />
          <span>{isRtl ? 'تسجيل دخول عبر GOOGLE' : 'Continue with Google'}</span>
        </button>

        {/* Demo Fallback Note */}
        <div className="flex gap-2.5 items-start bg-slate-950 border border-slate-850 p-4 rounded-xl text-left leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-right w-full">
            <span className="text-[10px] font-black uppercase text-amber-400 block">
              {isRtl ? 'حفظ المزامنة المباشرة' : 'Cloud Sync & Persistence'}
            </span>
            <p className="text-[10px] text-slate-500 leading-normal">
              {isRtl 
                ? 'عند تسجيل الدخول، يتم تخزين وحفظ قائمتك المفضلة وتاريخ مشاهداتك بشكل فوري في قاعدة بيانات Cloud Firestore لسهولة استدعائها لاحقاً.' 
                : 'Sign in with your Google Account to automatically synchronize your viewing history and custom watchlist directly to the provisioned Firestore system.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
