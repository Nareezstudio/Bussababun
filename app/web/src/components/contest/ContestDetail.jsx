import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, Trophy, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    // api.get(`/contests/${id}`).then(res => setContest(res.data.data));
    // Mock data สำหรับตัวอย่าง
    setContest({
      title: "ประกวดนิยายรักโรแมนติก 2026",
      description: "ร่วมถ่ายทอดเรื่องราวความรักสุดประทับใจ ไม่จำกัดรูปแบบ...",
      rules: [
        "เป็นนิยายประเภทรักโรแมนติกเท่านั้น",
        "ต้องมีเนื้อหาอย่างน้อย 3 ตอนขึ้นไป",
        "เนื้อหาต้องไม่คัดลอก หรือดัดแปลงจากผลงานผู้อื่น",
        "ผลงานต้องเขียนและเผยแพร่บน Bussababun เท่านั้น"
      ],
      prizes: [
        { rank: "ชนะเลิศ", reward: "10,000 บาท + โล่เกียรติยศ" },
        { rank: "รองอันดับ 1", reward: "5,000 บาท" },
        { rank: "Popular Vote", reward: "3,000 บาท" }
      ]
    });
  }, [id]);

  if (!contest) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <div className="rounded-[3rem] overflow-hidden bg-white border border-slate-100 shadow-2xl">
        <div className="h-80 bg-slate-200 relative">
          <img src="/api/placeholder/800/400" className="w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h1 className="absolute bottom-8 left-10 text-4xl font-black text-white italic uppercase tracking-tighter">{contest.title}</h1>
        </div>

        <div className="p-10">
          {/* ส่วนของกติกา */}
          <section className="mb-12">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 uppercase mb-6 italic">
              <Info className="text-purple-600" /> กติกาการเข้าร่วม
            </h2>
            <div className="grid gap-4">
              {contest.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={18} />
                  <p className="text-slate-600 font-bold text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ส่วนของรางวัล */}
          <section className="mb-12">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 uppercase mb-6 italic">
              <Trophy className="text-yellow-500" /> รางวัลการประกวด
            </h2>
            <div className="bg-orange-50 rounded-[2rem] p-8 border-2 border-orange-100">
              {contest.prizes.map((p, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-orange-200 last:border-0">
                  <span className="font-black text-slate-700">{p.rank}</span>
                  <span className="font-black text-orange-600 uppercase italic">{p.reward}</span>
                </div>
              ))}
            </div>
          </section>

          {/* เงื่อนไขสำคัญ (สิ่งที่คุณขอ) */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 mb-12">
            <h3 className="flex items-center gap-2 text-blue-800 font-black mb-3">
              <ShieldCheck size={20} /> เงื่อนไขและข้อกำหนดทางกฎหมาย
            </h3>
            <ul className="text-xs text-blue-700 font-bold space-y-2 list-disc ml-5">
              <li>ลิขสิทธิ์ผลงานยังคงเป็นของนักเขียน 100% แต่ Bussababun ขอสิทธิ์ในการโปรโมท</li>
              <li>การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด</li>
              <li>หากตรวจพบการทุจริต ทีมงานขอสงวนสิทธิ์ในการตัดสิทธิ์ทันทีโดยไม่แจ้งให้ทราบล่วงหน้า</li>
              <li>เงินรางวัลจะถูกหักภาษี ณ ที่จ่ายตามที่กฎหมายกำหนด</li>
            </ul>
          </div>

          <button 
            onClick={() => navigate('/writer/dashboard')} // ส่งกลับไปหน้า Dashboard เพื่อให้เลือกนิยาย
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-3xl font-black text-sm uppercase shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            ไปที่สตูดิโอเพื่อเลือกนิยายส่งประกวด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;