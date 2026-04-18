import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Star, StarOff, Search, Loader2, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminNovelManager = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/novels'); // แนะนำให้ใช้ Route ของ admin โดยเฉพาะ
      setNovels(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลนิยายได้: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const handleToggleRecommend = async (id, currentStatus) => {
    try {
      setUpdatingId(id);
      // ใน Backend คุณใช้ toggleRecommend (PATCH /admin/novels/:id/recommend)
      const res = await api.patch(`/admin/novels/${id}/recommend`);

      if (res.data.success) {
        setNovels(prev => prev.map(n => 
          n.id === id ? { ...n, isRecommended: res.data.isRecommended } : n
        ));

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
        Toast.fire({
          icon: 'success',
          title: res.data.isRecommended ? 'ตั้งเป็นนิยายแนะนำแล้ว' : 'ยกเลิกการแนะนำแล้ว'
        });
      }
    } catch (err) {
      Swal.fire('Failed', 'ไม่สามารถอัปเดตสถานะได้', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredNovels = novels.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">Novel <span className="text-orange-500">Manager</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Editor's Choice & Content Control</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="ค้นหาชื่อนิยาย..."
            className="pl-10 pr-4 py-3 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none w-full md:w-80 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Novel Details</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Views</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={40} className="animate-spin text-orange-500" />
                      <span className="font-black italic text-slate-300 uppercase tracking-widest text-xs">Synchronizing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredNovels.map((novel) => (
                <tr key={novel.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        {/* 🛠 แก้ไขจุดเสี่ยงหน้าขาว: เช็ค coverImage ก่อนใช้ startsWith */}
                        <img 
                          src={novel.coverImage 
                            ? (novel.coverImage.startsWith('http') 
                                ? novel.coverImage 
                                : `${import.meta.env.VITE_API_URL}${novel.coverImage}`) 
                            : 'https://placehold.co/150x200?text=No+Cover'} // ใช้ Service ภายนอกแทนไฟล์ในเครื่อง
                          className="w-12 h-16 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 uppercase italic text-base leading-tight line-clamp-1">{novel.title}</div>
                        <div className="text-[10px] text-orange-500 font-black uppercase mt-1 tracking-tighter">
                          By @{novel.author?.username || 'Unknown'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{novel.category?.name || 'Uncategorized'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-xs">
                      {Number(novel.viewCount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggleRecommend(novel.id, novel.isRecommended)}
                        disabled={updatingId === novel.id}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase italic transition-all ${
                          novel.isRecommended 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 hover:bg-orange-600' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                      >
                        {updatingId === novel.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : novel.isRecommended ? (
                          <Star size={14} className="fill-white" />
                        ) : (
                          <StarOff size={14} />
                        )}
                        {novel.isRecommended ? 'Editor\'s Choice' : 'Set Recommend'}
                      </button>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => window.open(`https://bussababun.com/novel/${novel.id}`, '_blank')}
                      className="p-3 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                      title="View on Website"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredNovels.length === 0 && (
          <div className="p-32 text-center">
            <div className="text-slate-200 font-black italic text-4xl uppercase tracking-tighter opacity-50">No Data Found</div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNovelManager;