import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingBag, Calendar, Coins, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PurchaseHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/purchases/history');
        setHistory(res.data);
      } catch (err) {
        console.error("Load history failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-slate-400">LOADING TRANSACTIONS...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
          <ShoppingBag className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">Purchase History</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">บันทึกการเติมเหรียญและสั่งซื้อ</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <p className="text-slate-400 font-black italic">ไม่พบประวัติการซื้อของคุณ</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="group bg-white border border-slate-100 p-6 rounded-[2.2rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                  <img src={item.chapter?.novel?.coverImage} className="w-full h-full object-cover" alt="cover" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 line-clamp-1">{item.chapter?.title}</h4>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                    <BookOpen size={12} /> {item.chapter?.novel?.title}
                  </p>
                  <p className="text-slate-300 text-[10px] font-bold mt-1 flex items-center gap-1">
                    <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">Amount Paid</p>
                  <div className="flex items-center gap-1.5 font-black text-orange-500 text-xl">
                    <Coins size={18} /> {item.amount}
                  </div>
                </div>
                <Link to={`/reader/${item.chapterId}`} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200">
                  <ExternalLink size={20} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;