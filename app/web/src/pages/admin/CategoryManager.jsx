import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trash2, Plus, Tag, Loader2, Hash, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 1. ดึงข้อมูลหมวดหมู่
  const fetchCats = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.data || []);
    } catch (err) {
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    } finally {
      setLoading(false);
    }
  };

  // 2. เพิ่มหมวดหมู่ใหม่
  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!newCat.trim()) return toast.error("กรุณาระบุชื่อหมวดหมู่");
    
    setIsAdding(true);
    try {
      await api.post('/admin/categories', { name: newCat.trim() });
      setNewCat("");
      toast.success("เพิ่มหมวดหมู่เรียบร้อย");
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsAdding(false);
    }
  };

  // 3. ลบหมวดหมู่
  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบหมวดหมู่ "${name}"?`)) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success("ลบหมวดหมู่แล้ว");
      setCategories(prev => prev.filter(c => c.id !== id)); // ลบออกแบบ Real-time ใน UI
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่สามารถลบได้");
    }
  };

  useEffect(() => { fetchCats(); }, []);

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-2xl animate-fadeIn">
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] mb-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Novel <span className="text-orange-500">Categories</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic mt-1">
            Total System Tags: {categories.length}
          </p>
        </div>
        <Hash className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 -rotate-12" />
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-10 space-y-8">
        
        {/* Input Form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Ex: แฟนตาซี, กำลังภายใน..."
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none font-bold transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={isAdding}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>Add</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-1 gap-3">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div 
                key={cat.id} 
                className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Hash size={16} className="font-bold" />
                  </div>
                  <span className="font-black text-slate-700 italic uppercase tracking-tight text-lg">
                    {cat.name}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)} 
                  className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <AlertCircle size={48} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="font-black uppercase italic tracking-widest text-xs">No Categories Defined</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Content Hierarchy Management System
      </p>
    </div>
  );
};

export default CategoryManager;