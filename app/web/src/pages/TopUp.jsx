import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Coins, 
  ChevronRight, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  Zap
} from 'lucide-react';
import api from '../api/axios';

const TopUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); 
  const [userCoins, setUserCoins] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // กำหนดแพ็กเกจ
  const packages = [
    { id: 1, coins: 50, price: 50, bonus: 0, tag: null },
    { id: 2, coins: 100, price: 100, bonus: 10, tag: 'คุ้มค่า' },
    { id: 3, coins: 300, price: 300, bonus: 45, tag: 'ยอดนิยม' },
    { id: 4, coins: 500, price: 500, bonus: 100, tag: 'สุดคุ้ม' },
    { id: 5, coins: 1000, price: 1000, bonus: 250, tag: 'VIP' },
  ];

  useEffect(() => {
    fetchUserWallet();
  }, []);

  const fetchUserWallet = async () => {
    try {
      const res = await api.get('/auth/me');
      setUserCoins(res.data.coins || 0);
      if (setUser) setUser(res.data); 
    } catch (err) {
      console.error("Fetch Wallet Error:", err);
    }
  };

  const handleTopUp = async () => {
      // 1. ตรวจสอบว่าเลือกแพ็กเกจหรือยัง และป้องกันการกดซ้ำขณะกำลังประมวลผล
      if (!selectedPackage || isProcessing) return;
      
      try {
          setIsProcessing(true);
          
          // 2. เรียก API ไปยัง Backend เพื่อสร้างรายการ (Transaction) และรับเลข RefNo ที่ไม่ซ้ำ
          const res = await api.post('/payments/charge', { 
              amount: selectedPackage.price,
              totalCoins: selectedPackage.coins + selectedPackage.bonus
          });
          
          if (res.data.success) {
              const data = res.data.paymentData;

              // 3. ทำความสะอาด DOM: ลบ Form เก่าที่อาจจะค้างอยู่ในหน้า (ถ้ามี)
              const oldForm = document.getElementById('pay-solutions-form');
              if (oldForm) oldForm.remove();

              // 4. สร้าง Form ใหม่สำหรับส่งข้อมูลแบบ POST ไปยัง PaySolutions
              const form = document.createElement('form');
              form.id = 'pay-solutions-form';
              form.method = 'POST';
              form.action = data.actionUrl; // https://payments.paysolutions.asia/payment
              form.style.display = 'none';

              // 5. ใส่ค่าหลักที่ได้รับมาจาก Backend (merchantid, refno, total, etc.)
              Object.keys(data).forEach(key => {
                  if (key !== 'actionUrl') {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    // ถ้าเป็น key ชื่อ total ให้มั่นใจว่าเป็นทศนิยม 2 ตำแหน่ง
                    input.value = key === 'total' ? parseFloat(data[key]).toFixed(2) : data[key];
                    form.appendChild(input);
                  }
              });

              // 6. ใส่ค่าฟิลด์พิเศษที่ v6 บังคับ (เพื่อป้องกัน ERR_EMPTY_RESPONSE)
              const extraFields = {
                  lang: "TH",       // ภาษาไทย
                  currency: "THB", // สกุลเงินบาท
                  cc: "00",        // รหัสสกุลเงิน (00 สำหรับ THB)
                  paytype: "0"     // ให้ลูกค้าเลือกช่องทางเอง (PromptPay/Card)
              };

              Object.keys(extraFields).forEach(key => {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = key;
                  input.value = extraFields[key];
                  form.appendChild(input);
              });

              // 7. เพิ่ม Form ลงใน Body และสั่ง Submit
              document.body.appendChild(form);
              
              // ใช้ความล่าช้าเล็กน้อย (100ms) เพื่อให้ Browser อัปเดต DOM เสร็จสมบูรณ์
              setTimeout(() => {
                  form.submit();
              }, 100);

          } else {
              throw new Error(res.data.message || "สร้างรายการไม่สำเร็จ");
          }
      } catch (err) {
          console.error("Payment Error:", err);
          const errorMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบชำระเงิน";
          alert(errorMsg);
      } finally {
          // ปิดสถานะกำลังประมวลผล
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-2xl shadow-lg shadow-orange-200">
              <Wallet className="text-white" size={28} />
            </div>
            เติมคอยน์ (Top Up)
          </h1>
          <p className="text-slate-400 mt-2 font-medium">เพิ่มเหรียญเพื่อสนับสนุนนักเขียนที่คุณรัก</p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Coins size={100} />
          </div>
          <div className="z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">ยอดคงเหลือปัจจุบัน</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-orange-400">{userCoins.toLocaleString()}</span>
              <Coins className="text-orange-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg)}
            className={`relative p-6 rounded-[2rem] border-2 transition-all duration-300 text-left flex flex-col justify-between h-48 group
              ${selectedPackage?.id === pkg.id 
                ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' 
                : 'border-slate-100 bg-white hover:border-orange-200 hover:shadow-lg'
              }`}
          >
            {pkg.tag && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">
                {pkg.tag}
              </span>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-black text-slate-800">{pkg.coins}</span>
                <Coins className="text-orange-500" size={20} />
              </div>
              {pkg.bonus > 0 && (
                <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                  <Zap size={14} fill="currentColor" />
                  แถมฟรี +{pkg.bonus} คอยน์
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between w-full">
              <span className="text-2xl font-black text-slate-400 group-hover:text-slate-600 transition-colors">
                ฿{pkg.price.toLocaleString()}
              </span>
              <div className={`p-2 rounded-xl transition-all ${selectedPackage?.id === pkg.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <ChevronRight size={20} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Summary Section */}
      {selectedPackage && (
        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 animate-slideUp">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <CreditCard className="text-orange-500" /> สรุปรายการสั่งซื้อ
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-slate-50 font-bold text-slate-500">
              <span>รายการ</span>
              <span className="text-slate-800">เติมคอยน์แพ็กเกจ {selectedPackage.coins} Coins</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50 font-bold text-slate-500">
              <span>เหรียญที่จะได้รับ</span>
              <span className="text-green-600">{(selectedPackage.coins + selectedPackage.bonus).toLocaleString()} Coins</span>
            </div>
            <div className="flex justify-between py-4 text-2xl font-black">
              <span className="text-slate-800">ยอดชำระสุทธิ</span>
              <span className="text-orange-500">฿{selectedPackage.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setSelectedPackage(null)}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleTopUp}
              disabled={isProcessing}
              className={`flex-[2] py-4 px-6 rounded-2xl font-black text-white shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2
                ${isProcessing ? 'bg-orange-300' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}
              `}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>ยืนยันและชำระเงิน <CheckCircle2 size={20} /></>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-start gap-2 text-slate-400 text-xs">
            <AlertCircle size={14} className="mt-0.5" />
            <p>ระบบจะนำคุณไปสู่หน้าชำระเงินที่ปลอดภัยของ PaySolution เมื่อชำระเงินเสร็จสิ้น คอยน์จะถูกเพิ่มเข้าบัญชีของคุณอัตโนมัติ</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUp;