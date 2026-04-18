import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import api from '../api/axios';

const CommentSection = ({ novelId, chapterId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    // ✅ Guard: ป้องกัน Error 404 เมื่อ novelId ยังเป็น undefined
    if (!novelId || novelId === "undefined") return;
    
    try {
      const res = await api.get(`/novels/${novelId}/reviews`);
      setComments(Array.isArray(res.data) ? res.data : (res.data.reviews || []));
    } catch (err) { 
      if (err.response?.status !== 404) console.error("Fetch Error:", err); 
    }
  }, [novelId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, chapterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !novelId) return;

    setLoading(true);
    try {
      const res = await api.post(`/novels/${novelId}/reviews`, { 
        content: newComment.trim() 
      });

      if (res.status === 201) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error("Comment Error:", err);
      alert(err.response?.status === 401 ? "กรุณาเข้าสู่ระบบก่อนคอมเมนต์" : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-10">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-orange-500" size={24} /> 
        ความคิดเห็น ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative">
          <textarea
            className="w-full p-4 pb-14 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none shadow-sm"
            placeholder="แชร์ความรู้สึกหลังอ่านตอนนี้..."
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute bottom-3 right-3 bg-orange-500 text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-600 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-orange-100"
          >
            {loading ? "..." : <><Send size={18} /> ส่ง</>}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold italic">ยังไม่มีคอมเมนต์ มาประเดิมคนแรกกัน!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-5 rounded-[2rem] bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-inner">
                {comment.user?.profileImage ? (
                  <img src={comment.user.profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-slate-800">{comment.user?.username || "นักอ่านไร้นาม"}</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;