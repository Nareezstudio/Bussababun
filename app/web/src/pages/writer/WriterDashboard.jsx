import React, { useEffect, useState } from 'react';
import { 
  Plus, BookOpen, Edit3, Eye, TicketPercent, 
  Loader2, AlertCircle, LayoutDashboard, ChevronRight,
  Info, Trophy, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const WriterDashboard = () => {
  const [myNovels, setMyNovels] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userRes, novelsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/novels/my-novels') // อย่าลืมอัปเดต API ให้ include contestEntries
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
        <p className="font-black text-slate-400 animate-pulse tracking-widest text-sm">LOADING STUDIO...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500 pb-20">
      {/* Contest Banner Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] p-8 mb-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-purple-100 border-4 border-white/10">
        <div className="flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
            <Trophy size={40} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Contest Zone</h2>
            <p className="text-purple-100 font-bold text-sm">สนามประลองนักเขียนหน้าใหม่ ชิงรางวัลและเกียรติยศ</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/contest')}
          className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-yellow-300 hover:text-purple-900 transition-all active:scale-95 shadow-lg flex items-center gap-2"
        >
          ดูรายการประกวด <ArrowRight size={16} />
        </button>
      </div>

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
        <button onClick={handleCreateNovel} className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> เขียนเรื่องใหม่
        </button>
      </div>

      {/* Novels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myNovels.map((novel) => (
          <div key={novel.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col relative">
            {/* Cover Image */}
            <div className="relative h-60 overflow-hidden">
              <img src={novel.coverImage || '/placeholder-cover.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={novel.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-xl">
                {novel.status === 'PUBLISHED' ? '🟢 เผยแพร่' : '⚪ รอดำเนินการ'}
              </div>
              <div className="absolute bottom-4 left-6 right-6">
                <h3 className="text-white text-lg font-black truncate drop-shadow-md">{novel.title}</h3>
              </div>
            </div>
            
            <div className="p-7 flex flex-col flex-grow">
              <div className="flex gap-4 text-slate-400 text-[11px] font-black uppercase tracking-tight mb-6">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <BookOpen size={14} className="text-orange-500" /> {novel._count?.chapters || 0} ตอน
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Eye size={14} className="text-blue-500" /> {novel.viewCount || 0} วิว
                </span>
              </div>
              
              <div className="mt-auto space-y-3">
                {/* Contest Entry Button */}
                {novel.contestEntries?.length > 0 ? (
                  <div className="w-full bg-green-50 text-green-600 py-3.5 rounded-2xl font-black text-[10px] uppercase text-center border-2 border-green-100 mb-2">
                    🏆 เข้าร่วมการประกวดแล้ว
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate(`/contest/submit?novelId=${novel.id}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100 mb-2"
                  >
                    <Trophy size={16} /> ส่งชื่อเรื่องนี้เข้าประกวด
                  </button>
                )}

                <div className="flex gap-3">
                  <button onClick={() => navigate(`/writer/edit-novel/${novel.id}`)} className="flex-1 bg-white hover:bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 border-slate-100">
                    <Edit3 size={16} /> แก้ไข
                  </button>
                  <button onClick={() => navigate(`/writer/novel/${novel.id}/chapters`)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2">
                    จัดการตอน <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WriterDashboard;