import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TicketPercent } from 'lucide-react';
import api from '../../api/axios';

const PromotionSection = () => {
    const [novels, setNovels] = useState([]);

    useEffect(() => {
        api.get('/novels/promoted').then(res => setNovels(res.data));
    }, []);

    if (novels.length === 0) return null; // ถ้าไม่มีโปรฯ ไม่ต้องโชว์ Section นี้

    return (
        <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-[3rem] my-10 px-8 relative overflow-hidden">
            {/* ตกแต่งพื้นหลังเล็กน้อย */}
            <div className="absolute top-[-20px] right-[-20px] text-orange-200 opacity-20">
                <TicketPercent size={200} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-2xl text-white shadow-lg animate-bounce">
                        <Flame size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 italic">HOT PROMOTIONS</h2>
                        <p className="text-orange-600 font-bold text-sm">นิยายลดราคาพิเศษเฉพาะช่วงนี้เท่านั้น!</p>
                    </div>
                </div>
                <Link to="/promotions" className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
                    ดูทั้งหมด →
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
                {novels.map((novel) => {
                    const promo = novel.promotions[0]; // ดึงโปรฯ แรกมาโชว์
                    return (
                        <Link key={novel.id} to={`/novel/${novel.id}`} className="group">
                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                                <img src={novel.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                
                                {/* Badge ส่วนลด */}
                                <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                    {promo.discountType === 'PERCENT' ? `ลด ${promo.discountValue}%` : `ลด ${promo.discountValue} 🪙`}
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="font-bold text-slate-800 truncate group-hover:text-orange-500 transition-colors">
                                    {novel.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-through">ปกติราคาเต็ม</p>
                                <p className="text-orange-600 font-black">ดีลพิเศษตอนนี้!</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default PromotionSection;