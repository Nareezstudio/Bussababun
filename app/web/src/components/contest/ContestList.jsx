import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get('/contests');
        setContests(res.data.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-purple-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Contest Zone</h1>
        <p className="text-slate-500 font-bold">สนามประลองนักเขียนหน้าใหม่ ชิงรางวัลและเกียรติยศ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contests.map((contest) => (
          <div key={contest.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="h-52 bg-purple-600 relative overflow-hidden">
              <img src={contest.banner || '/api/placeholder/400/200'} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                กำลังเปิดรับผลงาน
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-800 mb-3">{contest.title}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">{contest.description}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm font-bold text-slate-600">
                  <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                  <span>รางวัลรวม {contest.prizePool?.toLocaleString()} บาท</span>
                </div>
                <div className="flex items-center text-sm font-bold text-slate-600">
                  <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                  <span>หมดเขต {new Date(contest.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/contest/${contest.id}`)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-purple-600 transition-all flex items-center justify-center group"
              >
                ดูรายละเอียดและส่งผลงาน
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContestList;