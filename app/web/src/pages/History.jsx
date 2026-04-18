import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { 
  Clock, CheckCircle2, CreditCard, QrCode, 
  Wallet, Landmark, ChevronLeft, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ ฟังก์ชันดึงข้อมูล (ดึงออกมาด้านนอกเพื่อให้เรียกซ้ำได้)
  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/payments/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("ไม่สามารถดึงข้อมูลประวัติได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ✅ ฟังก์ชันตรวจสอบสถานะจาก Omise
  const handleCheckStatus = async (transactionId) => {
    const loadingToast = toast.loading("กำลังตรวจสอบสถานะกับ Omise...");
    try {
      const response = await api.get(`/payments/check-status/${transactionId}`);
      
      if (response.data.status === 'successful') {
        toast.success("ยอดเงินได้รับการยืนยันและอัปเดตแล้ว!", { id: loadingToast });
        fetchHistory(); // รีเฟรชรายการใหม่

        // ✅ เพิ่มบรรทัดนี้เพื่อส่งสัญญาณไปที่ Navbar
        window.dispatchEvent(new Event('authChange'));

        fetchHistory();
      } else if (response.data.status === 'pending') {
        toast.error("รายการยังรอการชำระเงิน กรุณาสแกน QR Code ให้เรียบร้อย", { id: loadingToast });
      } else {
        toast.error(`สถานะ: ${response.data.status}`, { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบ", { id: loadingToast });
    }
  };

  // ✅ ฟังก์ชันเลือก Icon ตามช่องทาง
  const getMethodIcon = (method) => {
    const m = method?.toUpperCase();
    if (m?.includes('QR') || m?.includes('PROMPTPAY')) return <QrCode className="text-blue-600" size={20} />;
    if (m?.includes('WALLET') || m?.includes('TRUEMONEY')) return <Wallet className="text-orange-500" size={20} />;
    if (m?.includes('BANK') || m?.includes('INTERNET')) return <Landmark className="text-purple-600" size={20} />;
    return <CreditCard className="text-slate-500" size={20} />;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-slate-200"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ประวัติการเติมเงิน</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transaction History</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
          <Clock size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">ยังไม่มีรายการเติมเงิน</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white border border-white p-5 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-orange-50 transition-colors">
                  {getMethodIcon(item.method)}
                </div>
                <div>
                  <div className="font-black text-slate-700 text-sm uppercase tracking-tight">
                    {item.status === 'SUCCESS' ? 'Top up Success' : 'Payment Pending'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {new Date(item.createdAt).toLocaleString('th-TH', { 
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-black text-slate-900 tracking-tighter">
                  +{item.coinsReceived.toLocaleString()} <span className="text-[10px] text-orange-500 italic">COINS</span>
                </div>
                
                {/* สถานะและการแสดงผลปุ่มตรวจสอบ */}
                {item.status === 'SUCCESS' ? (
                  <div className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    Verified
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[9px] font-black text-orange-400 uppercase tracking-widest">
                      <AlertCircle size={12} />
                      Waiting
                    </div>
                    <button 
                      onClick={() => handleCheckStatus(item.transactionId)}
                      className="flex items-center gap-1 mt-1 bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-200"
                    >
                      <RefreshCw size={10} className="animate-spin-slow" />
                      Check Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;