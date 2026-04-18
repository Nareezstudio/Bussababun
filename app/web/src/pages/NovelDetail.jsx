import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  PlayCircle, Coins, MessageSquare, 
  UserIcon, Lock, ChevronRight, BadgePercent,
  BookMarked, Heart 
} from 'lucide-react';
import PurchaseModal from '../components/novel/PurchaseModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const NovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUserData } = useAuth(); 
  
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  const currentUserId = user?.id || user?._id;

  // --- 🚀 Logic คำนวณโปรโมชั่น ---
  const getDiscountedPrice = useCallback((chapterPrice) => {
    if (!novel || !chapterPrice) return { finalPrice: chapterPrice, hasPromo: false };
    
    const activePromo = novel.activePromotion || (novel.promotions && novel.promotions[0]);
    if (!activePromo) return { finalPrice: chapterPrice, hasPromo: false };

    let finalPrice = chapterPrice;
    const discountVal = Number(activePromo.discountValue);

    if (activePromo.discountType === 'PERCENT') {
      finalPrice = Math.ceil(chapterPrice - (chapterPrice * (discountVal / 100)));
    } else {
      finalPrice = Math.max(0, chapterPrice - discountVal);
    }

    return {
      finalPrice: finalPrice,
      discountValue: discountVal,
      hasPromo: true
    };
  }, [novel]);

  const fetchNovel = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/novels/${id}`);
      setNovel(res.data);
      
      // ✅ Backend ตัวใหม่ควรส่งมาในชื่อ isFollowing หรือเช็คจากรายการ follow
      // ถ้า Backend ของคุณส่งค่ามาในชื่ออื่น ให้ปรับให้ตรงกันครับ
      setIsInLibrary(res.data.isFollowing || false);
    } catch (err) { 
      console.error("ดึงข้อมูลไม่สำเร็จ:", err);
      toast.error("ไม่สามารถโหลดข้อมูลนิยายได้");
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => {
    if (id) { fetchNovel(); }
  }, [id, fetchNovel]);

  // --- 📚 Logic จัดการชั้นหนังสือ (Add/Remove) ---
  const handleToggleLibrary = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มเข้าชั้นหนังสือ");
      return;
    }
    
    try {
      setIsLibraryLoading(true);
      // ✅ เปลี่ยนจาก /library เป็น /follow ตามที่เรายุบรวม Logic ไว้ที่ Backend
      const res = await api.post(`/novels/${id}/follow`);
      
      if (res.data.success) {
        // ✅ ใช้ค่า isFollowing จาก Backend มา set สถานะหน้าจอ
        setIsInLibrary(res.data.isFollowing);
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error("Toggle Library Error:", err);
      toast.error("ไม่สามารถดำเนินการได้ในขณะนี้");
    } finally {
      setIsLibraryLoading(false);
    }
  };

  // --- 🖱️ จัดการการคลิกตอนนิยาย ---
  const handleChapterClick = (chapter) => {
    const authorId = novel.author?.id || novel.authorId;
    const isAuthor = String(authorId) === String(currentUserId);
    const isBought = chapter.isPurchased === true;

    if (chapter.price === 0 || isBought || isAuthor) {
      navigate(`/reader/${chapter.id || chapter._id}`);
      return;
    }
    
    const promoInfo = getDiscountedPrice(chapter.price);
    setSelectedChapter({ 
      ...chapter,
      id: chapter.id || chapter._id,
      promoPrice: promoInfo.hasPromo ? promoInfo.finalPrice : null,
      hasPromo: promoInfo.hasPromo
    });
    setIsModalOpen(true);
  };

  // --- 💰 ยืนยันการซื้อ ---
  const handleConfirmPurchase = async (chapterId) => {
    try {
      await api.post('/chapters/purchase', { chapterId });
      setIsModalOpen(false);
      setSelectedChapter(null);
      toast.success("ปลดล็อกสำเร็จ!");
      
      if (refreshUserData) await refreshUserData();
      await fetchNovel(); 
    } catch (err) { 
      const errorMsg = err.response?.data?.message || "การซื้อล้มเหลว";
      toast.error(errorMsg); 
    }
  };

  if (loading || authLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  if (!novel) return <div className="text-center p-10 font-black text-slate-400">NOVEL NOT FOUND</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fadeIn pb-20">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12 bg-white p-6 md:p-8 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="w-full md:w-72 aspect-[3/4] bg-slate-100 rounded-[2.5rem] overflow-hidden shrink-0 shadow-2xl">
          <img src={novel.coverImage} className="w-full h-full object-cover" alt={novel.title} />
        </div>
        <div className="flex-1 flex flex-col z-10">
          <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-4 uppercase tracking-wider">
            {novel.category?.name || 'General'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 italic uppercase leading-tight">{novel.title}</h1>
          <p className="text-slate-500 mb-8 bg-slate-50/50 p-6 rounded-[2rem] text-sm leading-relaxed border border-slate-50">
            {novel.description}
          </p>

          {/* 🔘 Action Buttons (Read & Shelf) */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button 
              onClick={() => {
                const firstChapter = novel.chapters?.[0];
                if (firstChapter) handleChapterClick(firstChapter);
              }}
              className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-[1.5rem] shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
            >
              <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
              READ NOW
            </button>

            <button 
              onClick={handleToggleLibrary}
              disabled={isLibraryLoading}
              className={`flex-1 md:flex-none font-black px-8 py-4 rounded-[1.5rem] border-2 transition-all flex items-center justify-center gap-2 ${
                isInLibrary 
                ? 'bg-pink-50 border-pink-200 text-pink-500 shadow-sm' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'
              }`}
            >
              {isLibraryLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isInLibrary ? <Heart size={20} fill="currentColor" /> : <BookMarked size={20} />}
                  {isInLibrary ? 'IN SHELF' : 'ADD TO SHELF'}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden border-2 border-orange-100 shadow-sm">
               {novel.author?.profileImage ? <img src={novel.author.profileImage} className="w-full h-full object-cover" alt="author" /> : <UserIcon size={24} className="text-slate-300" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Author</p>
              <p className="text-base font-black text-slate-800 italic leading-none">@{novel.author?.penName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase italic mb-6">
            <PlayCircle className="text-orange-500" /> Chapter List
          </h3>
          <div className="space-y-3">
            {novel.chapters?.map((chapter, index) => {
              const promo = getDiscountedPrice(chapter.price);
              const authorId = novel.author?.id || novel.authorId;
              const isAuthor = String(authorId) === String(currentUserId);
              const isLocked = chapter.price > 0 && !chapter.isPurchased && !isAuthor;
              
              return (
                <div 
                  key={chapter.id || chapter._id}
                  onClick={() => handleChapterClick(chapter)}
                  className={`group flex items-center justify-between p-5 bg-white rounded-[2.2rem] border transition-all cursor-pointer hover:scale-[1.01] ${isLocked ? 'border-slate-100 shadow-sm' : 'border-green-100 bg-green-50/20'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black ${isLocked ? 'bg-slate-50 text-slate-400' : 'bg-green-500 text-white'}`}>
                      {index + 1}
                    </span>
                    <h4 className={`font-bold ${isLocked ? 'text-slate-700' : 'text-green-700'}`}>{chapter.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {chapter.price > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        {!isLocked ? (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter">Unlocked</span>
                        ) : (
                          <>
                            {promo.hasPromo && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-300 line-through font-bold">{chapter.price}</span>
                                <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                  <BadgePercent size={10} /> PROMO
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-sm bg-orange-50 text-orange-500 border border-orange-100 shadow-sm">
                              <Coins size={14} className={promo.hasPromo ? "animate-bounce" : ""} /> 
                              {promo.hasPromo ? promo.finalPrice : chapter.price}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-tighter">Free</span>
                    )}
                    {isLocked ? <Lock size={18} className="text-slate-200 group-hover:text-orange-400 transition-colors" /> : <ChevronRight size={18} className="text-green-300" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase italic">
            <MessageSquare size={24} className="text-orange-500" /> Stats
          </h3>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold text-xs uppercase">Total Chapters</span>
                <span className="font-black text-slate-700">{novel.chapters?.length || 0}</span>
              </div>
              <div className="flex justify-between border-t border-slate-50 pt-4">
                <span className="text-slate-400 font-bold text-xs uppercase">Views</span>
                <span className="font-black text-slate-700">{novel.viewCount?.toLocaleString() || 0}</span>
              </div>
          </div>
        </div>
      </div>

      <PurchaseModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedChapter(null);
        }}
        onConfirm={handleConfirmPurchase}
        chapter={selectedChapter}
        novelTitle={novel?.title}
      />
    </div>
  );
};

export default NovelDetail;