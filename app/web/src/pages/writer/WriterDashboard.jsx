import React, { useEffect, useState } from 'react';
import { 
  Plus, BookOpen, Edit3, Eye, TicketPercent, 
  Loader2, AlertCircle, LayoutDashboard, ChevronRight,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const WriterDashboard = () => {
  const [myNovels, setMyNovels] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ เพิ่ม State สำหรับจัดการ Error
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [userRes, novelsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/novels/my-novels')
        ]);
        
        setUser(userRes.data);
        setMyNovels(novelsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ฟังก์ชันตรวจสอบก่อนสร้างนิยาย
  const handleCreateNovel = () => {
    if (user?.verification !== 'VERIFIED') {
      alert("กรุณายืนยันตัวตนนักเขียนให้เรียบร้อยก่อนเริ่มสร้างนิยาย");
      navigate('/writer/verify-step-1');
      return;
    }
    navigate('/writer/create-novel');
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-sm">Loading Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500 pb-20">
      
      {/* 🚩 ส่วนแจ้งเตือน Error */}
      {error && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 mb-6 rounded-3xl flex items-center gap-3 text-amber-700 font-bold italic">
          <Info size={20} /> {error}
        </div>
      )}

      {/* 🚩 ส่วนแจ้งเตือนการยืนยันตัวตนไม่ผ่าน */}
      {user?.verification === 'REJECTED' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-8 rounded-r-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-red-800 font-black uppercase italic tracking-tight">⚠️ การยืนยันตัวตนไม่ผ่าน</h4>
              <p className="text-red-700 text-sm mt-1 font-medium">
                เหตุผล: <span className="font-bold">{user.rejectedReason || 'เอกสารไม่ชัดเจนหรือข้อมูลไม่ครบถ้วน'}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/writer/verify-step-1')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase italic transition-all active:scale-95 shadow-lg shadow-red-100 whitespace-nowrap"
          >
            แก้ไขและส่งเอกสารใหม่
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">สตูดิโอของฉัน</h1>
            <p className="text-slate-400 font-bold text-sm">Dashboard & Statistics</p>
          </div>
        </div>
        <button 
          onClick={handleCreateNovel}
          className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          เขียนเรื่องใหม่
        </button>
      </div>

      {/* Novels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myNovels.map((novel) => (
          <div key={novel.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col relative">
            
            {/* Cover Image */}
            <div className="relative h-60 overflow-hidden">
              <img 
                src={novel.coverImage || '/placeholder-cover.jpg'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={novel.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-xl">
                {novel.status === 'PUBLISHED' ? '🟢 เผยแพร่' : '⚪ รอดำเนินการ'}
              </div>

              <div className="absolute bottom-4 left-6 right-6">
                 <h3 className="text-white text-lg font-black truncate drop-shadow-md">
                   {novel.title}
                 </h3>
              </div>
            </div>
            
            <div className="p-7 flex flex-col flex-grow bg-white">
              <div className="flex gap-4 text-slate-400 text-[11px] font-black uppercase tracking-tight mb-6">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <BookOpen size={14} className="text-orange-500" /> {novel._count?.chapters || 0} ตอน
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Eye size={14} className="text-blue-500" /> {novel.viewCount || 0} วิว
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/writer/edit-novel/${novel.id}`)}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 border-slate-100"
                  >
                    <Edit3 size={16} /> แก้ไข
                  </button>
                  <button 
                    onClick={() => navigate(`/writer/novel/${novel.id}/chapters`)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                  >
                    จัดการตอน <ChevronRight size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => navigate(`/writer/create-promotion?novelId=${novel.id}`)}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 border-orange-100"
                >
                  <TicketPercent size={18} />
                  จัดกิจกรรมลดราคา / คูปอง
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && myNovels.length === 0 && (
          <div className="col-span-full py-24 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white p-8 rounded-full shadow-xl shadow-slate-200/50 mb-6">
               <BookOpen size={60} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 italic uppercase">Your Studio is Empty</h3>
            <p className="text-slate-400 font-bold max-w-sm mb-10 text-sm leading-relaxed">
              เรื่องราวที่น่าตื่นเต้นของคุณกำลังรอการถ่ายทอด<br/>เริ่มเขียนผลงานชิ้นเอกของคุณวันนี้!
            </p>
            <button 
              onClick={handleCreateNovel}
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-5 rounded-[2rem] font-black transition-all active:scale-95 shadow-2xl shadow-orange-200 uppercase tracking-widest text-sm"
            >
              สร้างผลงานเรื่องแรก
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
        <p>© 2026 BUSSABABUN OFFICIAL - PROFESSIONAL WRITER PANEL</p>
        <div className="flex gap-8">
          <button className="hover:text-orange-500 transition-colors">Manual</button>
          <button className="hover:text-orange-500 transition-colors">Policy</button>
          <button className="hover:text-orange-500 transition-colors">Support</button>
        </div>
      </div>
    </div>
  );
};

export default WriterDashboard;