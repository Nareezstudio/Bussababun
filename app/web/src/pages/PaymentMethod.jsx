import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, QrCode, Wallet, CreditCard, 
  Landmark, MoreHorizontal, ShieldCheck, Coins 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const PaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // รับค่าจากหน้า TopUp
  const { price, coins, from, siteName } = location.state || { price: 0, coins: 0, siteName: "BUSSABABUN" };

  // ป้องกันการเข้าหน้านี้โดยไม่มีข้อมูลราคา
  useEffect(() => {
    if (!price || price <= 0) {
      navigate('/topup');
    }
  }, [price, navigate]);

  const OMISE_PUBLIC_KEY = 'pkey_test_60fge1g22ey3psdsgrb';

  const methods = [
    { id: 'promptpay', name: 'ชำระเงินผ่าน PromptPay', icon: <QrCode className="text-blue-600" /> },
    { id: 'truemoney', name: 'True Money Wallet', icon: <Wallet className="text-orange-500" /> },
    { id: 'credit_card', name: 'บัตรเครดิต/เดบิต', icon: <CreditCard className="text-slate-700" /> },
    { id: 'internet_banking', name: 'โมบายแบงก์กิ้ง', icon: <Landmark className="text-green-600" /> },
    { id: 'others', name: 'ช่องทางอื่นๆ', icon: <MoreHorizontal className="text-slate-400" /> },
  ];

  const handleSelectMethod = (method) => {
    const OmiseCard = window.OmiseCard;
    if (!OmiseCard) return toast.error("ระบบชำระเงินไม่พร้อมใช้งาน กรุณารีเฟรชหน้าจอ");

    OmiseCard.configure({ 
      publicKey: OMISE_PUBLIC_KEY,
      buttonLabel: 'ชำระเงิน',
      submitLabel: 'ชำระเงินตอนนี้'
    });

    const config = {
      amount: price * 100, // Omise ใช้หน่วยสตางค์
      currency: 'thb',
      frameLabel: siteName,
      frameDescription: `เติมคอยน์จำนวน ${coins} คอยน์`,
      onCreateTokenSuccess: async (nonce) => {
        const loadingToast = toast.loading("กำลังดำเนินการชำระเงิน...");
        try {
          // ตรวจสอบว่าเป็น Token (บัตร) หรือ Source (PromptPay/อื่นๆ)
          const isCard = nonce.startsWith('tok_');
          
          const payload = {
            amount: price,
            coins: coins,
            // ส่งไปให้ตรงตามที่ Backend ตรวจสอบ (ส่งไปทั้งคู่ อันไหนไม่ใช่ให้เป็น null)
            token: isCard ? nonce : null,
            source: !isCard ? nonce : null
          };

          const response = await api.post('/payments/charge', payload);

          if (response.data.success) {
            // กรณี PromptPay หรือทางเลือกอื่นที่มี Redirect URI
            if (response.data.authorize_uri) {
              window.location.href = response.data.authorize_uri;
            } else {
              toast.success("เติมคอยน์สำเร็จ!", { id: loadingToast });
              navigate('/history', { replace: true });
            }
          } else {
            throw new Error(response.data.message || "เกิดข้อผิดพลาด");
          }
        } catch (err) {
          console.error("Payment Error:", err.response?.data);
          toast.error(err.response?.data?.message || "ข้อมูลการชำระเงินไม่ถูกต้อง", { id: loadingToast });
        }
      }, // ปิด onCreateTokenSuccess ตรงนี้
      onFormClosed: () => {
        // ทำงานเมื่อปิดหน้าต่าง Omise
      }
    };

    // เปิด Modal ตามประเภทที่เลือก
    if (method.id === 'credit_card') {
      OmiseCard.open({ ...config, defaultPaymentMethod: 'credit_card' });
    } else if (method.id === 'others') {
      OmiseCard.open({ 
        ...config, 
        otherPaymentMethods: ['rabbit_linepay', 'alipay', 'shopeepay'] 
      });
    } else {
      OmiseCard.open({ ...config, defaultPaymentMethod: method.id });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen bg-slate-50 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white rounded-full transition-all text-slate-500 border border-transparent hover:border-slate-100 shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Checkout</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white mb-8 relative overflow-hidden text-center">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">ยอดรวมที่ต้องชำระ</p>
        <div className="flex items-center justify-center gap-1 mb-4">
          <span className="text-sm font-black text-slate-400">฿</span>
          <span className="text-5xl font-black text-slate-900 tracking-tighter">{price.toLocaleString()}</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl">
          <Coins className="text-orange-500" size={16} />
          <span className="text-orange-600 font-black text-xs uppercase italic">ได้รับ {coins.toLocaleString()} คอยน์</span>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
      </div>

      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 pl-4">Payment Methods</p>

      {/* Methods List */}
      <div className="space-y-3">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelectMethod(m)}
            className="w-full bg-white p-5 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-orange-500 hover:translate-x-1 transition-all shadow-sm group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-all">
                {m.icon}
              </div>
              <div>
                <span className="block font-black text-slate-700 text-sm uppercase tracking-tight">{m.name}</span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">No extra fees</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
               <ChevronLeft size={16} className="rotate-180" />
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secure 256-bit SSL Encryption
        </div>
        <p className="text-slate-300 text-[8px] font-medium text-center uppercase tracking-tighter leading-relaxed">
          Powered by Omise<br/>ระบบความปลอดภัยมาตรฐานระดับสากล
        </p>
      </div>
    </div>
  );
};

export default PaymentMethod;