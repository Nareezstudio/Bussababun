import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Camera, Save, X, UploadCloud, ChevronDown } from 'lucide-react';

const CreateNovel = () => {
  const navigate = useNavigate();
  
  // ✅ เพิ่ม categories state เพื่อเก็บรายการหมวดหมู่จาก DB
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ONGOING',
    categoryId: '' // ✅ เพิ่มฟิลด์ categoryId
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ 1. ดึงข้อมูลหมวดหมู่เมื่อโหลดหน้า
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/novels/categories'); 
        // แก้ไขบรรทัดนี้: จากเดิม setCategories(res.data) 
        // เป็น setCategories(res.data.data) เพราะ API หุ้ม data มาอีกชั้น
        if (res.data && res.data.success) {
          setCategories(res.data.data); 
        }
      } catch (err) {
        console.error("ดึงหมวดหมู่ไม่สำเร็จ:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ 2. ตรวจสอบเงื่อนไขตาม Backend
    if (!imageFile) return alert("กรุณาอัปโหลดรูปปกนิยาย");
    if (!formData.categoryId) return alert("กรุณาเลือกหมวดหมู่");

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('categoryId', formData.categoryId); // ✅ ส่ง ID หมวดหมู่
      data.append('coverImage', imageFile); 

      await api.post('/novels', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("สร้างนิยายสำเร็จ!");
      navigate('/writer/dashboard');
    } catch (err) {
      console.error("Error creating novel:", err);
      alert(err.response?.data?.message || "ไม่สามารถสร้างนิยายได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-800">สร้างนิยายเรื่องใหม่</h1>
        <button onClick={() => navigate('/writer/dashboard')} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ส่วนอัปโหลดรูปปก */}
        <div className="md:col-span-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">รูปปก (สัดส่วน 3:4)</label>
          <div 
            className={`aspect-[3/4] relative rounded-[2rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer
              ${previewUrl ? 'border-transparent' : 'border-slate-200 bg-slate-100 hover:bg-slate-50 text-slate-400'}`}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </>
            ) : (
              <>
                <UploadCloud size={40} />
                <span className="text-sm font-bold text-center px-4">คลิกเพื่ออัปโหลด</span>
              </>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        {/* รายละเอียดนิยาย */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อเรื่อง</label>
            <input 
              type="text" required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="ใส่ชื่อเรื่องของคุณ..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* ✅ 3. เพิ่มช่องเลือกหมวดหมู่ที่นี่ */}
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-2">หมวดหมู่</label>
            <div className="relative">
              <select 
                required
                className="..."
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {/* ใช้ categories && categories.length เพื่อความปลอดภัย */}
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <option disabled>กำลังโหลดข้อมูล...</option>
                )}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">คำโปรย / รายละเอียด</label>
            <textarea 
              rows="6"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="เล่าเรื่องย่อให้น่าสนใจ..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={20} /> {loading ? 'กำลังบันทึก...' : 'ลงทะเบียนนิยาย'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNovel;