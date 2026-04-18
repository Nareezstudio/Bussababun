import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ เพิ่ม Link
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast'; // ✅ แนะนำให้ใช้ toast แทน alert

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      
      // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมาจาก Backend
      const userData = res.data.user ? res.data.user : res.data;
      setUser(userData); 
      
      toast.success("เข้าสู่ระบบสำเร็จ!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "เข้าสู่ระบบล้มเหลว");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
      <h1 className="text-3xl font-black text-center mb-8 text-slate-800 italic uppercase">เข้าสู่ระบบ</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="อีเมล"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <div className="flex justify-end mt-2">
            <Link 
              to="/forgot-password" 
              className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          เข้าสู่ระบบ
        </button>

        <p className="text-center mt-6 text-slate-500 font-bold">
          ยังไม่มีบัญชี?{" "}
          <Link to="/register" className="text-orange-500 font-black hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;