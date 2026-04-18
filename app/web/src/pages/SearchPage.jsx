import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        // ยิงไปที่ /novels/search ตามที่คุณตั้งไว้ใน novelRoutes.js
        const res = await api.get(`/novels/search?q=${encodeURIComponent(query)}`);
        if (res.data) {
          // ปรับตามโครงสร้าง Response ของ Controller คุณ
          setResults(Array.isArray(res.data) ? res.data : (res.data.data || []));
        }
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-black italic uppercase mb-8 text-slate-800">
        ผลการค้นหา: <span className="text-orange-500">"{query}"</span>
      </h2>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-400 font-bold italic">กำลังค้นหา...</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {results.map(novel => (
            <Link to={`/novel/${novel.id}`} key={novel.id} className="group">
              <div className="aspect-[3/4] bg-slate-200 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-orange-200 group-hover:shadow-lg transition-all">
                {novel.coverImage ? (
                  <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">NO IMAGE</div>
                )}
              </div>
              <h3 className="font-bold text-sm line-clamp-1 group-hover:text-orange-500">{novel.title}</h3>
              <p className="text-xs text-slate-500 italic">โดย {novel.author?.username || novel.authorName}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 font-bold italic">ไม่พบข้อมูลที่ค้นหา</div>
      )}
    </div>
  );
};

export default SearchPage;