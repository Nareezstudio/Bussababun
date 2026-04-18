import React, { useState, useEffect, useRef } from 'react';
import { Clock, Loader2, X, AlertTriangle, ArrowRight } from 'lucide-react';

const WithdrawOTPModal = ({ 
  isOpen,       // คุมเปิด/ปิด Modal (boolean)
  onClose,      // ฟังก์ชันปิด Modal
  onConfirm,    // ฟังก์ชันเมื่อกด "ยืนยัน"
  email,        // อีเมลผู้ใช้ (สำหรับโชว์)
  loading       // สถานะโหลด (ตอนกดยืนยัน)
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // State เก็บ OTP 6 หลักแยกช่อง
  const inputRefs = useRef([]); // Ref สำหรับคุม Focus ของแต่ละช่อง

  // ปรับ Focus ไปยังช่องถัดไปอัตโนมัติเมื่อพิมพ์
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // รับเฉพาะตัวเลข

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // เอาแค่ตัวอักษรสุดท้ายที่พิมพ์
    setOtp(newOtp);

    // เลื่อน Focus ไปช่องถัดไป
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // จัดการการกด Backspace เพื่อย้อน Focus
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // จัดการการ Paste รหัส OTP ก้อนเดียว
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return; // ถ้าไม่ใช่ตัวเลขทั้งหมด ให้ข้าม

    const newOtp = pasteData.split('');
    // เติมให้ครบ 6 ช่อง (ถ้า Paste มาไม่ครบ)
    const finalOtp = [...newOtp, ...Array(6 - newOtp.length).fill('')].slice(0, 6);
    setOtp(finalOtp);
    
    // Focus ไปช่องสุดท้ายที่มีข้อมูล หรือช่องสุดท้ายสุด
    const focusIndex = Math.min(newOtp.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const isOtpComplete = otp.every(slot => slot !== '');
  const finalOtpString = otp.join('');

  const handleConfirmWithdraw = () => {
    if (isOtpComplete) {
      onConfirm(finalOtpString); // ส่งรหัส 6 หลักกลับไปหา Parent
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
      onClick={onClose} // คลิกพื้นหลังเพื่อปิด
    >
      <div 
        className="bg-white rounded-[3rem] p-10 md:p-14 max-w-xl w-full shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden border border-slate-50"
        onClick={(e) => e.stopPropagation()} // ป้องกันการคลิกข้างในแล้ว Modal ปิด
      >
        {/* Decorative Circle Background */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-orange-50 rounded-full blur-3xl opacity-60"></div>

        {/* Close Button Top-Right */}
        <button 
          className="absolute top-8 right-8 text-slate-300 hover:text-orange-500 hover:rotate-90 transition-all duration-300"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Header Mode */}
        <div className="text-center mb-10 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100 rotate-6">
            <Clock size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighterLEADING-NONE">ยืนยัน OTP</h3>
          <p className="text-slate-400 font-bold text-sm mt-3 leading-relaxed max-w-xs mx-auto">
            เพื่อความปลอดภัย โปรดกรอกรหัส 6 หลักที่ถูกส่งไปที่ <br/>
            <span className="text-slate-700 font-extrabold underline decoration-orange-300 decoration-2">{email}</span>
          </p>
        </div>

        {/* OTP Input Fields (แยก 6 ช่อง) */}
        <div className="flex justify-center gap-2 md:gap-3 mb-10 relative z-10" onPaste={handlePaste}>
          {otp.map((slot, index) => (
            <input 
              key={index}
              type="text"
              maxLength={1}
              ref={el => inputRefs.current[index] = el}
              value={slot}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-16 md:w-16 md:h-20 text-center text-5xl font-black bg-slate-50 border-4 border-slate-50 rounded-3xl focus:border-orange-500 focus:bg-white transition-all outline-none text-orange-600 shadow-inner"
              placeholder="-"
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <button 
            onClick={onClose}
            className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-3xl font-bold hover:bg-slate-100 transition-all text-sm uppercase tracking-wider"
          >
            Cancel / ยกเลิก
          </button>
          <button 
            onClick={handleConfirmWithdraw}
            disabled={!isOtpComplete || loading}
            className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black flex items-center justify-center gap-2.5 shadow-xl shadow-slate-200 hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-40 disabled:hover:bg-slate-900 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <ShieldCheck size={20} /> ยืนยันคำขอถอนเงิน
              </>
            )}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
           <AlertTriangle size={14} className="text-orange-400" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
             รหัส OTP มีอายุ 5 นาที หากไม่ได้รับ โปรดตรวจสอบใน Junk/Spam หรือ <span className="text-orange-500 underline cursor-pointer hover:text-orange-600">กดส่งอีกครั้ง</span>
           </p>
        </div>
      </div>
    </div>
  );
};

// SVG Icon สำหรับ IdCard (เพื่อความสมบูรณ์ในการเรียกใช้)
const ShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

export default WithdrawOTPModal;