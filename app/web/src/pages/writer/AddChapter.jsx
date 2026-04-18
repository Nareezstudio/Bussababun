import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Coins, Type, Send, FileText } from 'lucide-react';
import api from '../../api/axios';

// Import ReactQuill (ตัวใหม่ที่แก้ปัญหา React 19)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddChapter = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // รวม State ให้เป็นหนึ่งเดียว
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: 0,
  });

  // --- 🚀 Image Handler (Cloudinary) ---
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      try {
        setLoading(true);
        const res = await api.post('/writer/upload-image', uploadData);
        const url = res.data.url;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
        quill.setSelection(range.index + 1);
      } catch (err) {
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: { image: imageHandler }
    }
  }), []);

  // ฟังก์ชันหลักในการบันทึกข้อมูล (ใช้ทั้ง Draft และ Publish)
  const handleSave = async (isPublishedStatus) => {
    // Validation
    if (!formData.title.trim()) return alert("กรุณาใส่ชื่อตอน");
    if (!formData.content || formData.content === '<p><br></p>') {
      return alert("กรุณาใส่เนื้อหานิยายของคุณ");
    }

    setLoading(true);
    try {
      // ส่งข้อมูลไปยัง API (ตรวจสอบ Path ให้ตรงกับ Backend ของคุณ)
      await api.post(`/novels/${novelId}/chapters`, {
        title: formData.title,
        content: formData.content,
        price: formData.price,
        isPublished: isPublishedStatus // ส่งสถานะไปว่า Publish หรือ Draft
      });

      alert(isPublishedStatus ? "เผยแพร่ตอนนิยายสำเร็จ!" : "บันทึกฉบับร่างสำเร็จ!");
      navigate(-1); // กลับไปหน้ารายการตอน
    } catch (err) {
      alert("ไม่สามารถบันทึกได้: " + (err.response?.data?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fadeIn pb-20">
      <style>{`
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f1f5f9; padding: 1.5rem; background: #fafafa; border-radius: 2rem 2rem 0 0; }
        .ql-container.ql-snow { border: none; font-size: 1.125rem; min-height: 500px; }
        .ql-editor { padding: 2.5rem; line-height: 2; color: #334155; }
        .ql-editor img { border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin: 1rem 0; }
      `}</style>

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-20">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Type className="text-orange-500" /> เขียนตอนนิยาย
          </h1>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="p-3 text-slate-400 hover:bg-white rounded-2xl transition-colors"
            >
              <X />
            </button>

            {/* ปุ่มบันทึกร่าง */}
            <button 
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <FileText size={20} /> {loading ? '...' : 'บันทึกร่าง'}
            </button>

            {/* ปุ่มเผยแพร่ */}
            <button 
              type="button" 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send size={20} /> {loading ? 'กำลังส่ง...' : 'เผยแพร่ตอน'}
            </button>
          </div>
        </div>

        {/* Chapter Title */}
        <input 
          className="w-full text-4xl font-black outline-none border-none py-4 bg-transparent placeholder-slate-200 focus:placeholder-slate-300 transition-all"
          placeholder="บทที่... หรือ ชื่อตอน"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />

        {/* ส่วนตั้งราคา */}
        <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-100/50">
          <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm">
            <Coins size={24}/>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-orange-800 text-sm italic uppercase tracking-tight">Chapter Pricing</span>
            <span className="text-orange-600/60 text-[10px] font-bold uppercase">ใส่ 0 หากต้องการให้ผู้ใช้อ่านฟรี</span>
          </div>
          <div className="flex-1"></div>
          <div className="relative group">
            <input 
              type="number"
              min="0"
              className="w-32 pl-5 pr-12 py-3.5 rounded-2xl border-none font-black text-orange-600 outline-none focus:ring-4 focus:ring-orange-200 shadow-inner bg-white/80 transition-all text-xl"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 font-black italic text-sm group-focus-within:text-orange-500 transition-colors">Coins</span>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100">
          <ReactQuill 
            ref={quillRef}
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({...formData, content})}
            modules={modules}
            placeholder="เริ่มบรรเลงจินตนาการของคุณที่นี่..."
          />
        </div>
      </div>
    </div>
  );
};

export default AddChapter;