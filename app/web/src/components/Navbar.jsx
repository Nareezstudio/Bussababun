import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
  Coins, LogOut, User as UserIcon, Bell, 
  ShieldCheck, PenLine, Library, 
  LayoutDashboard, Search, ChevronDown,
  Megaphone, ExternalLink 
} from 'lucide-react';
import api from '../api/axios'; 

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNoti, setShowNoti] = useState(false);
  const [siteName, setSiteName] = useState("Bussababun.com");
  
  // ใช้ useRef เพื่อป้องกันการรันซ้ำซ้อนในสภาวะที่ Component render ถี่
  const isInitialMount = useRef(true);

  // --- Logic การดึงข้อมูลผู้ใช้ ---
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      // ตรวจสอบว่าข้อมูลใหม่ต่างจากเดิมไหมก่อน setUser เพื่อลดการ Re-render
      if (JSON.stringify(res.data) !== JSON.stringify(user)) {
        setUser(res.data);
      }
    } catch (err) { 
      console.error("Fetch User Error:", err); 
      if (err.response?.status === 401 || err.response?.status === 403) {
        // ถ้า Token พัง ให้ล้างออกป้องกัน Loop ยิงใส่ API
        // localStorage.removeItem('token');
        // setUser(null);
      }
    }
  }, [setUser, user]);

  // --- Logic การดึงแจ้งเตือน ---
  const fetchNoti = useCallback(async () => {
    try {
      if (localStorage.getItem('token')) {
        const res = await api.get('/notifications');
        setNotifications(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) { 
      setNotifications([]); 
    }
  }, []);

  // --- useEffect หลัก ---
  useEffect(() => {
    // ดึงชื่อเว็บไซต์ (รันครั้งเดียว)
    api.get('/admin/settings')
      .then(res => {
        if (res.data?.siteName) setSiteName(res.data.siteName);
      })
      .catch(() => console.log("Using default site name"));

    // ดึงข้อมูลครั้งแรกเมื่อโหลดหน้า
    if (isInitialMount.current) {
      fetchUserData();
      fetchNoti();
      isInitialMount.current = false;
    }

    // Event Listeners
    const handleUpdate = () => {
      fetchUserData();
      fetchNoti();
    };

    window.addEventListener('authChange', handleUpdate);
    window.addEventListener('coinsUpdated', fetchUserData); // อัปเดตเฉพาะเงินเมื่อเติมเงินสำเร็จ

    return () => {
      window.removeEventListener('authChange', handleUpdate);
      window.removeEventListener('coinsUpdated', fetchUserData);
    };
  }, [fetchUserData, fetchNoti]); // dependencies ตอนนี้จะนิ่งขึ้นมาก

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // --- Sub-Component: SearchBar ---
  const SearchBar = () => {
    const [keyword, setKeyword] = useState('');
    const handleSearch = (e) => {
      e.preventDefault();
      if (keyword.trim()) navigate(`/search?q=${encodeURIComponent(keyword)}`);
    };

    return (
      <form onSubmit={handleSearch} className="relative flex-1 max-w-[140px] md:max-w-md mx-2">
        <input
          type="text"
          placeholder="ค้นหา..."
          className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-100 text-[11px] md:text-sm outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-700"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      </form>
    );
  };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform">B</div>
            <span className="text-xl font-black text-slate-800 tracking-tighter hidden sm:block">
              {siteName.split('.')[0]}<span className="text-orange-500 italic">.</span>
            </span>
          </Link>
          <SearchBar />
        </div>

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <div className="flex items-center gap-1 bg-indigo-50/50 border border-indigo-100 p-1 rounded-xl ml-2">
                  <Link to="/admin/dashboard" className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all">
                    <LayoutDashboard size={18} />
                  </Link>
                  <Link to="/admin/announcements" className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all">
                    <Megaphone size={18} /> 
                  </Link>
                </div>
              )}

              {(user.role === 'WRITER' || user.role === 'ADMIN') && (
                <Link to="/writer/dashboard" className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-500 transition-all shadow-md active:scale-95">
                  <PenLine size={14} />
                  <span className="text-[11px] uppercase tracking-wider">Studio</span>
                </Link>
              )}

              <div className="flex items-center gap-1 px-2 border-l border-slate-100 ml-1">
                <Link to="/bookshelf" className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                  <Library size={20} />
                </Link>
                
                <Link to="/topup" className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-all shadow-sm active:scale-95">
                  <Coins size={14} />
                  <span className="font-bold text-xs">{user.coins?.toLocaleString() || 0}</span>
                </Link>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNoti(!showNoti)} 
                  className={`p-2 rounded-xl transition-all ${showNoti ? 'bg-orange-50 text-orange-500' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
                
                {showNoti && (
                  <div className="absolute right-[-80px] sm:right-0 mt-3 w-[300px] sm:w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[110]">
                    <div className="p-4 bg-slate-50/50 border-b flex justify-between items-center">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Notifications</span>
                      <Link to="/notifications" onClick={() => setShowNoti(false)} className="text-[10px] text-orange-500 font-bold hover:underline flex items-center gap-1">
                        ดูทั้งหมด <ExternalLink size={10} />
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-300 text-xs italic">ไม่มีการแจ้งเตือน</div>
                      ) : (
                        notifications.map((n, idx) => (
                          <div key={idx} className="p-4 border-b border-slate-50 hover:bg-orange-50/30 transition-colors cursor-pointer" onClick={() => { if(n.link) navigate(n.link); setShowNoti(false); }}>
                            <p className="font-bold text-xs text-slate-700">{n.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center gap-1 pl-2">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-xl transition-all">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500"><UserIcon size={14} /></div>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-500 font-bold text-sm hover:text-slate-800">Login</Link>
              <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-100">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;