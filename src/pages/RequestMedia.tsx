import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db, isFirebaseAvailable, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { 
  MessageSquarePlus, 
  Film, 
  Tv, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trash2, 
  ListOrdered,
  PlusCircle, 
  Inbox,
  AlertCircle
} from 'lucide-react';

interface MediaRequest {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  category: string;
  year: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  adminNotes?: string;
}

export const RequestMedia: React.FC = () => {
  const { user } = useAuth();
  const { lang, t, dir } = useLanguage();
  const isRtl = lang === 'ar';

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [category, setCategory] = useState('Action');
  const [year, setYear] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Requests queue state
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Fallback Local Storage requests list (for Guest users or broken firebase connection)
  const getLocalRequests = (): MediaRequest[] => {
    const saved = localStorage.getItem('koraflix_media_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'req-preset-1',
        title: isRtl ? 'ولاد رزق ٣: القاضية' : 'Welad Rizk 3: El Qadyah',
        type: 'movie',
        category: 'Action',
        year: '2024',
        notes: isRtl ? 'نرجو توفير جودة 4k مع الترجمة الإنجليزية' : 'Please provide 4K quality with English subs',
        status: 'approved',
        userId: 'some-uid-1',
        userName: isRtl ? 'بدر العتيبي' : 'Bader Al-Otaibi',
        userEmail: 'bader@koraflix.com',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        adminNotes: isRtl ? 'تم الرفع على خادم الرياض الممتاز بدقة UHD!' : 'Uploaded to premium servers in UHD!'
      },
      {
        id: 'req-preset-2',
        title: isRtl ? 'البحث عن علا' : 'Finding Ola S2',
        type: 'tv',
        category: 'Drama',
        year: '2024',
        notes: isRtl ? 'الموسم الثاني كامل لو سمحتوا' : 'The complete second season please.',
        status: 'pending',
        userId: 'some-uid-2',
        userName: isRtl ? 'روان الدوسري' : 'Rawan Al-Dossary',
        userEmail: 'rawan@koraflix.com',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ];
  };

  // Fetch Requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    if (isFirebaseAvailable && db && user) {
      try {
        const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const docsList: MediaRequest[] = [];
        snap.forEach((d) => {
          docsList.push({ id: d.id, ...d.data() } as MediaRequest);
        });
        setRequests(docsList);
      } catch (err) {
        console.warn("Firestore error reading requests, falling back to Local Storage:", err);
        setRequests(getLocalRequests());
      } finally {
        setLoadingRequests(false);
      }
    } else {
      setRequests(getLocalRequests());
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!user) {
      setToastMessage({
        text: isRtl ? 'عذراً، يجب تسجيل الدخول أولاً لإرسال طلبك!' : 'Sorry, you must sign in first to request titles!',
        success: false
      });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setSubmitting(true);

    const newRequest: Omit<MediaRequest, 'id'> = {
      title: title.trim(),
      type,
      category,
      year: year.trim() || new Date().getFullYear().toString(),
      notes: notes.trim(),
      status: 'pending',
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Kora Member',
      userEmail: user.email || 'guest@koraflix.com',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseAvailable && db) {
      try {
        await addDoc(collection(db, 'requests'), newRequest);
        setToastMessage({
          text: isRtl ? 'تم إرسال طلبك بنجاح وسيدرسه المشرفون قريباً! 🚀' : 'Request submitted successfully! Admins will review it soon! 🚀',
          success: true
        });
        setTitle('');
        setYear('');
        setNotes('');
        fetchRequests();
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'requests');
        } catch (wrappedErr: any) {
          console.error("Firestore Write failure:", wrappedErr);
          // Fallback to local storage write
          saveToLocal(newRequest);
        }
      } finally {
        setSubmitting(false);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } else {
      // Local backup flow
      saveToLocal(newRequest);
      setSubmitting(false);
    }
  };

  const saveToLocal = (reqData: Omit<MediaRequest, 'id'>) => {
    const fresh: MediaRequest = {
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      ...reqData
    };
    const current = getLocalRequests();
    const updated = [fresh, ...current];
    localStorage.setItem('koraflix_media_requests', JSON.stringify(updated));
    setRequests(updated);
    setToastMessage({
      text: isRtl ? 'مزامنة محلية: تم حفظ طلبك وسيبحثه الفنيون! ✈️' : 'Local sync: Request recorded in browser storage! ✈️',
      success: true
    });
    setTitle('');
    setYear('');
    setNotes('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Admin approval/rejection handler
  const handleAdminAction = async (reqId: string, flag: 'approved' | 'rejected') => {
    if (user?.role !== 'admin') return;

    const feedbackText = prompt(
      isRtl 
        ? 'أدخل ملاحظات المشرف الفنية حول العمل (مثال: متوفر الآن بدقة 4K):' 
        : 'Enter admin review notes (e.g. Now available in high definition):'
    ) || '';

    if (isFirebaseAvailable && db && !reqId.startsWith('req-preset-')) {
      try {
        const docRef = doc(db, 'requests', reqId);
        await updateDoc(docRef, {
          status: flag,
          adminNotes: feedbackText
        });
        setToastMessage({
          text: isRtl ? 'تم تحديث حالة طلب العمل بنجاح!' : 'Media request status updated successfully!',
          success: true
        });
        fetchRequests();
      } catch (err) {
        console.error("Admin write error on Firestore:", err);
      }
    } else {
      // Local storage modification fallback
      const current = [...requests];
      const foundIdx = current.findIndex(r => r.id === reqId);
      if (foundIdx !== -1) {
        current[foundIdx] = {
          ...current[foundIdx],
          status: flag,
          adminNotes: feedbackText
        };
        localStorage.setItem('koraflix_media_requests', JSON.stringify(current));
        setRequests(current);
        setToastMessage({
          text: isRtl ? 'تم تحديث البيانات بالذاكرة المحلية بنجاح!' : 'Local requests list updated!',
          success: true
        });
      }
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-10" dir={dir}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2.5 ${
              toastMessage.success
                ? 'bg-emerald-950/95 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-950/95 border-rose-500/20 text-rose-400'
            }`}
          >
            <Sparkles className="h-4 w-4 animate-spin shrink-0" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-955/10 to-slate-900 border border-slate-900 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className={`space-y-2 text-center md:text-start ${isRtl ? 'md:text-right' : ''}`}>
          <div className="inline-flex items-center gap-2 bg-rose-600/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF003F]">
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{isRtl ? 'اتصل بمنتجي المحتوى' : 'CATALOG SUGGESTIONS OFFICE'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
            {isRtl ? 'طلب الأفلام والمسلسلات الفخمة' : 'Request Exclusive Movies & Shows'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {isRtl 
              ? 'هل تبحث عن مسلسل درامي مخصص أو فيلم حركة هوليودي أو كلاسيكية سينمائية لم تدرج بعد بالكتالوج؟ اطلب العمل فوراً وسيقوم مشرفو كورا فليكس بتوفيره بمصادر بث عالية الدقة.'
              : 'Can\'t find your favorite drama series, blockbuster action movies, or animation masterpieces in our lists? Submit a request and our staff will buffer it securely on fast servers.'}
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950/80 border border-slate-900 shadow-xl group hover:border-rose-500/40 transition-colors shrink-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Inbox className="h-8 w-8 text-rose-500" />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Request form: 5 cols */}
        <div className="lg:col-span-5 bg-[#121212] border-2 border-slate-900 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl relative">
          <div className="flex items-center gap-3 border-b border-slate-900 pb-4 justify-between flex-row-reverse" dir={dir}>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="text-base font-black text-white">
                {isRtl ? 'إنشاء طلب جديد' : 'New Catalog Submission'}
              </h2>
            </div>
            <PlusCircle className="h-5 w-5 text-slate-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400">
                {isRtl ? 'اسم العمل الفني المطلوب (عربي/إنجليزي):' : 'Requested Title Name (AR/EN):'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRtl ? 'مثال: فيلم ولاد رزق ٣، مسلسل الحشاشين...' : 'e.g. Interstellar, Breaking Bad...'}
                className="w-full bg-slate-950/80 border-2 border-slate-900 focus:outline-none focus:border-rose-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500/10 font-bold transition-all"
              />
            </div>

            {/* Media Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400">
                {isRtl ? 'نوع التصنيف العريض:' : 'Format ClassificationType:'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setType('movie')}
                  className={`py-3 px-4 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    type === 'movie'
                      ? 'bg-rose-600/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Film className="h-4 w-4" />
                  <span>{isRtl ? 'فيلم سينمائي' : 'Movie Feature'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('tv')}
                  className={`py-3 px-4 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    type === 'tv'
                      ? 'bg-rose-600/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  <span>{isRtl ? 'مسلسل تلفزيوني' : 'TV Series'}</span>
                </button>
              </div>
            </div>

            {/* Category / Genre & Year */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400">
                  {isRtl ? 'تصنيف المادة:' : 'Primary Genre:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-xs font-bold rounded-xl px-3 py-3 text-slate-300 focus:outline-none focus:border-rose-500/40 cursor-pointer"
                >
                  <option value="Action">{isRtl ? 'حركة واكشن' : 'Action'}</option>
                  <option value="Drama">{isRtl ? 'دراما اجتماعية' : 'Drama'}</option>
                  <option value="Comedy">{isRtl ? 'كوميدي ضاحك' : 'Comedy'}</option>
                  <option value="Horror">{isRtl ? 'رعب وإثارة' : 'Horror'}</option>
                  <option value="Sci-Fi">{isRtl ? 'خيال علمي وإثارة' : 'Sci-Fi'}</option>
                  <option value="Arabic">{isRtl ? 'أعمال عربية' : 'Arabic Local'}</option>
                  <option value="Documentary">{isRtl ? 'فيلم وثائقي' : 'Documentary'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400">
                  {isRtl ? 'سنة الإنتاج (اختياري):' : 'Production Year:'}
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full bg-slate-950/80 border border-slate-900 focus:outline-none focus:border-rose-600/50 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-rose-500/10 font-bold transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400">
                {isRtl ? 'ملاحظات المشاهد والروابط المساعدة:' : 'Viewer Notes / Additional Links:'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={isRtl ? 'ضع ملاحظاتك حول الجودة، الحلقات، روابط TMDB أو أي تفاصيل مساعدة هنا...' : 'Highlight desired season episode numbers, preferred subtitles languages, or catalog references...'}
                className="w-full bg-slate-950 border border-slate-900 focus:outline-none focus:border-rose-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-medium"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-650 disabled:bg-rose-950 disabled:text-slate-500 text-white font-black text-xs sm:text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer select-none shadow-lg shadow-rose-955/20 mt-4"
            >
              {submitting ? (
                <span className="h-4 w-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>
                {submitting 
                  ? (isRtl ? 'جاري إرسال الطلب...' : 'Submitting Submission...') 
                  : (isRtl ? 'إرسال طلب العمل للكتالوج ⚡' : 'Submit Request Now ⚡')
                }
              </span>
            </button>
            
            {!user && (
              <div className="flex items-center gap-2 bg-rose-500/5 rounded-xl p-3 border border-rose-500/10 mt-3 text-[10px] text-rose-400 leading-relaxed justify-end text-right">
                <span>{isRtl ? '⚠️ الرجاء تسجيل الدخول لحسابك لكتابة وحفظ الطلب للتتبع المستمر.' : '⚠️ Login needed to securely post and persist your catalog suggestions.'}</span>
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              </div>
            )}
          </form>
        </div>

        {/* Requests Queue: 7 cols */}
        <div className="lg:col-span-7 bg-[#121212] border-2 border-slate-900 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 flex-row-reverse" dir={dir}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <h2 className="text-base font-black text-white">
                {isRtl ? 'قائمة الطلبات الجارية وتحديثات المشرفين' : 'Active Requests Queue & Updates'}
              </h2>
            </div>
            <ListOrdered className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-4">
            {loadingRequests ? (
              <div className="py-24 text-center text-slate-500 space-y-3.5">
                <div className="h-6 w-6 border-2 border-rose-550 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold">{isRtl ? 'جاري الاتصال وسحب قائمة طلبات الأعضاء...' : 'Retrieving public movies request queue...'}</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-20 text-center text-slate-500 space-y-3">
                <Inbox className="h-10 w-10 mx-auto text-slate-700" />
                <p className="text-xs font-bold">{isRtl ? 'لا توجد طلبات جارية حالياً. كن أول من يطلب عملاً اليوم!' : 'Queue is currently empty! Submit the first recommendation.'}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {requests.map((req) => {
                  const reqDate = new Date(req.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');
                  return (
                    <div 
                      key={req.id} 
                      className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900 flex flex-col sm:flex-row items-start justify-between gap-4 text-right sm:text-right hover:border-slate-800 transition-all"
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      <div className="space-y-2 flex-1 w-full">
                        {/* Title & Badge Header */}
                        <div className="flex items-start justify-between gap-2.5 w-full">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-black tracking-wide uppercase text-slate-400">
                              {req.type === 'movie' ? <Film className="h-2.5 w-2.5" /> : <Tv className="h-2.5 w-2.5" />}
                              <span>{req.type === 'movie' ? (isRtl ? 'فيلم' : 'Movie') : (isRtl ? 'مسلسلات' : 'TV Show')} • {req.category}</span>
                            </span>
                            <h3 className="text-sm font-black text-white leading-tight">
                              {req.title} <span className="text-slate-500 font-mono text-[11px]">({req.year})</span>
                            </h3>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {req.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>{isRtl ? 'تم القبول' : 'Approved'}</span>
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[10px] font-black">
                                <XCircle className="h-3 w-3 shrink-0" />
                                <span>{isRtl ? 'مرفوض' : 'Rejected'}</span>
                              </span>
                            )}
                            {req.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{isRtl ? 'قيد المراجعة' : 'Pending'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Optional user Notes */}
                        {req.notes && (
                          <p className="text-xs text-slate-400 font-medium bg-slate-950 p-2.5 rounded-xl border border-slate-900/40">
                            {req.notes}
                          </p>
                        )}

                        {/* Admin responses */}
                        {req.adminNotes && (
                          <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/15 text-[10px] sm:text-xs">
                            <p className="text-rose-450 font-black mb-1 flex items-center gap-1 cursor-default">
                              <Sparkles className="h-3 w-3 text-[#FF003F]" />
                              <span>{isRtl ? 'رد من المشرفين:' : 'Staff response:'}</span>
                            </p>
                            <p className="text-slate-300 font-bold leading-relaxed">{req.adminNotes}</p>
                          </div>
                        )}

                        {/* Submitter & Date Info Footer */}
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 font-bold pt-1 border-t border-slate-900/50">
                          <span>{isRtl ? 'بواسطة:' : 'By:'} {req.userName}</span>
                          <span>{reqDate}</span>
                        </div>

                        {/* Admin Action Control Panels */}
                        {user?.role === 'admin' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-900 justify-end w-full">
                            <span className="text-[10px] font-black text-rose-500 font-mono tracking-wider me-auto bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded cursor-default uppercase">
                              ADMIN ACCESS ACTIVE
                            </span>
                            
                            <button
                              onClick={() => handleAdminAction(req.id, 'rejected')}
                              disabled={req.status === 'rejected'}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-md disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850"
                            >
                              {isRtl ? 'رفض الطلب ✖' : 'Reject ✖'}
                            </button>
                            <button
                              onClick={() => handleAdminAction(req.id, 'approved')}
                              disabled={req.status === 'approved'}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-md disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850"
                            >
                              {isRtl ? 'قبول ونشر ✓' : 'Approve ✓'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
