import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Users, Coins, Calendar, FileText } from 'lucide-react';
import api from '../../api/axios';

const SalesReport = () => {
    const { promotionId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/promotions/report/${promotionId}`);
                setReport(res.data);
            } catch (err) {
                console.error("Error fetching report:", err);
                alert("ไม่สามารถโหลดข้อมูลรายงานได้");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [promotionId]);

    if (loading) return <div className="p-20 text-center text-slate-500 font-bold">กำลังประมวลผลข้อมูลยอดขาย...</div>;
    if (!report) return <div className="p-20 text-center text-red-500">ไม่พบข้อมูลรายงาน</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ChevronLeft size={20} /> กลับไปหน้าจัดการ
                </button>
                <div className="text-right">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        สถานะ: สรุปผลแล้ว
                    </span>
                </div>
            </div>

            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-800 mb-2">📊 รายงานประสิทธิภาพโปรโมชั่น</h1>
                <p className="text-slate-500 flex items-center gap-2">
                    <FileText size={16}/> แคมเปญ: <span className="font-bold text-slate-700">{report.promotionName}</span> 
                    | นิยายเรื่อง: <span className="font-bold text-slate-700">{report.novelTitle}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
                        <Coins size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">รายได้รวม (เหรียญ)</p>
                    <p className="text-3xl font-black text-slate-800">{report.stats.totalCoins.toLocaleString()} 🪙</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                        <Users size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">จำนวนการซื้อทั้งหมด</p>
                    <p className="text-3xl font-black text-slate-800">{report.stats.totalOrders.toLocaleString()} ครั้ง</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">เฉลี่ยต่อออเดอร์</p>
                    <p className="text-3xl font-black text-slate-800">
                        {(report.stats.totalCoins / report.stats.totalOrders || 0).toFixed(2)} 🪙
                    </p>
                </div>
            </div>

            {/* รายละเอียดการขาย */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">รายละเอียดประวัติการซื้อ</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={16} /> 
                        {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                            <tr>
                                <th className="p-6">ตอนที่ขายได้</th>
                                <th className="p-6 text-center">ผู้ซื้อ</th>
                                <th className="p-6 text-center">ยอดสุทธิ</th>
                                <th className="p-6 text-right">วันที่/เวลา</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {report.stats.salesData.length > 0 ? (
                                report.stats.salesData.map((sale, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-6 font-bold text-slate-700">{sale.chapter.title}</td>
                                        <td className="p-6 text-center text-slate-600">@{sale.user?.username}</td>
                                        <td className="p-6 text-center font-black text-green-600">{sale.amount} 🪙</td>
                                        <td className="p-6 text-right text-slate-400 text-xs">
                                            {new Date(sale.createdAt).toLocaleString('th-TH')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400">ยังไม่มีข้อมูลการขายในช่วงนี้</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;