import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const EditNovel = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '', // ✅ เปลี่ยนจาก category เป็น categoryId
    status: 'ONGOING'
  });

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const res = await api.get(`/novels/${novelId}`);
        
        // ✅ ตรวจสอบว่า API ส่ง data มาซ้อนใน data หรือไม่ (ตามภาพ Network ที่เคยส่งมา)
        const novelData = res.data.data ? res.data.data : res.data;

        setFormData({
          title: novelData.title || '',
          description: novelData.description || '',
          categoryId: novelData.categoryId || '', // ✅ ให้ตรงกับ DB
          status: novelData.status || 'ONGOING'
        });
      } catch (err) {
        console.error("Error fetching novel:", err);
        alert("ไม่สามารถโหลดข้อมูลนิยายได้");
        navigate('/writer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [novelId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ✅ ส่ง formData ไปที่ URL ที่มี ID
      await api.put(`/novels/${novelId}`, formData);
      alert("อัปเดตข้อมูลนิยายเรียบร้อยแล้ว");
      navigate('/writer/dashboard');
    } catch (err) {
      console.error("Error updating novel:", err);
      // เช็คว่า Error 404 เกิดจาก Path หรือไม่
      alert(err.response?.data?.message || "แก้ไขไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="ml-3 font-bold text-slate-400">กำลังดึงข้อมูลเรื่องราว...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">แก้ไขข้อมูลนิยาย</h1>
          <p className="text-slate-400 font-bold text-sm">ปรับแต่งรายละเอียดเรื่องราวของคุณให้สมบูรณ์</p>
        </div>
        <button 
          onClick={() => navigate('/writer/dashboard')}
          className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
        >
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ชื่อเรื่อง (Title)</label>
          <input 
            type="text"
            className="w-full text-2xl font-bold p-5 rounded-2xl border-2 border-slate-50 outline-none focus:border-orange-500 focus:bg-orange-50/30 transition-all shadow-inner"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">เนื้อเรื่องย่อ / คำโปรย</label>
          <textarea 
            className="w-full h-64 p-5 rounded-2xl border-2 border-slate-50 outline-none focus:border-orange-500 focus:bg-orange-50/30 transition-all resize-none text-lg leading-relaxed shadow-inner"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">สถานะนิยาย</label>
            <select 
              className="w-full p-5 rounded-2xl border-2 border-slate-50 outline-none focus:border-orange-500 font-bold bg-white cursor-pointer shadow-inner"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="ONGOING">🔵 กำลังเขียน (Ongoing)</option>
              <option value="COMPLETED">🟢 จบแล้ว (Completed)</option>
            </select>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex gap-4">
          <button 
            type="submit"
            disabled={issubmitting}
            className="flex-1 bg-slate-900 hover:bg-orange-600 text-white py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 uppercase italic"
          >
            {issubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNovel;