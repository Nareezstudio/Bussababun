import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Coins, FileText, Send } from 'lucide-react';
import api from '../../api/axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const EditChapter = () => {
  const { novelId, chapterId } = useParams(); // รับ novelId มาด้วยเพื่อใช้ตอนย้อนกลับ
  const navigate = useNavigate();
  const quillRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: 0,
    isPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const data = new FormData();
      data.append('file', file);
      try {
        setSaving(true);
        const res = await api.post('/writer/upload-image', data);
        const url = res.data.url;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
        quill.setSelection(range.index + 1);
      } catch (err) {
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
      } finally {
        setSaving(false);
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

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/chapters/edit/${chapterId}`);
        setFormData({
          title: res.data.title,
          content: res.data.content,
          price: res.data.price,
          isPublished: res.data.isPublished
        });
      } catch (err) {
        alert("ไม่สามารถดึงข้อมูลตอนได้");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId, navigate]);

  const handleUpdate = async (publishStatus) => {
    if (!formData.title.trim()) return alert("กรุณาใส่ชื่อตอน");
    if (!formData.content || formData.content === '<p><br></p>') return alert("กรุณาใส่เนื้อหา");

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        content: formData.content,
        price: Number(formData.price),
        isPublished: publishStatus 
      };

      await api.put(`/chapters/${chapterId}`, payload);
      alert(publishStatus ? "อัปเดตและเผยแพร่สำเร็จ!" : "บันทึกฉบับร่างสำเร็จ!");
      navigate(`/writer/novel/${novelId}/chapters`); // ย้อนกลับไปหน้าจัดการตอนของเรื่องนั้น
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400">กำลังโหลดเนื้อหาเดิม...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fadeIn pb-20">
      <style>{`
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f1f5f9; padding: 1.5rem; background: #fafafa; border-radius: 2rem 2rem 0 0; }
        .ql-container.ql-snow { border: none; font-size: 1.125rem; min-height: 600px; }
        .ql-editor { padding: 2.5rem; line-height: 2.2; color: #334155; }
        .ql-editor img { border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin: 1.5rem 0; max-width: 100%; height: auto; }
      `}</style>

      <div className="flex justify-between items-center sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-20 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 hover:text-orange-500 rounded-2xl shadow-sm transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Type className="text-orange-500" /> แก้ไขตอนนิยาย
          </h1>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleUpdate(false)} disabled={saving} className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <FileText size={20} /> {saving ? '...' : 'บันทึกร่าง'}
          </button>
          <button onClick={() => handleUpdate(true)} disabled={saving} className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all">
            <Send size={20} /> {saving ? 'กำลังบันทึก...' : 'อัปเดตและเผยแพร่'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <input 
          className="w-full text-4xl font-black outline-none border-none py-4 bg-transparent placeholder-slate-200 focus:placeholder-slate-300 transition-all"
          placeholder="ระบุชื่อตอนที่นี่..."
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />

        <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-[2.5rem] border border-orange-100 shadow-sm">
          <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm"><Coins size={24}/></div>
          <div className="flex flex-col">
            <span className="font-black text-orange-800 text-sm italic tracking-tight">SET COIN PRICE</span>
            <span className="text-orange-600/60 text-[10px] font-bold uppercase">ราคาของตอนนี้</span>
          </div>
          <div className="flex-1"></div>
          <div className="relative">
            <input 
              type="number" min="0"
              className="w-32 pl-5 pr-12 py-3.5 rounded-2xl border-none font-black text-orange-600 outline-none focus:ring-4 focus:ring-orange-200 shadow-inner bg-white/80 transition-all text-xl"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 font-black italic text-sm">Coins</span>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100">
          <ReactQuill 
            ref={quillRef} theme="snow" value={formData.content}
            onChange={(content) => setFormData({...formData, content})}
            modules={modules} placeholder="เนื้อหานิยายที่แก้ไขใหม่..."
          />
        </div>
      </div>
    </div>
  );
};

export default EditChapter;