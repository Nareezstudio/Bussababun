import React, { useState, useEffect } from 'react';
import { X, Coins, Ticket, Sparkles, Loader2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const PurchaseModal = ({ isOpen, onClose, onConfirm, chapter, novelTitle }) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceDetail, setPriceDetail] = useState(null);
  const [couponError, setCouponError] = useState('');

  // ดึงราคา Preview เมื่อ Modal เปิด หรือ Chapter เปลี่ยน
  useEffect(() => {
    if (isOpen && chapter) {
      fetchPricePreview();
      setCouponError('');
      setCouponCode('');
    }
  }, [isOpen, chapter]);

  const fetchPricePreview = async (code = null) => {
    try {
      setIsCalculating(true);
      setCouponError('');
      const res = await api.post('/chapters/preview-price', { 
        chapterId: chapter.id, 
        couponCode: code 
      });
      setPriceDetail(res.data.data);
      
      if (code && !res.data.data.couponApplied) {
        setCouponError('❌ คูปองนี้ใช้ไม่ได้กับตอนนี้');
      }
    } catch (err) {
      setCouponError('❌ โค้ดไม่ถูกต้องหรือหมดอายุ');
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isOpen || !chapter) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-8 text-center shadow-2xl relative animate-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-orange-100">
          <Coins className="text-orange-500" size={42} />
        </div>
        
        <h2 className="text-xl font-black text-slate-800 mb-1">ปลดล็อกตอนนิยาย</h2>
        <p className="text-slate-400 text-sm mb-6 font-bold truncate px-4">{novelTitle} - {chapter.title}</p>
        
        {/* Price Breakdown Section */}
        <div className="bg-slate-50/80 rounded-[2rem] p-5 mb-6 border border-slate-100">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-slate-500 font-bold text-sm">ราคาปกติ</span>
            <span className={`font-black ${priceDetail?.totalDiscount > 0 ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
              {chapter.price} <Coins size={14} className="inline mb-1" />
            </span>
          </div>

          {/* แสดงโปรโมชั่น (ลดรายตอน/ลดทั้งเรื่อง) */}
          {priceDetail?.promotionApplied && (
            <div className="flex justify-between items-center mb-2 px-2 text-orange-600">
              <span className="text-xs font-black flex items-center gap-1">
                <Sparkles size={12} className="fill-orange-500" /> {priceDetail.promotionApplied}
              </span>
              <span className="font-bold">-{priceDetail.originalPrice - (priceDetail.finalPrice + (priceDetail.couponApplied ? priceDetail.couponDiscount : 0))} <Coins size={12} className="inline" /></span>
            </div>
          )}

          {/* ยอดสุทธิ */}
          <div className="flex justify-between items-center mt-4 px-3 py-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <span className="text-slate-800 font-black text-sm">ยอดชำระสุทธิ</span>
            <div className="flex items-center gap-1 text-orange-600 font-black text-2xl">
              {isCalculating ? <Loader2 className="animate-spin" size={20} /> : priceDetail?.finalPrice} <Coins size={20} />
            </div>
          </div>
        </div>

        {/* Coupon Input */}
        <div className="relative mb-2">
           <input 
            type="text" 
            placeholder="กรอกโค้ดส่วนลด..." 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="w-full pl-12 pr-24 py-4 bg-slate-100 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all"
           />
           <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <button 
            onClick={() => fetchPricePreview(couponCode)}
            disabled={!couponCode || isCalculating}
            className="absolute right-2 top-2 bottom-2 px-4 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 disabled:opacity-50"
           >
            ใช้โค้ด
           </button>
        </div>

        {/* Coupon Error Message */}
        {couponError && (
          <p className="text-red-500 text-[10px] font-black mb-4 animate-shake">{couponError}</p>
        )}
        
        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={() => onConfirm(chapter.id, couponCode)} 
            disabled={isCalculating}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-orange-600 active:scale-95 disabled:opacity-50 transition-all"
          >
            ยืนยันการซื้อ
          </button>
          <button onClick={() => navigate('/topup')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all">
            <CreditCard size={20} /> เติมเหรียญ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;