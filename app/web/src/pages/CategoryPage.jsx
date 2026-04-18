import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Tag, BookOpen, User, ChevronLeft, Sparkles, Clock } from 'lucide-react';

const CategoryPage = () => {
  const { id } = useParams();
  const [novels, setNovels] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        // ยิง API ไปที่ Endpoint ที่รองรับการกรองตาม ID หมวดหมู่
        const res = await api.get(`/novels/category/${id}`); 
        
        // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมา (ปรับตาม Backend ของคุณ)
        if (res.data) {
          setNovels(res.data.novels || []);
          setCategoryName(res.data.categoryName || 'หมวดหมู่');
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300x400?text=No+Cover";
    if (path.includes('http')) return path; 
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`; 
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 italic tracking-widest uppercase text-sm">กำลังค้นหาข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
      {/* 🔙 Navigation */}
      <button 
        onClick={() => navigate('/')} 
        className="group flex items-center gap-2 text-slate-400 font-bold mb-10 hover:text-orange-500 transition-all"
      >
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
          <ChevronLeft size={20} />
        </div>
        กลับหน้าหลัก
      </button>

      {/* 🏷️ Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
          <span className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Category Filter</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
          <span className="text-orange-500 mr-2 opacity-50">#</span>{categoryName}
        </h1>
        <p className="text-slate-400 font-bold mt-4 flex items-center gap-2 italic">
          <Sparkles size={16} className="text-orange-400" />
          พบนิยายทั้งหมด {novels.length} เรื่องในจักรวาลนี้
        </p>
      </div>

      {/* 📚 Novels Grid */}
      {novels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {novels.map((novel) => (
            <div 
              key={novel.id} 
              onClick={() => navigate(`/novel/${novel.id}`)} 
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Card (Style เดียวกับหน้า Home) */}
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 mb-5 shadow-sm group-hover:shadow-3xl group-hover:shadow-orange-200 transition-all duration-500 relative">
                <img 
                  src={getImageUrl(novel.coverImage)} 
                  alt={novel.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=Error" }}
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                    {novel.status === 'ONGOING' ? 
                      <Clock size={14} className="text-green-500" /> : 
                      <Sparkles size={14} className="text-blue-500" />
                    }
                  </div>
                </div>
              </div>

              {/* Info Area */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-xl line-clamp-1 group-hover:text-orange-600 transition-colors uppercase tracking-tighter">
                  {novel.title}
                </h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={12} />
                  <span className="text-xs font-bold italic truncate">
                    @{novel.author?.username || 'นักเขียนนิรนาม'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <BookOpen size={14} className="text-orange-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      {novel._count?.chapters || 0} CH
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                    novel.status === 'ONGOING' ? 'text-green-500 bg-green-50' : 'text-blue-500 bg-blue-50'
                  }`}>
                    {novel.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 📭 Empty State */
        <div className="py-24 bg-slate-50 rounded-[4rem] text-center border-2 border-dashed border-slate-200">
          <div className="mb-4 flex justify-center text-slate-200">
            <BookOpen size={64} />
          </div>
          <h3 className="text-2xl font-black text-slate-400 uppercase italic">ไม่พบข้อมูลนิยาย</h3>
          <p className="text-slate-400 font-bold mt-2">หมวดหมู่นี้ยังไม่มีการลงผลงานในขณะนี้</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-8 bg-white border-2 border-slate-200 text-slate-500 px-8 py-3 rounded-full font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all uppercase text-xs tracking-widest"
          >
            ไปดูหมวดอื่น
          </button>
        </div>
      )}

      {/* Decorative Brand Background */}
      <div className="mt-32 opacity-[0.03] select-none pointer-events-none">
        <h2 className="text-9xl font-black uppercase italic tracking-tighter text-center">
          {categoryName}
        </h2>
      </div>
    </div>
  );
};

export default CategoryPage;