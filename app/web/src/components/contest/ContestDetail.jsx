import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Trophy, ShieldCheck, 
  Calendar, Info, ArrowLeft, Loader2 
} from 'lucide-react';
import api from '../../api/axios';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContestData = async () => {
        try {
        setLoading(true);
        // ในอนาคตดึงจาก api.get(`/contests/${id}`)
        setContest({
            title: "ประกวดนิยายรักโรแมนติก 2026",
            description: "โปรเจกต์พิเศษเพื่อเฟ้นหานักเขียนหน้าใหม่สู่เส้นทางมืออาชีพ กับหัวข้อ 'ความรักที่ออกแบบไม่ได้'",
            endDate: "2026-05-31",
            prizePool: 6000,
            rules: [
            "นิยายต้องมีความยาวอย่างน้อย 3 ตอน และแต่ละตอนไม่ต่ำกว่า 1,000 คำ",
            "สถานะนิยายต้องตั้งค่าเป็น 'เผยแพร่' (Published) เท่านั้น",
            "ห้ามคัดลอก ดัดแปลง หรือละเมิดลิขสิทธิ์ผู้อื่นโดยเด็ดขาด",
            "หนึ่งนามปากกาสามารถส่งผลงานเข้าประกวดได้ไม่เกิน 2 เรื่อง"
            ],
            prizes: [
            { rank: "รางวัลชนะเลิศ", reward: "3,000 บาท + โล่เกียรติยศ + Banner โปรโมท 1 เดือน" },
            { rank: "รางวัลรองชนะเลิศ", reward: "1,500 บาท + Certificate" },
            { rank: "รางวัลขวัญใจนักอ่าน", reward: "1,000 บาท (ตัดสินจากยอด Engagement)" }
            ],
            // ✅ ส่วนนี้คือเงื่อนไขทางกฎหมายที่เพิ่มให้ครบถ้วน
            terms: [
            "ผู้เข้าร่วมกิจกรรมต้องมีบัญชีนักเขียนที่ยืนยันตัวตน (Verified Writer) เรียบร้อยแล้วก่อนรับรางวัล",
            "ลิขสิทธิ์ในเนื้อหานิยายเป็นของผู้เขียน 100% แต่ผู้เขียนยินยอมให้ Bussababun ใช้ส่วนหนึ่งของเนื้อหาและภาพปกเพื่อการประชาสัมพันธ์กิจกรรม",
            "เงินรางวัลจะถูกหักภาษี ณ ที่จ่าย 5% ตามที่กฎหมายไทยกำหนด",
            "หากตรวจพบการใช้โปรแกรมอัตโนมัติในการปั่นยอดการเข้าชม ทีมงานจะทำการตัดสิทธิ์โดยไม่ต้องแจ้งให้ทราบล่วงหน้า",
            "การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุดในทุกกรณี",
            "บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยจะแจ้งให้ทราบผ่านหน้าเว็บไซต์"
            ]
        });
        } catch (err) {
        console.error("Fetch Error:", err);
        } finally {
        setLoading(false);
        }
    };
    fetchContestData();
  }, [id]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-purple-600" size={48} />
    </div>
  );

  if (!contest) return <div className="text-center py-20 font-bold">ไม่พบข้อมูลรายการประกวด</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-in fade-in duration-700">
      {/* ปุ่มย้อนกลับ */}
      <button 
        onClick={() => navigate('/contest')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> ย้อนกลับไปรายการประกวด
      </button>

      <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-50">
        {/* Banner Section */}
        <div className="h-[400px] bg-slate-900 relative">
          <img 
            src="/api/placeholder/1200/600" 
            className="w-full h-full object-cover opacity-60" 
            alt="Contest Banner" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <div className="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 shadow-lg">
              Open for Submission
            </div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
              {contest.title}
            </h1>
          </div>
        </div>

        <div className="p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* ฝั่งซ้าย: รายละเอียดและกติกา */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase italic mb-6">
                  <Info className="text-purple-600" size={28} /> เกี่ยวกับการประกวด
                </h2>
                <p className="text-slate-500 font-bold leading-relaxed">{contest.description}</p>
              </section>

              <section>
                <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase italic mb-6">
                  <CheckCircle2 className="text-green-500" size={28} /> กติกาการส่งผลงาน
                </h2>
                <div className="grid gap-4">
                  {contest.rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-slate-600 font-bold text-sm leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase italic mb-6">
                  <ShieldCheck className="text-blue-500" size={28} /> เงื่อนไขและข้อกำหนด
                </h2>
                <ul className="space-y-3 list-disc ml-6 text-slate-400 font-bold text-xs">
                  {contest.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ฝั่งขวา: รางวัลและปุ่มส่งผลงาน */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100">
                <Trophy className="mb-4 text-yellow-300" size={40} />
                <h3 className="text-xl font-black uppercase italic mb-6 tracking-tight">รางวัลการแข่งขัน</h3>
                <div className="space-y-4">
                  {contest.prizes.map((p, index) => (
                    <div key={index} className="border-b border-white/20 pb-4 last:border-0">
                      <div className="text-[10px] font-black uppercase text-orange-200 mb-1">{p.rank}</div>
                      <div className="text-lg font-black tracking-tight">{p.reward}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <div className="flex items-center gap-3 mb-6 text-slate-400">
                  <Calendar size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">หมดเขตส่งผลงาน</span>
                </div>
                <div className="text-3xl font-black italic mb-8 uppercase">
                  {new Date(contest.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <button 
                  onClick={() => navigate('/writer/dashboard')}
                  className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-xs uppercase hover:bg-yellow-400 transition-all active:scale-95 shadow-xl"
                >
                  เลือกนิยายส่งเข้าประกวด
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;