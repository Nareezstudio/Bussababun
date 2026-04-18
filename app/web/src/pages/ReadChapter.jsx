import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Coins, Lock, ChevronLeft, ChevronRight, 
  Loader2, Home, CreditCard, X, Plus, Minus, List
} from 'lucide-react';
import api from '../api/axios';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext'; 
import { toast } from 'react-hot-toast';

const ReadChapter = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth(); 

  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]); // สำหรับ Drawer รายชื่อตอน
  const [navigation, setNavigation] = useState({ prev: null, next: null, isNextLocked: false });
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showControls, setShowControls] = useState(false); // ควบคุมแถบเครื่องมือมือถือ
  const [showDrawer, setShowDrawer] = useState(false); // ควบคุมรายชื่อตอน

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('reader-settings');
    try {
      return saved ? JSON.parse(saved) : { fontSize: 18, theme: 'cream' };
    } catch (e) {
      return { fontSize: 18, theme: 'cream' };
    }
  });

  const [priceDetail, setPriceDetail] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const themeClasses = {
    white: "bg-white text-slate-900",
    cream: "bg-[#fcfaf7] text-slate-800",
    dark: "bg-[#1a1a1a] text-slate-300"
  };

  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(settings));
  }, [settings]);

  const updateFontSize = (delta) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(Math.max(prev.fontSize + delta, 14), 36)
    }));
  };

  const saveReadingHistory = useCallback(async (nId, cId) => {
    if (!user || !nId || !cId) return;
    try {
      await api.post('/user/reading-history', { 
        novelId: String(nId), 
        chapterId: String(cId) 
      });
    } catch (err) {
      console.warn("Reading history could not be saved");
    }
  }, [user]);

  const fetchPricePreview = useCallback(async () => {
    if (!chapterId) return;
    try {
      setIsCalculating(true);
      const res = await api.post('/purchases/preview-price', { chapterId });
      setPriceDetail(res.data.data);
    } catch (err) {
      console.error("Price Preview Error", err);
    } finally {
      setIsCalculating(false);
    }
  }, [chapterId]);

  const fetchChapterData = useCallback(async () => {
    try {
      setLoading(true);
      setShowAuthModal(false);
      setShowControls(false); 
      
      const res = await api.get(`/novels/chapters/${chapterId}`);
      // ตรวจสอบว่า Response ส่งข้อมูลมาถูกตำแหน่ง
      const { chapter: chapterData, prevChapterId, nextChapterId, isNextLocked, novelAuthorId } = res.data;
      
      setChapter(chapterData);
      setNavigation({ 
        prev: prevChapterId, 
        next: nextChapterId,
        isNextLocked: (user?.id && String(novelAuthorId) === String(user.id)) ? false : isNextLocked 
      });

      // --- จุดที่ต้องเช็กเพิ่ม ---
      const targetNovelId = chapterData?.novelId; // ดึง novelId จากตัวละครปัจจุบัน
      
      if (targetNovelId) {
        saveReadingHistory(targetNovelId, chapterId);
        
        // ดึงรายชื่อตอนทั้งหมดมาเก็บไว้ใน Drawer
        const chaptersRes = await api.get(`/novels/${targetNovelId}/chapters`);
        
        // ตรวจสอบโครงสร้างข้อมูลที่มาจาก API (บางที่อาจส่งเป็น { data: [...] } หรือ { chapters: [...] })
        const list = chaptersRes.data.chapters || chaptersRes.data.data || chaptersRes.data;
        setAllChapters(Array.isArray(list) ? list : []);
      }

    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setShowAuthModal(true);
        fetchPricePreview(); 
        const errorData = err.response.data;
        if (errorData?.chapter) setChapter(errorData.chapter);
        setNavigation({ 
          prev: errorData?.prevChapterId, 
          next: errorData?.nextChapterId,
          isNextLocked: errorData?.isNextLocked 
        });
      } else {
        toast.error("ไม่สามารถโหลดเนื้อหาได้");
      }
    } finally {
      setLoading(false);
    }
  }, [chapterId, user?.id, fetchPricePreview, saveReadingHistory]);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [chapterId, fetchChapterData]);

  const handleBuy = async () => {
    if ((user?.coins || 0) < (priceDetail?.finalPrice || 0)) {
      toast.error("เหรียญไม่พอ กรุณาเติมเงิน");
      return;
    }
    try {
      setIsCalculating(true);
      await api.post('/purchases/purchase', { chapterId });
      toast.success("ปลดล็อกสำเร็จ!");
      if (refreshUserData) await refreshUserData(); 
      await fetchChapterData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "การซื้อล้มเหลว");
    } finally {
      setIsCalculating(false);
    }
  };

  if (loading) return (
    <div className={`flex h-screen flex-col items-center justify-center ${themeClasses[settings.theme]}`}>
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="font-bold opacity-50 uppercase tracking-widest text-xs">กำลังเปิดหน้ากระดาษ...</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 font-sans ${themeClasses[settings.theme]}`}>
      
      {/* 🔐 Purchase Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           {/* ... โค้ด Modal เดิมของคุณ (ไม่เปลี่ยนแปลง) ... */}
           <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-8 text-center shadow-2xl relative animate-in zoom-in duration-300 text-slate-900">
            <button onClick={() => navigate(-1)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500"><X size={24} /></button>
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <Coins className="text-orange-500" size={32} />
            </div>
            <h2 className="text-xl font-black">ตอนพรีเมียม</h2>
            <p className="text-slate-400 text-sm mb-6 font-bold truncate px-4">{chapter?.title}</p>
            <div className="bg-slate-50 rounded-[2rem] p-5 mb-6 border border-slate-100">
              <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-orange-100">
                <span className="text-slate-800 font-bold text-sm">ราคาปลดล็อก</span>
                <div className="flex items-center gap-1 text-orange-600 font-black text-2xl">
                  {isCalculating ? <Loader2 className="animate-spin" size={20} /> : priceDetail?.finalPrice} <Coins size={20} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleBuy} disabled={isCalculating} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg">
                {isCalculating ? "กำลังจ่ายเหรียญ..." : `ยืนยันการซื้อ`}
              </button>
              <button onClick={() => navigate('/topup')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2">
                <CreditCard size={20} /> เติมเหรียญ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Mobile Floating Controls (แสดงเมื่อแตะหน้าจอ) */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[60] p-4 transition-transform duration-300 md:hidden ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className={`${settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-orange-100'} border shadow-2xl rounded-[2rem] p-5 flex flex-col gap-5`}>
          {/* ปรับขนาดตัวอักษร */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Font Size</span>
            <div className="flex items-center gap-4 bg-slate-500/10 rounded-full px-2 py-1">
              <button onClick={() => updateFontSize(-2)} className="p-2 hover:bg-white/20 rounded-full"><Minus size={20}/></button>
              <span className="font-black w-8 text-center">{settings.fontSize}</span>
              <button onClick={() => updateFontSize(2)} className="p-2 hover:bg-white/20 rounded-full"><Plus size={20}/></button>
            </div>
          </div>

          {/* ปรับธีมพื้นหลัง */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Theme</span>
            <div className="flex gap-4">
              {['white', 'cream', 'dark'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setSettings(s => ({...s, theme: t}))}
                  className={`w-10 h-10 rounded-full border-4 transition-all 
                    ${t === 'white' ? 'bg-white' : t === 'cream' ? 'bg-[#fcfaf7]' : 'bg-zinc-800'} 
                    ${settings.theme === t ? 'border-orange-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                />
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-500/10 w-full" />

          {/* ปุ่มรายชื่อตอน และ หน้าแรก */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowDrawer(true)} className="flex items-center justify-center gap-2 py-3 bg-orange-500/10 text-orange-600 rounded-2xl font-bold">
              <List size={20} /> รายชื่อตอน
            </button>
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 py-3 bg-slate-500/10 rounded-2xl font-bold">
              <Home size={20} /> หน้าแรก
            </button>
          </div>
        </div>
      </div>

      {/* 📖 Chapter List Drawer (Mobile) */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${showDrawer ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowDrawer(false)} />
        <div className={`absolute left-0 top-0 h-full w-[80%] max-w-[320px] bg-white text-slate-900 transition-transform duration-300 ${showDrawer ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-black text-lg">รายชื่อตอน</h3>
            <button onClick={() => setShowDrawer(false)}><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allChapters.map((ch, idx) => (
              <button 
                key={ch.id}
                onClick={() => { navigate(`/reader/${ch.id}`); setShowDrawer(false); }}
                className={`w-full p-4 rounded-2xl text-left flex items-center justify-between transition-colors ${ch.id === chapterId ? 'bg-orange-50 text-orange-600 font-bold border border-orange-100' : 'hover:bg-slate-50'}`}
              >
                <span className="truncate pr-2">{idx + 1}. {ch.title}</span>
                {ch.isLocked && <Lock size={14} className="opacity-40" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🛠️ Main Header (Desktop) */}
      <nav className={`sticky top-0 z-20 px-4 py-3 border-b hidden md:block transition-colors duration-500 
        ${settings.theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/90 border-orange-50 shadow-sm'} backdrop-blur-md`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(`/novel/${chapter?.novelId}`)} className="p-2 hover:bg-orange-500/10 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3 items-center">
            <div className="flex bg-slate-500/10 rounded-full p-1 gap-1">
              {['white', 'cream', 'dark'].map((t) => (
                <button key={t} onClick={() => setSettings(s => ({...s, theme: t}))}
                  className={`w-6 h-6 rounded-full border-2 ${t === 'white' ? 'bg-white' : t === 'cream' ? 'bg-[#fcfaf7]' : 'bg-slate-800'} ${settings.theme === t ? 'border-orange-500' : 'border-transparent opacity-40'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slate-500/10 rounded-full px-1">
              <button onClick={() => updateFontSize(-2)} className="p-1.5"><Minus size={16}/></button>
              <span className="text-[10px] font-black w-8 text-center">{settings.fontSize}</span>
              <button onClick={() => updateFontSize(2)} className="p-1.5"><Plus size={16}/></button>
            </div>
            <button onClick={() => navigate('/')} className="p-2"><Home size={20} /></button>
          </div>
        </div>
      </nav>

      {/* เนื้อหาหลัก */}
      <main className="max-w-3xl mx-auto px-6 py-12" onClick={() => setShowControls(!showControls)}>
        {chapter && (
          <>
            <header className="mb-12 border-b border-slate-500/10 pb-8 text-center pointer-events-none">
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{chapter.title}</h2>
              <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                <span>Size: {settings.fontSize}px</span>
                <span>Theme: {settings.theme}</span>
              </div>
            </header>

            <article 
              className={`max-w-none leading-[2.2] whitespace-pre-wrap font-serif mb-24 transition-all duration-700 
                ${showAuthModal ? 'opacity-10 blur-2xl select-none' : 'opacity-100'}`} 
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              {chapter.content ? (
                <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
              ) : (
                <p className="text-center opacity-50 italic py-10">ไม่พบเนื้อหาในตอนนี้</p>
              )}
            </article>

            {/* ปุ่มนำทาง (Prev/Next) */}
            <div className="flex flex-col md:flex-row gap-4 mb-20" onClick={(e) => e.stopPropagation()}>
              <button disabled={!navigation.prev} onClick={() => navigate(`/reader/${navigation.prev}`)} 
                className={`flex-1 p-5 rounded-3xl flex items-center justify-center gap-2 font-black border-2 transition-all
                  ${settings.theme === 'dark' ? 'border-white/10 hover:border-orange-50' : 'border-slate-100 hover:border-orange-200'}
                  disabled:opacity-20`}>
                <ChevronLeft size={20} /> ตอนก่อนหน้า
              </button>
              <button disabled={!navigation.next} onClick={() => navigate(`/reader/${navigation.next}`)} 
                className={`flex-1 p-5 rounded-3xl flex items-center justify-center gap-2 font-black shadow-xl transition-all active:scale-95
                  ${navigation.isNextLocked ? 'bg-amber-500' : 'bg-orange-500'} text-white disabled:opacity-20`}>
                {navigation.isNextLocked && <Lock size={18} />}
                {navigation.isNextLocked ? 'ปลดล็อกตอนถัดไป' : 'ตอนถัดไป'}
                {!navigation.isNextLocked && <ChevronRight size={20} />}
              </button>
            </div>

            {!showAuthModal && <div onClick={(e) => e.stopPropagation()}>
              <CommentSection novelId={chapter.novelId} chapterId={chapterId} />
            </div>}
          </>
        )}
      </main>
    </div>
  );
};

export default ReadChapter;