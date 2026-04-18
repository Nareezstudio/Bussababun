import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ซ้ำๆ
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // เรียกไปที่ baseURL + /auth/me
      const res = await api.get('/auth/me'); 
      
      // ตรวจสอบว่า Response เป็น JSON ไม่ใช่ HTML
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        throw new Error("Backend returned HTML instead of JSON. Check your API URL.");
      }

      const userData = res.data.user ? res.data.user : res.data;
      setUser(userData);
      
      if (userData?.id) {
        localStorage.setItem('userId', userData.id);
      }
    } catch (err) {
      console.error("Auth Error:", err.message);
      handleClearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user ? res.data.user : res.data;
      setUser(userData);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const handleClearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const logout = () => {
    handleClearAuth();
    window.location.href = '/'; 
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      fetchProfile, 
      loading, 
      refreshUserData, 
      logout 
    }}>
      {!loading ? children : (
        <div className="h-screen flex items-center justify-center bg-slate-50">
           <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="font-black text-slate-400 uppercase tracking-widest text-xs">Authenticating...</div>
           </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);