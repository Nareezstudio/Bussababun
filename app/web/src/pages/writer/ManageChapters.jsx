import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, ChevronLeft, Loader2, 
  Coins, Eye, FileText, CheckCircle2, GripVertical, Save 
} from 'lucide-react';
import api from '../../api/axios';

// --- DND Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableRow = ({ ch, novelId, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ch.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <tr ref={setNodeRef} style={style} className={`transition-colors group ${isDragging ? 'bg-white shadow-2xl border-y border-orange-200' : 'hover:bg-slate-50/30'}`}>
      <td className="px-6 py-6 text-center">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-orange-500 transition-colors">
          <GripVertical size={20} />
        </button>
      </td>
      <td className="px-8 py-6 font-bold text-slate-300 group-hover:text-orange-500 transition-colors">
        {String(ch.chapterNumber).padStart(2, '0')}
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="font-black text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">{ch.title}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(ch.createdAt).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <div className="flex justify-center">
          {ch.isPublished ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
              <CheckCircle2 size={12} /> Published
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">
              <FileText size={12} /> Draft
            </span>
          )}
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-center gap-1 font-black text-orange-600">
          {ch.price > 0 ? (
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-xl">
              <Coins size={14} />
              <span>{ch.price}</span>
            </div>
          ) : (
            <span className="text-slate-300 text-xs italic uppercase">Free</span>
          )}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => window.open(`/novel/${novelId}/chapter/${ch.id}`, '_blank')}
            className="p-2 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
            title="ดูตัวอย่าง"
          >
            <Eye size={18}/>
          </button>
          <button 
            onClick={() => onEdit(ch.id)}
            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
            title="แก้ไขเนื้อหา"
          >
            <Edit2 size={18}/>
          </button>
          <button 
            onClick={() => onDelete(ch.id)} 
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="ลบ"
          >
            <Trash2 size={18}/>
          </button>
        </div>
      </td>
    </tr>
  );
};

const ManageChapters = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [novelRes, chaptersRes] = await Promise.all([
        api.get(`/novels/${novelId}`),
        api.get(`/novels/${novelId}/chapters`)
      ]);
      setNovel(novelRes.data);
      setChapters(chaptersRes.data.sort((a, b) => a.chapterNumber - b.chapterNumber));
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [novelId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        return newArray.map((ch, index) => ({ ...ch, chapterNumber: index + 1 }));
      });
      setIsOrdering(true);
    }
  };

  const saveNewOrder = async () => {
    try {
      const orders = chapters.map(ch => ({ id: ch.id, chapterNumber: ch.chapterNumber }));
      await api.patch(`/chapters/reorder/${novelId}`, { orders });
      alert("บันทึกลำดับตอนใหม่สำเร็จ");
      setIsOrdering(false);
    } catch (err) {
      alert("ไม่สามารถบันทึกลำดับได้");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบตอนนี้?")) return;
    try {
      await api.delete(`/chapters/${id}`);
      setChapters(chapters.filter(c => c.id !== id));
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="font-black text-slate-400">กำลังโหลด...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/writer/dashboard')} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-orange-500 rounded-2xl shadow-sm transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{novel?.title}</h1>
            <p className="text-orange-500 text-sm font-bold">{chapters.length} ตอนทั้งหมด (ลากเพื่อสลับลำดับ)</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isOrdering && (
            <button onClick={saveNewOrder} className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95">
              <Save size={20} /> บันทึกลำดับ
            </button>
          )}
          <button onClick={() => navigate(`/writer/novel/${novelId}/add-chapter`)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus size={20} /> เขียนตอนใหม่
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm ring-1 ring-slate-100">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="w-16"></th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">No.</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapter Title</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-slate-50">
                  {chapters.map((ch) => (
                    <SortableRow 
                      key={ch.id} ch={ch} novelId={novelId}
                      onEdit={(id) => navigate(`/writer/edit-chapter/${novelId}/${id}`)} // แก้ไข Path ตรงนี้
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default ManageChapters;