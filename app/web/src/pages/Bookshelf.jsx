import React, { useState, useEffect } from 'react';
import { Library, Heart, BookOpen, ChevronRight, Eye, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns'; // ติดตั้งด้วย npm install date-fns
import { th } from 'date-fns/locale';

const Bookshelf = () => {
  const { user } = useAuth();
  const [followedNovels, setFollowedNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ แก้ไขส่วน useEffect ใน Bookshelf.js
  useEffect(() => {
    const fetchBookshelf = async () => {
      try {
        setLoading(true);
        const res = await api.get('/novels/my-bookshelf');
        
        // ✅ ตรวจสอบโครงสร้างข้อมูลที่มาจาก Backend (จากที่เราเขียนไว้ก่อนหน้า)
        if (res.data && res.data.success) {
          setFollowedNovels(res.data.data); // data ตัวที่สองคือ array ของนิยาย
        } else {
          // กรณีดึงสำเร็จแต่ไม่มี data.success
          setFollowedNovels(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching bookshelf:", err);
        // ถ้า Error 401 หรือ 403 (Token หมดอายุ) อาจจะให้ Logout หรือแจ้งเตือน
        if (err.response?.status === 401) {
          toast.error("เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookshelf();
  }, [user]);

  // ฟังก์ชันตรวจสอบว่าเป็นตอนใหม่หรือไม่ (ภายใน 24 ชม.)
  const isRecentlyUpdated = (dateString) => {
    const lastUpdate = new Date(dateString);
    const now = new Date();
    return (now - lastUpdate) < 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-100">
            <Library className="text-white" size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ชั้นหนังสือ</h1>
            <p className="text-slate-500 text-sm font-medium">นิยายที่คุณติดตามและกำลังอ่านอยู่</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
           <Sparkles size={16} className="text-orange-400 mr-2" />
           <span className="text-slate-600 text-sm font-bold">
             {followedNovels.length} เรื่องทั้งหมด
           </span>
        </div>
      </div>

      {followedNovels.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-slate-300" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">ชั้นหนังสือของคุณยังว่างเปล่า</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">เริ่มต้นติดตามนิยายที่คุณชอบ เพื่อรับการแจ้งเตือนตอนใหม่ก่อนใครที่นี่</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-500 hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            ไปสำรวจนิยาย <ChevronRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {followedNovels.map((novel) => (
            <Link 
              key={novel.id} 
              to={`/novel/${novel.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={novel.coverImage || 'https://via.placeholder.com/300x400?text=Bussababun'} 
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* 🟢 Update Badge (เนียนเหมือนแอปดัง) */}
                {isRecentlyUpdated(novel.lastUpdated) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-lg animate-pulse uppercase">
                    Update!
                  </div>
                )}

                {/* จำนวนตอน */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">
                  {novel._count?.chapters || 0} ตอน
                </div>

                {/* Overlay อ่านต่อ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-2">
                        <BookOpen size={16} className="text-orange-400" /> อ่านต่อเลย
                    </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-[15px] line-clamp-1 mb-1 group-hover:text-orange-500 transition-colors">
                  {novel.title}
                </h3>
                <p className="text-[12px] text-slate-400 font-medium mb-3 truncate italic">
                  โดย {novel.author?.penName || 'นักเขียนนิรนาม'}
                </p>
                
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Eye size={13} />
                      <span className="text-[11px] font-bold">
                        {novel.viewCount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">
                      {novel.category?.name || 'ทั่วไป'}
                    </span>
                  </div>

                  {/* 🕒 เวลาที่อัปเดตล่าสุด */}
                  <div className="flex items-center gap-1.5 text-[10px] text-orange-500 font-bold">
                    <Clock size={12} />
                    <span>อัปเดต {formatDistanceToNow(new Date(novel.lastUpdated), { addSuffix: true, locale: th })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookshelf;