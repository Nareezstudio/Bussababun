import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Sparkles, Clock, TrendingUp, BookOpen, ChevronRight, 
  Zap, PlusCircle, Star, User as UserIcon 
} from 'lucide-react';
import AnnouncementBanner from '../components/AnnouncementBanner';

// --- Helper Function สำหรับจัดการ URL รูปภาพ ---
// รองรับทั้งแบบ Path ในเครื่อง และ URL จาก Cloudinary
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://placehold.co/300x400/eeeeee/999999?text=No+Cover";
  if (imagePath.startsWith('http')) return imagePath;
  
  // ดึง Base URL จาก Environment Variable (Vite)
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const serverURL = baseURL.replace(/\/api$/, ''); // ตัด /api ออกเพื่อให้เข้าถึง /uploads ตรงๆ
  const cleanPath = imagePath.replace(/^\//, '').replace(/\\/g, '/');
  return `${serverURL}/${cleanPath}`;
};

// --- คอมโพเนนต์การ์ดนิยาย (Reusable NovelCard) ---
const NovelCard = ({ novel, showBadge = "" }) => {
  const navigate = useNavigate();
  
  // แสดงนามปากกาเป็นหลัก ถ้าไม่มีให้ใช้ Username
  const authorName = novel.author?.penName || novel.author?.username || 'นักเขียนไร้นาม';

  return (
    <div 
      onClick={() => navigate(`/novel/${novel._id || novel.id}`)}
      className="group cursor-pointer flex flex-col w-full"
    >
      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 mb-4 relative shadow-sm group-hover:shadow-xl group-hover:shadow-orange-200/50 transition-all duration-500">
        <img 
          src={getImageUrl(novel.coverImage)} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={novel.title} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x400/eeeeee/999999?text=ไม่มีรูปปก";
          }} 
        />
        {showBadge && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg z-10">
            {showBadge}
          </div>
        )}
      </div>
      <h3 className="font-black text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors italic tracking-tighter text-lg">
        {novel.title}
      </h3>
      <div className="flex items-center gap-1 mt-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
          โดย @{authorName}
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [newNovels, setNewNovels] = useState([]);
  const [promotedNovels, setPromotedNovels] = useState([]);
  const [popularNovels, setPopularNovels] = useState([]);
  const [highlightNovel, setHighlightNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // เรียก API พร้อมกันเพื่อความเร็ว
      const [catsRes, novelsRes, promoRes] = await Promise.all([
        api.get('/novels/categories'),
        api.get('/novels'),
        api.get('/novels/promoted').catch(() => ({ data: { data: [] } })) // กัน Error ถ้ายังไม่มีโปรโมชั่น
      ]);

      // จัดการข้อมูล Categories
      setCategories(catsRes.data.success ? catsRes.data.data : catsRes.data);

      // จัดการข้อมูลนิยายทั้งหมด
      const allNovels = novelsRes.data.success ? novelsRes.data.data : novelsRes.data;
      
      if (Array.isArray(allNovels) && allNovels.length > 0) {
        // 1. หาเรื่องแนะนำ (Highlight)
        const adminPick = allNovels.find(n => n.isRecommended === true);
        const sortedByViews = [...allNovels].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setHighlightNovel(adminPick || sortedByViews[0]);

        // 2. นิยายมาใหม่
        setNewNovels(allNovels.slice(0, 10)); 

        // 3. นิยายยอดนิยม (Top 5)
        setPopularNovels(sortedByViews.slice(0, 5));
      }

      // 4. นิยายโปรโมชั่น
      setPromotedNovels(promoRes.data.success ? promoRes.data.data : promoRes.data);

    } catch (err) {
      console.error("Home Data Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">📚</div>
        <div className="font-black text-slate-300 italic tracking-[0.2em] animate-pulse uppercase">
          กำลังวาร์ปไปโลกนิยาย...
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-20 pb-20 animate-fadeIn">
      
      {/* 📢 Announcement Section */}
      <AnnouncementBanner />

      {/* 1. HERO SECTION (Featured Novel) */}
      <section className="relative h-[450px] md:h-[550px] rounded-[3.5rem] overflow-hidden bg-slate-900 flex items-center p-8 md:p-16 group shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10" />
        
        {highlightNovel && (
          <img 
            src={getImageUrl(highlightNovel.coverImage)} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
            alt="Highlight Cover"
          />
        )}

        <div className="relative z-20 max-w-2xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest shadow-lg">
              {highlightNovel?.isRecommended ? "บรรณาธิการแนะนำ" : "ยอดนิยมที่สุด"}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white italic leading-[0.9] uppercase tracking-tighter">
            {highlightNovel?.title || "Welcome to BUSSABABUN.COM"}
          </h2>
          <p className="text-slate-300 text-sm md:text-lg font-medium line-clamp-2 max-w-lg opacity-90">
            {highlightNovel?.description || "ค้นหาแรงบันดาลใจผ่านตัวอักษรกับคอมมูนิตี้นักเขียนนิยายรุ่นใหม่"}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={() => highlightNovel && navigate(`/novel/${highlightNovel._id || highlightNovel.id}`)}
              className="bg-orange-500 text-white px-10 py-4 rounded-[2rem] font-black uppercase italic hover:bg-white hover:text-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
            >
              อ่านตอนนี้เลย
            </button>
            <div className="text-white/60 font-black italic uppercase text-xs tracking-widest bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
               VIEWED {highlightNovel?.viewCount?.toLocaleString() || 0} TIMES
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES CHIPS */}
      <section className="flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <button 
            key={cat._id || cat.id} 
            onClick={() => navigate(`/category/${cat._id || cat.id}`)} 
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-500 hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-100 transition-all uppercase italic text-sm"
          >
            # {cat.name}
          </button>
        ))}
      </section>

      {/* 3. FLASH SALE / PROMOTIONS */}
      {promotedNovels.length > 0 && (
        <section className="bg-orange-50 rounded-[4rem] p-8 md:p-12 border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Zap size={200} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 italic uppercase flex items-center gap-3 mb-10 relative z-10">
            <Zap className="text-orange-500 fill-orange-500 animate-pulse" /> โปรโมชั่นลดฟ้าผ่า
          </h2>
          <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide relative z-10">
            {promotedNovels.map(novel => (
              <div key={novel._id || novel.id} className="min-w-[180px] md:min-w-[220px]">
                <NovelCard 
                  novel={novel} 
                  showBadge={`ลด ${novel.promotions?.[0]?.discountValue || 0}%`} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-black text-slate-800 italic uppercase flex items-center gap-3">
            <PlusCircle className="text-blue-500" /> นิยายเข้าใหม่
          </h2>
          <button onClick={() => navigate('/all')} className="text-slate-400 font-bold flex items-center gap-1 hover:text-orange-500 transition-colors uppercase text-xs italic">
            ดูทั้งหมด <ChevronRight size={16}/>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10">
          {newNovels.length > 0 ? (
            newNovels.map(novel => (
              <NovelCard key={novel._id || novel.id} novel={novel} showBadge="NEW" />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-black italic uppercase tracking-widest">ยังไม่มีนิยายในขณะนี้</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. POPULAR & SIDE CONTENT */}
      <section className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black text-slate-800 italic uppercase mb-10 flex items-center gap-3">
            <TrendingUp className="text-emerald-500" /> นิยายยอดนิยม
          </h2>
          <div className="grid gap-6">
            {popularNovels.map((novel, index) => (
              <div 
                key={novel._id || novel.id} 
                onClick={() => navigate(`/novel/${novel._id || novel.id}`)} 
                className="flex items-center gap-6 cursor-pointer group bg-white p-4 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all shadow-sm"
              >
                <span className="text-5xl font-black text-slate-100 group-hover:text-orange-500 transition-colors italic w-16 text-center">
                  0{index + 1}
                </span>
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-md">
                  <img 
                    src={getImageUrl(novel.coverImage)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={novel.title} 
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-slate-800 uppercase italic text-xl group-hover:text-orange-500 transition-colors truncate">
                    {novel.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-400 font-bold uppercase italic flex items-center gap-1">
                      <UserIcon size={12} className="text-orange-400" /> 
                      @{novel.author?.penName || novel.author?.username}
                    </p>
                    <span className="bg-slate-100 px-3 py-0.5 rounded-full text-[10px] font-black text-slate-500">
                      {novel.viewCount?.toLocaleString()} VIEWS
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* กิจกรรม / Banner ด้านข้าง */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3.5rem] p-10 shadow-2xl flex flex-col justify-center items-center text-center text-white space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <Sparkles size={80} className="text-yellow-400 fill-yellow-400 animate-pulse relative z-10"/>
          <div className="space-y-2 relative z-10">
            <h3 className="text-4xl font-black italic uppercase leading-none">Contest Zone</h3>
            <p className="font-bold opacity-80 text-sm uppercase tracking-widest">สนามประลองนักเขียนหน้าใหม่</p>
          </div>
          <p className="font-medium text-indigo-100 relative z-10">
            ส่งผลงานวันนี้ ลุ้นรับรางวัลรวมมูลค่ากว่า 20,000 บาท!
          </p>
          <button className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black uppercase italic hover:scale-105 transition-transform shadow-xl relative z-10">
            ดูรายละเอียด
          </button>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-20 border-t border-slate-100 text-center space-y-2">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">
          BUSSABABUN © 2026 Creative Writing Community
        </p>
      </footer>

    </div>
  );
};

export default Home;