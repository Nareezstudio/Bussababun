import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, IdCard, Landmark, Upload, 
  ChevronRight, AlertCircle, Loader2, ArrowLeft, PenTool 
} from 'lucide-react';
import api from '../../api/axios';

const ReVerifyWriter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // สำหรับตอนกด Submit ฟอร์ม
  const [fetching, setFetching] = useState(true); // สำหรับตอนดึงข้อมูล Profile ครั้งแรก
  const [isUploading, setIsUploading] = useState(false); // สำหรับตอนอัปโหลดรูปไป Cloudinary
  
  const [formData, setFormData] = useState({
    realName: '',
    penName: '', // เพิ่มนามปากกา
    idCardNumber: '',
    bankAccount: '',
    bankName: '',
    idCardImage: ''
  });

  const [preview, setPreview] = useState(null);

  // 1. ดึงข้อมูลเดิมจาก Database มาใส่ใน Form
  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data;
        
        // ข้อมูลจะปรากฏในฟอร์มเพราะเรา setFormData ตรงนี้
        setFormData({
          realName: user.realName || '',
          penName: user.penName || '',
          idCardNumber: user.idCardNumber || '',
          bankAccount: user.bankAccount || '',
          bankName: user.bankName || '',
          idCardImage: user.idCardImage || ''
        });
        if (user.idCardImage) setPreview(user.idCardImage);
      } catch (err) {
        console.error("Fetch User Error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentData();
  }, []);

  // 2. ฟังก์ชันอัปโหลดรูปไป Cloudinary (ใส่ Cloud Name ของคุณไว้ให้แล้ว)
  const uploadImage = async (file) => {
    const cloudName = "dzxejfeet"; 
    const uploadPreset = "ml_default"; 

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      setIsUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      const resData = await response.json();
      if (resData.secure_url) {
        return resData.secure_url;
      }
      throw new Error("Upload failed");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, idCardImage: imageUrl }));
    }
  };

  // 3. ส่งข้อมูลทั้งหมดกลับไปที่ Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isUploading) {
      alert("กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้นก่อนส่งข้อมูล");
      return;
    }

    if (!formData.idCardImage) {
      alert("กรุณาอัปโหลดรูปหน้าบัตรประชาชน");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/writer/re-verify', formData);
      if (res.data.success) {
        alert("ส่งข้อมูลแก้ไขเรียบร้อยแล้ว! เจ้าหน้าที่จะเริ่มตรวจสอบอีกครั้ง");
        navigate('/writer/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="font-black text-slate-400">กำลังเตรียมข้อมูลเดิมของคุณ...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all active:scale-90"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">แก้ไขข้อมูลนักเขียน</h1>
          <p className="text-slate-400 font-bold italic text-xs uppercase tracking-widest">Update Pen Name & Identity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Pen Name & Personal Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest">
            <PenTool size={16} /> ข้อมูลตัวตนและนามปากกา
          </div>
          
          <div className="space-y-6">
            {/* ช่องกรอกนามปากกา */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">นามปากกา (Pen Name)</label>
              <input 
                type="text"
                required
                placeholder="ระบุนามปากกาที่ต้องการให้ผู้อ่านเห็น"
                className="w-full px-5 py-4 bg-orange-50/30 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none font-black text-orange-700 transition-all placeholder:text-orange-200"
                value={formData.penName}
                onChange={(e) => setFormData({...formData, penName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ชื่อ-นามสกุลจริง</label>
                <input 
                  type="text"
                  required
                  placeholder="สมชาย ใจดี"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                  value={formData.realName}
                  onChange={(e) => setFormData({...formData, realName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">เลขบัตรประชาชน (13 หลัก)</label>
                <input 
                  type="text"
                  required
                  maxLength={13}
                  placeholder="1xxxxxxxxxxxx"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                  value={formData.idCardNumber}
                  onChange={(e) => setFormData({...formData, idCardNumber: e.target.value.replace(/[^0-9]/g, '')})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest">
            <Landmark size={16} /> ข้อมูลการรับเงิน
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ธนาคาร</label>
              <select 
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all appearance-none"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              >
                <option value="">เลือกธนาคาร</option>
                <option value="กสิกรไทย">กสิกรไทย (K-Bank)</option>
                <option value="ไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                <option value="กรุงเทพ">กรุงเทพ (BBL)</option>
                <option value="กรุงไทย">กรุงไทย (KTB)</option>
                <option value="ออมสิน">ออมสิน (GSB)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">เลขบัญชีธนาคาร</label>
              <input 
                type="text"
                required
                placeholder="000-0-00000-0"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                value={formData.bankAccount}
                onChange={(e) => setFormData({...formData, bankAccount: e.target.value.replace(/[^0-9]/g, '')})}
              />
            </div>
          </div>
        </div>

        {/* Section 3: ID Image */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-purple-500 font-black uppercase text-xs tracking-widest">
            <IdCard size={16} /> หลักฐานยืนยันตัวตน
          </div>

          <div className="relative group overflow-hidden rounded-3xl border-4 border-dashed border-slate-100 hover:border-purple-200 transition-all h-64">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            
            {preview ? (
              <div className="relative h-full w-full">
                <img src={preview} alt="ID Preview" className={`w-full h-full object-cover transition-all ${isUploading ? 'blur-sm grayscale' : ''}`} />
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 z-10">
                    <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
                    <span className="text-[10px] font-black text-purple-600 uppercase">กำลังอัปโหลด...</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <p className="text-white font-black flex items-center gap-2"><Upload size={20} /> คลิกเพื่อเปลี่ยนรูปภาพ</p>
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 group-hover:bg-purple-50 transition-colors">
                <Upload size={48} className="mb-4 text-slate-200 group-hover:text-purple-200" />
                <p className="font-black uppercase text-xs tracking-widest">อัปโหลดรูปหน้าบัตรประชาชน</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <AlertCircle size={18} className="text-slate-400 shrink-0" />
             <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
               กรุณาถ่ายรูปให้ชัดเจน และเห็นข้อมูลครบทั้งใบ เพื่อความรวดเร็วในการตรวจสอบ
             </p>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading || isUploading}
          className={`w-full py-6 rounded-[2.2rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 
            ${loading || isUploading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'}`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>ยืนยันการแก้ไขข้อมูล <ChevronRight size={24} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReVerifyWriter;