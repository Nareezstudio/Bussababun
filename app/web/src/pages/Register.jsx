import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "สมัครสมาชิกล้มเหลว");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
      <h1 className="text-3xl font-black text-center mb-8 text-slate-800">สร้างบัญชีใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="ชื่อผู้ใช้"
          className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="อีเมล"
          className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
          สมัครสมาชิก
        </button>
      </form>
      <p className="text-center mt-6 text-slate-500">
        มีบัญชีอยู่แล้ว? <Link to="/login" className="text-orange-500 font-bold">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
};

export default Register;