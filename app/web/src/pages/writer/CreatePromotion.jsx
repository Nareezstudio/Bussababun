import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Layers, BookOpen, Ticket, 
  Calendar, Hash, Info, Loader2 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const CreatePromotion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 1. State สำหรับเก็บรายชื่อนิยายที่ดึงมาจาก Database
  const [myNovels, setMyNovels] = useState([]);

  // 2. State หลักของฟอร์ม
  const [formData, setFormData] = useState({
    name: '',
    type: 'EPISODE', // EPISODE, FULL, CODE
    novelId: '',
    discountType: 'PERCENT', // PERCENT, COIN
    discountValue: '',
    startDate: '',
    endDate: '',
    promoCode: '', 
    description: ''
  });

  // 3. ดึงข้อมูลนิยายจริงจากฐานข้อมูลเมื่อ Component โหลด
  useEffect(() => {
    const fetchMyNovels = async () => {
      try {
        // ปรับ Path ให้ตรงกับ Backend ของคุณ (เช่น /novels/my-novels)
        const res = await api.get('/novels/my-novels'); 
        setMyNovels(res.data);
      } catch (err) {
        console.error("Fetch novels error:", err);
        // toast.error("ไม่สามารถดึงข้อมูลนิยายได้");
      }
    };
    fetchMyNovels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.novelId) return toast.error("กรุณาเลือกนิยาย");
    
    setLoading(true);
    try {
      await api.post('/promotions/create', formData);
      toast.success("สร้างแคมเปญสำเร็จ!");
      navigate('/writer/promotions');
    } catch (err) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 animate-fadeIn pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black mb-6 hover:text-slate-600 transition-colors uppercase text-[10px] tracking-widest">
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-10 text-white relative">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter relative z-10">
            Create <span className="text-orange-500">Campaign</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic relative z-10">Configure your discount strategy</p>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Ticket size={120} className="rotate-12" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          
          {/* ส่วนที่ 1: เลือกประเภท */}
          <section className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              <Layers size={14} className="text-orange-500" /> Select Promotion Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'EPISODE', label: 'ลดรายตอน', desc: 'ลดราคาเหรียญแต่ละตอน', icon: <Layers /> },
                { id: 'FULL', label: 'ลดทั้งเรื่อง', desc: 'ลดราคาแพ็กเกจ/E-Book', icon: <BookOpen /> },
                { id: 'CODE', label: 'รหัสส่วนลด', desc: 'ใช้โค้ดเพื่อรับส่วนลด', icon: <Ticket /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: item.id})}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-3 ${
                    formData.type === item.id 
                    ? 'border-slate-900 bg-slate-900 text-white scale-105 shadow-xl' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-orange-200'
                  }`}
                >
                  <div className={formData.type === item.id ? 'text-orange-500' : 'text-slate-300'}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-black uppercase italic text-sm">{item.label}</p>
                    <p className="text-[9px] font-bold uppercase opacity-60 leading-tight">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ชื่อแคมเปญ</label>
                <input 
                  type="text"
                  required
                  placeholder="เช่น Summer Sale 2024"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none font-bold text-slate-700"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">เลือกนิยาย</label>
                <div className="relative">
                   <select 
                    required
                    value={formData.novelId}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, novelId: e.target.value})}
                  >
                    <option value="">-- กรุณาเลือกนิยาย --</option>
                    {myNovels.length > 0 ? (
                      myNovels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)
                    ) : (
                      <option disabled>ไม่พบข้อมูลนิยายของคุณ</option>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Layers size={16} />
                  </div>
                </div>
              </div>

              {formData.type === 'CODE' && (
                <div className="space-y-2 animate-bounce-in">
                  <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-2">Promo Code</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                    <input 
                      type="text"
                      placeholder="SUMMER60"
                      className="w-full p-4 pl-12 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:border-slate-900 outline-none font-black text-slate-700 uppercase"
                      onChange={(e) => setFormData({...formData, promoCode: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">รูปแบบส่วนลด</label>
                  <select 
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700"
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                    <option value="COIN">จำนวนคอยน์ (🪙)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">มูลค่า</label>
                  <input 
                    type="number"
                    required
                    placeholder="0"
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 text-xl"
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                   <Calendar size={14} /> ระยะเวลาโปรโมชั่น
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      required
                      className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold"
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                    <input 
                      type="date" 
                      required
                      className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold"
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                 </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 italic">
                 <Info size={16} className="text-blue-500 shrink-0" />
                 <p className="text-[9px] font-bold text-blue-700 leading-tight uppercase">
                    {formData.type === 'EPISODE' && "ระบบจะลดราคาเหรียญในแต่ละตอนตามมูลค่าที่ระบุ"}
                    {formData.type === 'FULL' && "ส่วนลดนี้จะใช้กับการซื้อนิยายแบบเหมาเรื่องหรือ E-Book"}
                    {formData.type === 'CODE' && "นักอ่านต้องกรอกรหัสนี้ที่หน้าชำระเงินเพื่อรับส่วนลด"}
                 </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-900 hover:bg-orange-600 text-white rounded-[2rem] font-black text-xl uppercase italic tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
          >
            {loading ? <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" /> : <Save size={24} />}
            Deploy Campaign
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotion;