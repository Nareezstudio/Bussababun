import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // ตรวจสอบ Token หรือสถานะ Login จาก localStorage หรือ Context
  const token = localStorage.getItem('token'); 

  if (!token) {
    // ถ้าไม่มี Token ให้ส่งกลับไปหน้า Login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;