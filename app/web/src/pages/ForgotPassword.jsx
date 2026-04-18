import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, Send } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ ยิงไปที่ Endpoint สำหรับลืมรหัสผ่าน
      await api.post('/auth/forgot-password', { email });
      
      setIsSent(true);
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่พบอีเมลนี้ในระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 animate-fadeIn">
      {/* ปุ่มย้อนกลับ */}
      <Link to="/login" className="flex items-center gap-1 text-slate-400 mb-6 hover:text-orange-500 font-bold transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าเข้าสู่ระบบ
      </Link>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <Mail size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase">ลืมรหัสผ่าน?</h1>
        <p className="text-slate-500 font-medium mt-2">
          {isSent 
            ? "ตรวจสอบกล่องจดหมายของคุณเพื่อตั้งรหัสผ่านใหม่" 
            : "กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่"}
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="ระบุอีเมลที่ใช้สมัคร"
              className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 disabled:bg-slate-200 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>ส่งคำขอรีเซ็ต <Send size={18} /></>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl font-bold text-sm">
            ระบบได้ส่งอีเมลไปยัง <span className="underline">{email}</span> เรียบร้อยแล้ว
          </div>
          <button 
            onClick={() => setIsSent(false)}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            หากไม่ได้รับเมล? ลองอีกครั้ง
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;