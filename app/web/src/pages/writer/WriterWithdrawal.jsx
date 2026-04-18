import React, { useState, useEffect } from 'react';
import { 
  Wallet, Landmark, History, AlertCircle, 
  CheckCircle2, Clock, XCircle, ArrowRight, Loader2 
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import WithdrawOTPModal from '../../components/WithdrawOTPModal'; 

const WriterWithdrawal = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  
  // States สำหรับ OTP Modal
  const [showOTPModal, setShowOTPModal] = useState(false); 
  const [otpLoading, setOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    bankName: user?.bankName || '',
    bankAccount: user?.bankAccount || '',
    bankAccountName: user?.bankAccountName || (user?.realName ? `${user.realName} ${user.realSurname}` : '')
  });

  const MIN_WITHDRAW = 100;

  const refreshData = async () => {
    try {
      const [historyRes, incomeRes] = await Promise.all([
        api.get('/withdrawals/history'),
        api.get('/income/my-income') 
      ]);

      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }

      if (incomeRes.data.success && incomeRes.data.data.summary) {
        const balance = incomeRes.data.data.summary.withdrawable;
        setWithdrawableBalance(balance);
        
        if (setUser) {
          setUser(prev => ({ ...prev, earnings: balance }));
        }
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      setWithdrawableBalance(user?.earnings || 0);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * ขั้นตอนที่ 1: ตรวจสอบข้อมูลและขอรหัส OTP
   */
  const handleStartWithdrawFlow = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(formData.amount);
    
    // Validation เบื้องต้น
    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAW) {
      return toast.error(`ยอดถอนขั้นต่ำคือ ${MIN_WITHDRAW} บาท`);
    }
    if (withdrawAmount > withdrawableBalance) {
      return toast.error(`ยอดเงินคงเหลือไม่เพียงพอ (คงเหลือ: ${withdrawableBalance} บาท)`);
    }
    if (!formData.bankName || !formData.bankAccount || !formData.bankAccountName) {
      return toast.error(`กรุณากรอกข้อมูลธนาคารให้ครบถ้วน`);
    }

    try {
      setLoading(true);
      // เรียก API เพื่อส่ง OTP ไปที่ Email
      const response = await api.post('/withdrawals/send-otp');
      if (response.data.success) {
        toast.success("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว");
        setShowOTPModal(true); // เปิด Modal ให้กรอกรหัส
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่สามารถส่ง OTP ได้ โปรดลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ขั้นตอนที่ 2: ยืนยันรหัส OTP และสร้างคำขอถอนเงินจริง
   */
  const handleConfirmWithdrawWithOTP = async (finalOtpString) => {
    try {
      setOtpLoading(true);
      const response = await api.post('/withdrawals/request', {
        ...formData,
        amount: parseFloat(formData.amount),
        otp: finalOtpString 
      });

      if (response.data.success) {
        toast.success("ส่งคำขอถอนเงินสำเร็จ! ระบบกำลังตรวจสอบ");
        setShowOTPModal(false); 
        setFormData({ ...formData, amount: '' }); // ล้างแค่ยอดเงิน
        await refreshData(); // อัปเดตข้อมูลในหน้า
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setOtpLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      PENDING: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} />, label: 'รอดำเนินการ' },
      PAID: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={14} />, label: 'โอนเงินแล้ว' },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} />, label: 'ถูกปฏิเสธ' }
    };
    const { color, icon, label } = config[status] || config.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit ${color}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#fcfaf7] min-h-screen font-sans">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-orange-100 font-bold mb-1 opacity-80 uppercase tracking-wider text-xs">รายได้ที่ถอนได้ (Withdrawable Balance)</p>
            <h2 className="text-4xl md:text-6xl font-black flex items-baseline gap-2 leading-none">
              {withdrawableBalance.toLocaleString()} <span className="text-xl font-bold opacity-80">บาท</span>
            </h2>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md relative z-10 hidden sm:block">
            <Wallet size={48} className="text-white" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <AlertCircle size={18} />
            <p className="text-xs font-bold uppercase tracking-widest">Withdrawal Info</p>
          </div>
          <p className="text-slate-600 text-sm font-bold italic">ยอดถอนขั้นต่ำ: <span className="text-orange-500">{MIN_WITHDRAW} บาท</span></p>
          <p className="text-slate-400 text-[10px] mt-2 leading-relaxed font-medium">
            * ระบบจะดำเนินการตรวจสอบและโอนเงินภายใน 1-3 วันทำการ (ไม่รวมวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
              <Landmark className="text-orange-500" size={24} /> แจ้งถอนเงิน
            </h3>

            <form onSubmit={handleStartWithdrawFlow} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount / ระบุจำนวนเงิน</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-5 py-5 bg-slate-50 border-4 border-slate-50 rounded-2xl focus:border-orange-500 focus:bg-white transition-all outline-none font-black text-3xl text-slate-700 shadow-inner"
                    required
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-orange-500 transition-colors">THB</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bank Name / ธนาคาร</label>
                  <select 
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-600 appearance-none"
                    required
                  >
                    <option value="">เลือกธนาคารปลายทาง</option>
                    <option value="กสิกรไทย">กสิกรไทย (K-Bank)</option>
                    <option value="ไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                    <option value="กรุงเทพ">กรุงเทพ (BBL)</option>
                    <option value="กรุงไทย">กรุงไทย (KTB)</option>
                    <option value="กรุงศรี">กรุงศรีอยุธยา (BAY)</option>
                    <option value="ออมสิน">ออมสิน (GSB)</option>
                    <option value="ttb">ทีทีบี (ttb)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Account Number / เลขบัญชี</label>
                  <input 
                    type="text" 
                    name="bankAccount"
                    placeholder="xxx-x-xxxxx-x"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Account Name / ชื่อบัญชี</label>
                  <input 
                    type="text" 
                    name="bankAccountName"
                    placeholder="ชื่อ - นามสกุล (ตรงกับหน้าสมุดบัญชี)"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-600"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !formData.amount || formData.amount < MIN_WITHDRAW}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-orange-500 transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2 mt-4 uppercase tracking-tighter"
              >
                {loading ? <Loader2 className="animate-spin" /> : "ดำเนินการถอนเงิน"} <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic">
              <History className="text-slate-400" size={24} /> History / ประวัติการถอน
            </h3>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">No Transaction History</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-orange-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all group-hover:rotate-6 ${item.status === 'PAID' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                      <Landmark size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800 leading-none mb-1">
                        {item.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 tracking-normal ml-1">THB</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {new Date(item.createdAt).toLocaleDateString('th-TH', { 
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })} น.
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-tighter">{item.bankName}</span>
                         <span className="text-[10px] font-bold text-slate-400">{item.bankAccount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 relative z-10">
                    <StatusBadge status={item.status} />
                    {item.adminNote && (
                      <div className="group/note relative">
                        <div className="flex items-center gap-1 text-red-400 cursor-help">
                           <AlertCircle size={14} />
                           <span className="text-[10px] font-bold underline">ดูเหตุผล</span>
                        </div>
                        <div className="absolute right-0 bottom-7 w-56 bg-slate-800 text-white text-[11px] font-medium p-3 rounded-2xl opacity-0 group-hover/note:opacity-100 transition-all pointer-events-none z-20 shadow-2xl border border-slate-700 leading-relaxed">
                          <span className="text-orange-400 font-black block mb-1 underline">หมายเหตุจากแอดมิน:</span>
                          {item.adminNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- วาง Modal ไว้ล่างสุด --- */}
      <WithdrawOTPModal 
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onConfirm={handleConfirmWithdrawWithOTP}
        email={user?.email}
        loading={otpLoading}
      />
    </div>
  );
};

export default WriterWithdrawal;