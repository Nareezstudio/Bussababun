import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnnouncementBanner = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/admin/public/announcements');
        if (res.data.success) setAnnouncements(res.data.data);
      } catch (err) {
        console.error("Fetch announcements error", err);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [announcements]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  // ฟังก์ชันช่วยย้ายหน้า
  const handleReadMore = (e) => {
    // ป้องกันไม่ให้การกดปุ่ม X ไปกระตุ้นการย้ายหน้า
    if (e.target.closest('.close-btn')) return;
    navigate(`/announcements/${current.id}`);
  };

  return (
    <div 
      onClick={handleReadMore}
      className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-2.5 md:py-3 px-4 shadow-lg relative overflow-hidden cursor-pointer group transition-all"
    >
      {/* เอฟเฟกต์แสงวิ่งผ่านพื้นหลัง */}
      <div className="absolute inset-0 bg-white/10 -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 md:gap-3 flex-1 truncate">
          <div className="bg-white/20 p-1.5 rounded-lg animate-pulse shrink-0">
            <Megaphone size={16} className="text-white md:w-[18px]" />
          </div>
          
          <div className="flex items-center gap-2 truncate">
            <span className="hidden xs:inline-block font-black italic uppercase tracking-tighter text-[10px] bg-black/20 px-2 py-0.5 rounded shrink-0">
              News
            </span>
            <p className="font-bold italic text-xs md:text-base truncate drop-shadow-md pr-4">
              {current.title} 
              <span className="hidden lg:inline font-normal opacity-80 ml-2">— {current.content}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* บนมือถือจะโชว์แค่ลูกศรเพื่อให้ดูสะอาดตา */}
          <div className="flex items-center gap-1 text-[10px] font-black uppercase italic bg-white text-orange-600 px-2 md:px-3 py-1 rounded-full group-hover:bg-black group-hover:text-white transition-all scale-90 md:scale-100">
            <span className="hidden sm:inline">อ่านต่อ</span> <ChevronRight size={12} />
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation(); // สำคัญ: กันไม่ให้เผลอกดไปหน้าอ่านประกาศตอนจะปิด
              setIsVisible(false);
            }} 
            className="close-btn hover:rotate-90 transition-transform p-1 opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;