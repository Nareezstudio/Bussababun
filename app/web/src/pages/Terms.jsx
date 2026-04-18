import React from 'react';
import { ShieldAlert } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-500">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic">Terms of Service</h1>
        </div>
        
        <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-800 mb-3">1. การใช้งานแพลตฟอร์ม</h2>
            <p>ผู้ใช้งานตกลงจะใช้งาน Bussababun เพื่อการอ่านและเขียนนิยายอย่างสร้างสรรค์ โดยไม่ละเมิดสิทธิ์ของผู้อื่น</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-800 mb-3">2. ลิขสิทธิ์ผลงาน</h2>
            <p>ผลงานนิยายที่ลงในระบบเป็นลิขสิทธิ์ของผู้เขียนแต่เพียงผู้เดียว แพลตฟอร์มเป็นเพียงสื่อกลางในการเผยแพร่และจัดการรายได้</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-800 mb-3">3. ระบบการเงินและคอยน์</h2>
            <p>คอยน์ที่เติมในระบบไม่สามารถแลกคืนเป็นเงินสดได้ แต่สามารถใช้สนับสนุนนักเขียนภายในระบบได้ตามความต้องการ</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;