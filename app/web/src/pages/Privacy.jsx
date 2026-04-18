import React from 'react';
import { Lock } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-500">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic">Privacy Policy</h1>
        </div>
        
        <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>ข้อมูลส่วนตัวของคุณจะถูกเก็บรักษาไว้อย่างปลอดภัยตามมาตรฐาน Bussababun Official</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>เราเก็บข้อมูลเฉพาะที่จำเป็น เช่น อีเมล และชื่อผู้ใช้ เพื่อการเข้าถึงระบบ</li>
            <li>ข้อมูลการเติมเงินจะถูกจัดการผ่านระบบ Payment Gateway ที่มีความปลอดภัยสูง</li>
            <li>เราไม่เปิดเผยข้อมูลส่วนตัวของคุณให้กับบุคคลที่สามโดยไม่ได้รับอนุญาต</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Privacy;