import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  BookOpen, 
  Layers, 
  Plus, 
  Search, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import api from '../../api/axios';

const PromotionDashboard = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, EPISODE, FULL, CODE

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await api.get('/promotions/my-promotions');
                setPromotions(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Fetch error:", err);
                setPromotions([]); 
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    // กรองข้อมูลตาม Tab
    const filteredPromotions = promotions.filter(p => {
        if (activeTab === 'ALL') return true;
        return p.type === activeTab;
    });

    const getStatusBadge = (start, end, isActive) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (!isActive) return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-red-100">Disabled</span>;
        if (now < startDate) return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-amber-100">Upcoming</span>;
        if (now > endDate) return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-slate-200">Expired</span>;
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100 animate-pulse">Live Now</span>;
    };

    const getTypeInfo = (type) => {
        switch(type) {
            case 'EPISODE': return { label: 'ลดรายตอน', color: 'text-blue-600 bg-blue-50', icon: <Layers size={14} /> };
            case 'FULL': return { label: 'ลดทั้งเรื่อง', color: 'text-purple-600 bg-purple-50', icon: <BookOpen size={14} /> };
            case 'CODE': return { label: 'รหัสส่วนลด', color: 'text-orange-600 bg-orange-50', icon: <Ticket size={14} /> };
            default: return { label: 'ทั่วไป', color: 'text-slate-600 bg-slate-50', icon: <Plus size={14} /> };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase text-xs tracking-[0.3em] italic">Syncing Campaigns...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black italic text-slate-900 uppercase tracking-tighter">
                        Promo <span className="text-orange-500">Engine</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Maximize your revenue with smart discounts</p>
                </div>
                <Link to="/writer/create-promotion" className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                    <span className="font-black uppercase italic tracking-widest text-sm">New Campaign</span>
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                </Link>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-[2rem] w-fit">
                {['ALL', 'EPISODE', 'FULL', 'CODE'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab === 'ALL' ? 'ทั้งหมด' : getTypeInfo(tab).label}
                    </button>
                ))}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Campaign Details</th>
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Promotion Type</th>
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Value</th>
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Schedule</th>
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPromotions.length > 0 ? (
                                filteredPromotions.map((promo) => {
                                    const typeData = getTypeInfo(promo.type);
                                    return (
                                        <tr key={promo.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-8">
                                                <p className="text-[10px] font-black text-orange-500 uppercase italic mb-1">{promo.novel?.title || 'GENERAL'}</p>
                                                <p className="font-black text-slate-800 text-lg italic tracking-tight">{promo.name}</p>
                                                {promo.code && <span className="font-mono text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded mt-2 inline-block">CODE: {promo.code}</span>}
                                            </td>
                                            <td className="p-8">
                                                <div className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-full font-black text-[10px] uppercase italic ${typeData.color}`}>
                                                    {typeData.icon}
                                                    {typeData.label}
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <p className="text-2xl font-black italic text-slate-900 tracking-tighter">
                                                    {promo.discountType === 'PERCENT' ? `-${promo.discountValue}%` : `-${promo.discountValue}`}
                                                    <span className="text-[10px] ml-1 text-slate-400">{promo.discountType === 'COIN' ? 'COINS' : 'OFF'}</span>
                                                </p>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                        <Calendar size={12} className="text-slate-300" />
                                                        {new Date(promo.startDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px]">
                                                        <div className="w-1 h-4 bg-slate-200 rounded-full"></div>
                                                        TO {new Date(promo.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                {getStatusBadge(promo.startDate, promo.endDate, promo.isActive)}
                                            </td>
                                            <td className="p-8">
                                                <Link 
                                                    to={`/writer/report/${promo.id}`}
                                                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all group-hover:scale-110"
                                                >
                                                    <ChevronRight size={20} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-24 text-center">
                                        <Search size={48} className="mx-auto text-slate-100 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">No active campaigns found in this category</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PromotionDashboard;