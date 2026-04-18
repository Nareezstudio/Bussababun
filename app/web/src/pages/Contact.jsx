import React from 'react';
import { Mail, MessageCircle, Globe } from 'lucide-react';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50 text-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic mb-2">Contact Us</h1>
        <p className="text-slate-400 font-bold mb-10">มีปัญหาการใช้งานหรือต้องการสอบถามข้อมูลเพิ่มเติม?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-slate-50 rounded-[2rem] hover:bg-orange-50 transition-colors group">
            <Mail className="mx-auto mb-4 text-slate-400 group-hover:text-orange-500" size={32} />
            <p className="font-black text-slate-800">Email</p>
            <p className="text-xs text-slate-500">support@bussababun.com</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] hover:bg-orange-50 transition-colors group">
            <MessageCircle className="mx-auto mb-4 text-slate-400 group-hover:text-orange-500" size={32} />
            <p className="font-black text-slate-800">Line Official</p>
            <p className="text-xs text-slate-500">@Bussababun</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] hover:bg-orange-50 transition-colors group">
            <Globe className="mx-auto mb-4 text-slate-400 group-hover:text-orange-500" size={32} />
            <p className="font-black text-slate-800">Facebook</p>
            <p className="text-xs text-slate-500">Bussababun Official</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;