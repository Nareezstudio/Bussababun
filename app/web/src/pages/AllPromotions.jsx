import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketPercent, ChevronLeft } from 'lucide-react';
import api from '../api/axios';

const AllPromotions = () => {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllPromotions = async () => {
            try {
                const res = await api.get('/novels/promoted');
                setNovels(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPromotions();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/300x400?text=No+Cover";
        if (path.includes('http')) return path; 
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`; 
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-400">กำลังรวบรวมดีลสุดพิเศษ...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-8 font-bold transition-colors">
                <ChevronLeft size={20} /> กลับไปหน้าแรก
            </button>

            <header className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg">
                        <TicketPercent size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800">โปรโมชั่นทั้งหมด</h1>
                </div>
                <p className="text-slate-500 font-medium ml-16">รวมดีลเด็ดนิยายลดราคาที่คุณไม่ควรพลาด</p>
            </header>

            {novels.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] text-slate-400 font-bold">
                    ขออภัย ขณะนี้ยังไม่มีโปรโมชั่นใหม่ๆ
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {novels.map((novel) => {
                        const promo = novel.promotions[0];
                        return (
                            <div key={novel.id} onClick={() => navigate(`/novel/${novel.id}`)} className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500">
                                    <img src={getImageUrl(novel.coverImage)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                                        {promo.discountType === 'PERCENT' ? `ลด ${promo.discountValue}%` : `ลด ${promo.discountValue} 🪙`}
                                    </div>
                                </div>
                                <div className="mt-4 px-2 text-center">
                                    <h3 className="font-black text-slate-800 truncate group-hover:text-orange-500 transition-colors">{novel.title}</h3>
                                    <div className="text-orange-600 font-black text-sm mt-1 uppercase tracking-tighter">Limited Time Offer</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllPromotions;