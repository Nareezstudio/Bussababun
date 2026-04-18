import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // เพิ่ม Link สำหรับนำทาง
import { 
  Settings, Save, Percent, Globe, RefreshCcw, 
  AlertCircle, LayoutGrid, ArrowUpRight 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    writerShare: 60,
    systemShare: 40
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setSettings({
          siteName: res.data.siteName || '',
          writerShare: res.data.writerShare || 60,
          systemShare: res.data.systemShare || 40
        });
      }
    } catch (err) {
      console.error("โหลดข้อมูลล้มเหลว:", err);
      toast.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleWriterShareChange = (value) => {
    const numValue = Number(value);
    if (numValue > 100) return;
    setSettings({
      ...settings,
      writerShare: numValue,
      systemShare: 100 - numValue
    });
  };

  const handleSave = async () => {
    if (!settings.siteName.trim()) return toast.error("กรุณาระบุชื่อเว็บไซต์");
    
    setIsSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว", {
        icon: '🚀',
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
      });
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCcw className="w-10 h-10 text-orange-500 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">Syncing Core Settings...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-2 md:p-8 mt-6 animate-fadeIn pb-20">
      {/* Header Card */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] mb-6 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
             <Settings className="text-orange-500 animate-spin-slow" size={32} />
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">System <span className="text-orange-500">Config</span></h2>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] italic">Platform Revenue & Global Identity</p>
        </div>
        <Settings className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12" />
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-12 space-y-12">
        
        {/* Section 1: Identity */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            <Globe size={14} className="text-blue-500" /> Website Identity
          </label>
          <input 
            type="text" 
            placeholder="ชื่อเว็บไซต์ของคุณ..."
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-slate-900 focus:bg-white outline-none transition-all font-black text-xl italic shadow-inner text-slate-800"
          />
        </div>

        {/* ✅ Section 2: Taxonomy Management (NEW) */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            <LayoutGrid size={14} className="text-purple-500" /> Taxonomy & Tags
          </label>
          <Link 
            to="/admin/categories" 
            className="group flex items-center justify-between p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-purple-500 shadow-sm transition-colors">
                <LayoutGrid size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 uppercase italic text-sm">Category Manager</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage novel genres & tags</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all">
              <ArrowUpRight size={18} />
            </div>
          </Link>
        </div>

        {/* Section 3: Revenue Model */}
        <div className="space-y-6">
          <div className="flex items-center justify-between ml-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Percent size={14} className="text-orange-500" /> Revenue Split Model
            </label>
            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase italic">Dynamic Calculation</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute top-4 left-6 text-[9px] font-black text-orange-400 uppercase tracking-widest group-focus-within:text-orange-600">Writer Share</div>
              <input 
                type="number" 
                value={settings.writerShare}
                onChange={(e) => handleWriterShareChange(e.target.value)}
                className="w-full pt-10 pb-4 px-6 bg-orange-50/50 border-2 border-orange-100 rounded-[2rem] focus:border-orange-500 outline-none font-black text-orange-600 text-4xl italic transition-all"
              />
              <span className="absolute bottom-5 right-6 font-black text-orange-300 text-xl">%</span>
            </div>

            <div className="relative group opacity-80">
              <div className="absolute top-4 left-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">System Revenue</div>
              <input 
                type="number" 
                value={settings.systemShare}
                onChange={() => {}} // Read-only via calculation
                readOnly
                className="w-full pt-10 pb-4 px-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none font-black text-slate-400 text-4xl italic"
              />
              <span className="absolute bottom-5 right-6 font-black text-slate-200 text-xl">%</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-blue-50 p-5 rounded-[2rem] border border-blue-100">
            <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-600/80 leading-relaxed uppercase tracking-wider">
              ส่วนแบ่งจะถูกนำไปคำนวณทันทีเมื่อมีการซื้อตอนนิยายเกิดขึ้นในระบบ <br/>
              ยอดรวมระหว่างนักเขียนและระบบต้องเท่ากับ 100% เสมอ
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-6 rounded-[2rem] font-black text-xl uppercase italic tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)]
            ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-orange-600 hover:-translate-y-1 active:scale-95'}`}
        >
          {isSaving ? (
            <RefreshCcw className="animate-spin" />
          ) : (
            <Save size={24} />
          )}
          {isSaving ? "Deploying..." : "Apply Global Changes"}
        </button>
      </div>

      <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Security Protocol: Admin Authorization Required
      </p>
    </div>
  );
};

export default AdminSettings;