import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios'; // ตรวจสอบว่า baseURL มี /api แล้ว

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // ✅ เรียก Path ให้ตรงกับ Backend Route ที่เราเพิ่งแก้
        // หมายเหตุ: ถ้า baseURL ใน axios.js คือ .../api 
        // ให้ใช้ /admin/public/announcements/ แทน
        const res = await api.get(`/admin/public/announcements/${id}`);
        
        if (res.data.success) {
          setNews(res.data.data);
        }
      } catch (err) {
        console.error("Fetch Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black italic animate-pulse">กำลังดึงข้อมูลประกาศ...</div>;
  if (!news) return <div className="p-20 text-center text-red-500 font-bold">ไม่พบประกาศนี้ในระบบ</div>;

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-black italic uppercase text-slate-800 mb-6 drop-shadow-sm">
        {news.title}
      </h1>
      <div className="flex items-center gap-2 text-orange-500 font-bold mb-8 text-sm italic">
        <span>เผยแพร่เมื่อ: {new Date(news.createdAt).toLocaleDateString('th-TH')}</span>
      </div>
      <div className="prose prose-orange max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-lg">
        {news.content}
      </div>
    </div>
  );
};

export default AnnouncementDetail;