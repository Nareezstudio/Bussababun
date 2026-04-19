import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ นำเข้า Toaster
import { Toaster } from 'react-hot-toast';

// --- Import Components ---
import Navbar from "./components/Navbar";
import ContestList from './components/contest/ContestList';

// --- Import Public Pages ---
import Home from "./pages/Home";
import NovelDetail from "./pages/NovelDetail"; 
import ReadChapter from './pages/ReadChapter'; 
import Login from './pages/Login';         
import Register from './pages/Register'; 
import ForgotPassword from './pages/ForgotPassword';
import CategoryPage from './pages/CategoryPage'; // อย่าลืมสร้างไฟล์นี้ตามที่ผมเขียนให้ก่อนหน้านี้
import AnnouncementDetail from './pages/AnnouncementDetail';
import SearchPage from './pages/SearchPage'; // มั่นใจว่า import มาแล้ว

// --- Import User Pages ---
import UserProfile from "./pages/user/UserProfile";
import EditProfile from './pages/user/EditProfile';
import TopUp from './pages/TopUp';
import History from './pages/History';
import PaymentMethod from './pages/PaymentMethod';
import PaymentGateway from './pages/PaymentGateway';
import AllPromotions from './pages/AllPromotions';
import Bookshelf from './pages/Bookshelf'; 
import PurchaseHistory from './pages/PurchaseHistory';

// --- Import Writer Pages ---
import WriterDashboard from './pages/writer/WriterDashboard';
import CreateNovel from './pages/writer/CreateNovel'; 
import ManageChapters from "./pages/writer/ManageChapters"; 
import AddChapter from "./pages/writer/AddChapter";
import EditChapter from "./pages/writer/EditChapter"; 
import EditNovel from "./pages/writer/EditNovel";
import WriterTerms from "./pages/writer/WriterTerms";
import CreatePromotion from './pages/writer/CreatePromotion';
import PromotionDashboard from './pages/writer/PromotionDashboard';
import SalesReport from './pages/writer/SalesReport';
import WriterWithdrawal from './pages/writer/WriterWithdrawal';
import ReVerifyWriter from './pages/writer/ReVerifyWriter';

// --- Import Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyWriters from './pages/admin/VerifyWriters';
import AdminSettings from './pages/admin/AdminSettings'; 
import AdminWithdrawal from './pages/admin/AdminWithdrawal';
import CategoryManager from './pages/admin/CategoryManager';
import AdminNovelManager from './pages/admin/AdminNovelManager'; // ตรวจสอบ Path ให้ถูกต้องตามโครงสร้างโปรเจกต์คุณ
import AdminAnnouncementManager from './pages/admin/AdminAnnouncementManager';

// --- Import Static Pages ---
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

// ✅ Component สำหรับเช็คสิทธิ์ Admin
const AdminRoute = ({ children, user }) => {
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useAuth(); 

  // ป้องกันการเด้งไปหน้าแรกตอนที่กำลังโหลดข้อมูล User
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* ✅ Toaster สำหรับแจ้งเตือน */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '1rem',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold'
          },
        }}
      />

      <Navbar /> 

      <main className="flex-grow pb-10">
        <Routes>
          {/* 🌏 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} /> {/* <-- ต้องมีบรรทัดนี้! */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/novel/:id" element={<NovelDetail />} />
          <Route path="/reader/:chapterId" element={<ReadChapter />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />

          {/* 👤 User Routes */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/payment-gateway" element={<PaymentGateway />} />
          <Route path="/history" element={<History />} />
          <Route path="/promotions" element={<AllPromotions />} />
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/purchase-history" element={
              <ProtectedRoute> 
                <PurchaseHistory /> 
              </ProtectedRoute>
            } 
          />

          {/* ✍️ Writer Routes */}
          <Route path="/writer/terms" element={<WriterTerms />} />
          <Route path="/writer/dashboard" element={<WriterDashboard />} />
          <Route path="/writer/create-novel" element={<CreateNovel />} />
          <Route path="/writer/novel/:novelId/chapters" element={<ManageChapters />} />
          <Route path="/writer/novel/:novelId/add-chapter" element={<AddChapter />} />
          <Route path="/writer/edit-chapter/:novelId/:chapterId" element={<EditChapter />} />
          <Route path="/writer/edit-novel/:novelId" element={<EditNovel />} />
          <Route path="/writer/promotions" element={<PromotionDashboard />} />
          <Route path="/writer/create-promotion" element={<CreatePromotion />} />
          <Route path="/writer/report/:promotionId" element={<SalesReport />} />
          <Route path="/writer/withdrawals" element={<WriterWithdrawal />} />
          <Route path="/writer/withdrawal" element={
            <ProtectedRoute role="WRITER">
              <WriterWithdrawal />
            </ProtectedRoute>
          } />
          <Route path="/contest" element={<ContestList />} />
          <Route path="/writer/verify-step-1" element={<ReVerifyWriter />} />

          {/* 👑 Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="/admin/verify-writers" element={<VerifyWriters />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawal />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/novels" element={<AdminNovelManager />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementManager />} />

          {/* Fallback - ต้องอยู่ล่างสุดเสมอ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ✅ Footer: Bongkochakorn */}
      <footer className="bg-white border-t border-slate-100 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            
            <div className="text-2xl font-black text-slate-800 italic tracking-tighter">
              BUS<span className="text-orange-500">SABABUN</span> Official
            </div>

            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
            </div>

            <div className="w-12 h-[2px] bg-orange-500 rounded-full opacity-20"></div>

            <p className="text-center text-slate-300 text-[9px] font-bold uppercase tracking-[0.3em]">
              Bussababun © 2026 Professional Creative Writing Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;