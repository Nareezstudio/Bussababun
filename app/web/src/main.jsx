import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// 1. เพิ่มบรรทัดนี้เข้าไป (เช็คว่าไฟล์ AuthContext อยู่ในโฟลเดอร์ context หรือไม่)
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 👈 หุ้มไว้ที่นี่ */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)