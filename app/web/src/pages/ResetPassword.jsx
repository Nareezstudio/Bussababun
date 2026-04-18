import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Lock, CheckCircle, ShieldKeyhole } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams(); // รับ token จาก URL: /reset-password/:token
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("รหัสผ่านไม่ตรงกัน!");
    }

    setLoading(true);
    try {
      // ✅ ส่งรหัสใหม่ไปที่ Backend
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "ลิงก์หมดอายุหรือใช้ไม่ได้แล้ว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShieldKeyhole size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-slate-400 font-bold mt-2">กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="password"
            placeholder="รหัสผ่านใหม่"
            className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <CheckCircle className="absolute left-4 top-4 text-slate-300" size={20} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:bg-slate-200 active:scale-95"
        >
          {loading ? "กำลังอัปเดต..." : "เปลี่ยนรหัสผ่าน"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;