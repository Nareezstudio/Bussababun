import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, QrCode } from 'lucide-react';

const PaymentGateway = () => {
  const { state } = useLocation();
  const { fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = state?.amount || 0;
  const method = state?.method || { name: 'Payment', id: 'qr' };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // ⚠️ ตรวจสอบตรงนี้: Backend ของคุณใช้ชื่อฟังก์ชัน topUpCoins 
      // และรอรับค่า amount (Number) และ method (String)
      await api.post('/payments/topup', { 
        amount: Number(amount), // มั่นใจว่าเป็นตัวเลข
        method: method.id       // ส่งเฉพาะ ID เช่น 'qr', 'wallet'
      });
    
      await fetchProfile(); 
      navigate('/history');
    } catch (err) {
      alert("การชำระเงินไม่สำเร็จ กรุณาลองใหม่");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-50 text-center relative overflow-hidden">
        
        {/* Decorative background circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-slate-50 rounded-full" />

        <div className="flex justify-center mb-6">
          <div className="bg-green-50 text-green-500 p-4 rounded-full">
            <ShieldCheck size={48} />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-800 mb-1">ยืนยันยอดชำระ</h2>
        <p className="text-slate-400 text-sm mb-8">ช่องทาง: {method.name}</p>

        {/* QR Code Placeholder (แสดงเมื่อเลือก QR) */}
        {method.id === 'qr' && (
          <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl mb-8 inline-block shadow-inner">
             <div className="w-48 h-48 bg-slate-50 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                <QrCode size={64} strokeWidth={1} />
                <span className="text-[10px] mt-2 font-medium">SCAN QR CODE</span>
             </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-500">จำนวนที่ได้รับ</span>
            <span className="font-bold text-slate-800">{amount} คอยน์</span>
          </div>
          <div className="h-[1px] bg-slate-200 my-3" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800">ยอดชำระทั้งสิ้น</span>
            <span className="text-2xl font-black text-orange-600">฿{amount.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>กำลังตรวจสอบ...</span>
            </>
          ) : (
            "ยืนยันการชำระเงิน"
          )}
        </button>

        <button 
          onClick={() => navigate(-1)}
          disabled={isProcessing}
          className="mt-6 text-slate-400 text-sm font-medium hover:text-slate-600"
        >
          ยกเลิกรายการ
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;