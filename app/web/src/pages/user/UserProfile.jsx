import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Mail, Wallet, Heart, ChevronRight, 
  Award, LogOut, ShieldCheck, ShoppingBag, LayoutDashboard, 
  PenTool, Settings, Landmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FiEdit } from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // ดึงข้อมูล user จาก Global State
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIncomeData = async () => {
      // ถ้าไม่มี user ใน context เลย ให้ลองดึงใหม่ (กรณี refresh หน้า)
      if (!user) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) setUser(res.data);
        } catch (err) { console.error(err); }
      }

      // ดึงข้อมูลรายได้เฉพาะ Writer/Admin
      if (user?.role === 'WRITER' || user?.role === 'ADMIN') {
        try {
          const incomeRes = await api.get('/income/my-income');
          if (incomeRes.data?.success) {
            const incomeInfo = incomeRes.data.data.summary;
            setProfileData({
              earnings: incomeInfo.withdrawable || 0,
              income: incomeInfo.totalBalance || 0
            });
          }
        } catch (err) {
          console.warn("Income load failed:", err);
        }
      }
      setLoading(false);
    };

    loadIncomeData();
  }, [user, setUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // ใช้ข้อมูลจาก Context เป็นหลัก เสริมด้วย profileData (รายได้)
  const displayUser = user;
  const incomeInfo = profileData;

  if (loading && !displayUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black italic animate-pulse">LOADING PROFILE...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn pb-20">
      
      {/* 1. Header Profile */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative group cursor-pointer" onClick={() => navigate('/edit-profile')}>
          <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-all duration-300">
            {displayUser?.profileImage ? (
              <img src={displayUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={60} className="opacity-50" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]">
             <FiEdit className="text-white text-2xl" />
          </div>
          {displayUser?.role === 'ADMIN' && (
            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl font-black text-slate-800 italic uppercase">
              {displayUser?.username || 'นักอ่านปริศนา'}
            </h1>
            <span className="text-orange-500 font-bold text-sm md:border-l md:pl-3 border-slate-200">
               {displayUser?.penName ? `(${displayUser.penName})` : ''}
            </span>
          </div>
          
          <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2 text-sm">
            <Mail size={14} className="text-orange-400" /> {displayUser?.email || 'N/A'}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {displayUser?.role || 'MEMBER'}
            </span>
            <button 
              onClick={() => navigate('/edit-profile')}
              className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-orange-200 transition-colors"
            >
              <FiEdit size={12} /> Edit Profile
            </button>
          </div>
        </div>

        <button onClick={handleLogout} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[2rem] transition-all group">
          <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 2. Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Card */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all duration-300">
          <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-100 group-hover:rotate-6 transition-transform">
            <Wallet size={28} />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">คอยน์คงเหลือ</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {Number(displayUser?.coins || 0).toLocaleString()} 
              <span className="text-xs font-bold text-orange-500 ml-1 italic">Coins</span>
            </h2>
          </div>
          <button onClick={() => navigate('/topup')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-orange-500 transition-all active:scale-95 uppercase">
            Top Up
          </button>
        </div>

        {/* Writer Income Card */}
        {(displayUser?.role === 'WRITER' || displayUser?.role === 'ADMIN') && (
          <div 
            onClick={() => navigate('/writer/withdrawal')}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2.5rem] flex items-center gap-5 group hover:shadow-xl transition-all duration-300 cursor-pointer shadow-lg shadow-slate-200"
          >
            <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
              <Landmark size={28} />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">รายได้ที่ถอนได้</p>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {Number(incomeInfo?.earnings || 0).toLocaleString()}
                <span className="text-xs font-bold text-orange-500 ml-1 italic">THB</span>
              </h2>
            </div>
            <div className="bg-white/10 p-2 rounded-full text-white group-hover:bg-orange-500 transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
        )}

        {/* Action Links */}
        {[
          { icon: ShoppingBag, label: 'ประวัติการซื้อ', title: 'Purchases', color: 'bg-emerald-500', path: '/purchase-history' },
          { icon: Heart, label: 'ชั้นหนังสือ', title: 'Bookshelf', color: 'bg-blue-500', path: '/bookshelf' }
        ].map((item, idx) => (
          <div key={idx} onClick={() => navigate(item.path)} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className={`${item.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">{item.label}</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.title}</h2>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        ))}

        {/* Role Specific Actions */}
        {displayUser?.role === 'ADMIN' ? (
          <div onClick={() => navigate('/admin/dashboard')} className="md:col-span-2 bg-indigo-600 p-6 rounded-[2.5rem] flex items-center gap-5 group hover:bg-indigo-700 transition-all cursor-pointer shadow-xl shadow-indigo-100">
            <div className="bg-white/20 p-4 rounded-2xl text-white"><LayoutDashboard size={28} /></div>
            <div className="flex-1 text-white">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-0.5">แผงควบคุมแอดมิน</p>
              <h2 className="text-2xl font-black tracking-tight italic">Admin Panel</h2>
            </div>
            <ChevronRight size={24} className="text-white/50 group-hover:text-white" />
          </div>
        ) : displayUser?.role === 'WRITER' && (
          <div onClick={() => navigate('/writer/dashboard')} className="md:col-span-2 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center gap-5 group hover:border-orange-500 transition-all cursor-pointer">
            <div className="bg-slate-200 p-4 rounded-2xl text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-all"><PenTool size={28} /></div>
            <div className="flex-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">สตูดิโอนักเขียน</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">Writer Studio</h2>
            </div>
            <ChevronRight size={24} className="text-slate-200 group-hover:text-orange-500" />
          </div>
        )}
      </div>

      {/* 3. Banner สมัครนักเขียน */}
      {displayUser?.role === 'READER' && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
            <div className="flex-1">
              <h3 className="text-4xl font-black mb-4 leading-tight">เปลี่ยนความชอบเป็น <span className="text-orange-500">รายได้!</span></h3>
              <p className="text-slate-400 font-bold text-sm max-w-sm">รับส่วนแบ่งรายได้สูง พร้อมระบบจัดการนิยายระดับมือโปร</p>
            </div>
            <button onClick={() => navigate('/writer/terms')} className="bg-orange-500 text-white px-8 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/20">
              สมัครเป็นนักเขียน <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-slate-300 text-[9px] font-bold uppercase tracking-[0.3em] pt-4">
        Siam Fiction © 2026 Professional Creative Writing Platform
      </p>
    </div>
  );
};

export default UserProfile;