import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CircleDollarSign, 
  ScrollText, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  User, 
  Building2, 
  CreditCard 
} from 'lucide-react';
import api from '../../api/axios';

const WriterTerms = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [idCardImage, setIdCardImage] = useState(null);
  const [bankBookImage, setBankBookImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shareSettings, setShareSettings] = useState({ writerShare: 0, systemShare: 0 });

  // ✅ State สำหรับข้อมูลตัวอักษร
  const [formData, setFormData] = useState({
    realName: '',
    realSurname: '',
    penName: '',
    idCardNumber: '',
    bankName: '',
    bankAccount: '',
    bankAccountName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/admin/settings'); 
        if (data) {
          setShareSettings({
            writerShare: data.writerShare,
            systemShare: data.systemShare
          });
        }
      } catch (err) {
        console.error("Failed to fetch split ratio:", err);
        setShareSettings({ writerShare: 60, systemShare: 40 });
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleApply = async () => {
    // 1. Validation ข้อมูล Text
    const isFormValid = Object.values(formData).every(val => val.trim() !== "");
    if (!isFormValid || !idCardImage || !bankBookImage) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดรูปภาพหลักฐาน");
    }

    if (formData.idCardNumber.length !== 13) {
      return alert("เลขบัตรประชาชนต้องมี 13 หลัก");
    }

    setLoading(true);
    const data = new FormData();
    
    // 2. Append ไฟล์ภาพ (ชื่อ Key ตรงกับ Schema)
    data.append('idCardImage', idCardImage);
    data.append('bankBookImage', bankBookImage);
    
    // 3. Append ข้อมูลตัวอักษร
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      await api.post('/auth/become-writer', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("ส่งข้อมูลสมัครนักเขียนสำเร็จ! โปรดรอแอดมินตรวจสอบภายใน 1-3 วันทำการ");
      navigate('/profile');
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || "กรุณาลองใหม่อีกครั้ง"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black mb-6 hover:text-slate-600 transition-colors uppercase text-[10px] tracking-widest">
        <ChevronLeft size={16} /> Back to profile
      </button>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-50">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl rotate-3">
            <ScrollText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
              Writer <span className="text-orange-500">Registration</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ยืนยันตัวตนเพื่อเริ่มสร้างรายได้</p>
          </div>
        </div>

        {/* 1. ข้อมูลนักเขียน & นามปากกา */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-800 font-black uppercase italic text-sm border-l-4 border-orange-500 pl-3">
              <User size={18} className="text-orange-500" /> Writer Profile
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Pen Name (นามปากกา)</label>
                <input name="penName" value={formData.penName} onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 font-bold" placeholder="ระบุนามปากกา" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">First Name</label>
                  <input name="realName" onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none" placeholder="ชื่อจริง" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Last Name</label>
                  <input name="realSurname" onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none" placeholder="นามสกุล" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ID Card Number</label>
                <input name="idCardNumber" maxLength={13} onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none font-mono" placeholder="เลขบัตรประชาชน 13 หลัก" />
              </div>
            </div>
          </section>

          {/* 2. ข้อมูลธนาคาร */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-800 font-black uppercase italic text-sm border-l-4 border-blue-500 pl-3">
              <Building2 size={18} className="text-blue-500" /> Bank Account
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Bank Name</label>
                <select name="bankName" onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none cursor-pointer font-bold">
                  <option value="">เลือกธนาคาร</option>
                  <option value="KBANK">กสิกรไทย (KBANK)</option>
                  <option value="SCB">ไทยพาณิชย์ (SCB)</option>
                  <option value="BBL">กรุงเทพ (BBL)</option>
                  <option value="KTB">กรุงไทย (KTB)</option>
                  <option value="BAY">กรุงศรี (BAY)</option>
                  <option value="TTB">ทหารไทยธนชาต (TTB)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Account Number</label>
                <input name="bankAccount" onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none font-mono" placeholder="เลขบัญชีธนาคาร" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Account Holder Name</label>
                <input name="bankAccountName" onChange={handleChange} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="ชื่อบัญชี (ตรงตามบัตร)" />
              </div>
            </div>
          </section>
        </div>

        {/* 3. Identity Documents (Upload) */}
        <section className="bg-slate-50 p-6 rounded-[2.5rem] mb-10 border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CreditCard size={14} /> Upload Documents
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2">ภาพบัตรประชาชน</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => setIdCardImage(e.target.files[0])}
                  className="w-full text-[10px] p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white focus:border-orange-500 transition-all cursor-pointer font-bold text-slate-400"
                />
                <span className="absolute right-4 top-4 text-[10px] font-black text-orange-500">{idCardImage ? 'READY' : 'UPLOAD'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2">ภาพหน้าสมุดบัญชี</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => setBankBookImage(e.target.files[0])}
                  className="w-full text-[10px] p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white focus:border-orange-500 transition-all cursor-pointer font-bold text-slate-400"
                />
                <span className="absolute right-4 top-4 text-[10px] font-black text-orange-500">{bankBookImage ? 'READY' : 'UPLOAD'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Revenue Split Info */}
        <section className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 mb-10 relative overflow-hidden group">
          <h3 className="flex items-center gap-2 text-orange-800 font-black mb-2 italic uppercase text-lg">
            <CircleDollarSign className="group-hover:rotate-12 transition-transform" /> 
            Revenue Split ({shareSettings.writerShare}/{shareSettings.systemShare})
          </h3>
          <p className="text-orange-900/70 font-bold leading-relaxed text-sm">
            คุณจะได้รับส่วนแบ่งรายได้ <span className="text-orange-600 text-xl font-black italic">{shareSettings.writerShare}%</span> จากยอดขาย และระบบจะหักค่าธรรมเนียมเพียง {shareSettings.systemShare}%
          </p>
        </section>

        {/* 5. Checkbox & Submit */}
        <label className="flex items-start gap-4 p-6 bg-slate-900 rounded-[2rem] cursor-pointer mb-8 hover:bg-slate-800 transition-all">
          <input 
            type="checkbox" 
            className="w-5 h-5 mt-1 accent-orange-500 rounded-lg"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-white font-bold text-[11px] leading-5 uppercase tracking-tight">
            ฉันขอยืนยันว่าข้อมูลข้างต้นเป็นความจริง และยอมรับเงื่อนไขการแบ่งรายได้ <span className="text-orange-500 font-black">{shareSettings.writerShare}%</span> ทุกประการ
          </span>
        </label>

        <button 
          onClick={handleApply}
          disabled={!agreed || loading}
          className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all italic uppercase tracking-tighter shadow-2xl ${
            agreed && !loading ? 'bg-orange-500 text-white hover:bg-slate-900 hover:-translate-y-1 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>{agreed && <CheckCircle2 size={24} />} Apply for Writer Identity</>
          )}
        </button>
      </div>
    </div>
  );
};

export default WriterTerms;