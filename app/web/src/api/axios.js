// web/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:5000/api', 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // ใช้ตัวแปรนี้แทน localhost:5000
  withCredentials: true
});

// ✅ แก้ไขตรงนี้: ดึง Token ใหม่ทุกครั้งที่ยิง API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      // บังคับใส่ Header ทุกครั้งที่มี Token ในเครื่อง
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;