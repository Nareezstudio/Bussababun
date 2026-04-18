import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { DollarSign, CheckCircle, XCircle, Clock, Image as ImageIcon, Loader2, Search, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminWithdrawal = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, PAID, REJECTED
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/withdrawals');
      // สมมติว่า backend ส่งมาทั้งหมด เราจะกรองด้วย frontend หรือส่ง query ไปก็ได้
      setRequests(data.data || []);
    } catch (err) {
      toast.error("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    let adminNote = "";
    let slipImage = null;

    if (status === 'REJECTED') {
      adminNote = window.prompt("❌ ระบุเหตุผลที่ปฏิเสธ (เพื่อแจ้งนักเขียน):");
      if (!adminNote) return;
    } else {
      if (!window.confirm("✅ ยืนยันว่าคุณได้โอนเงินยอดนี้เรียบร้อยแล้ว?")) return;
      adminNote = "โอนเงินเรียบร้อย";
      // ในอนาคตคุณสามารถเพิ่มฟังก์ชันอัปโหลดไฟล์สลิปตรงนี้ได้
    }

    setIsUpdating(id);
    try {
      await api.post('/admin/withdrawals/approve', { 
        withdrawalId: id, 
        status, 
        adminNote 
      });
      toast.success(status === 'PAID' ? "ยืนยันยอดโอนสำเร็จ" : "ปฏิเสธรายการแล้ว");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsUpdating(null);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filteredRequests = requests.filter(r => r.status === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">Financial Auditing...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">
            Payout <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic mt-1">
            Total Volume: ฿{requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-slate-100 w-full lg:w-auto overflow-x-auto">
          {['PENDING', 'PAID', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === tab 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-6">
        {filteredRequests.map((req) => (
          <div 
            key={req.id} 
            className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden"
          >
            {/* User Info */}
            <div className="flex items-center gap-5 w-full xl:w-1/4">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner transition-colors ${
                req.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
              }`}>
                ฿
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-800 uppercase italic text-lg truncate">{req.user.username}</p>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                   <Clock size={10} /> {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="flex-1 w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-colors duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Bank Institution</p>
                  <p className="font-black text-slate-700 italic text-sm uppercase">{req.bankName || 'KASIKORN BANK'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Account Name</p>
                  <p className="font-bold text-slate-600 text-xs">{req.bankAccountName || req.user.username}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Number</p>
                <p className="text-xl font-mono font-black text-slate-800 tracking-tighter">{req.bankAccount || 'XXX-X-XXXXX-X'}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="w-full xl:w-1/6 text-center xl:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-[0.2em]">Net Payout</p>
              <p className="text-4xl font-black text-slate-900 italic tracking-tighter">
                <span className="text-sm font-bold mr-1 not-italic">฿</span>
                {req.amount.toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full xl:w-auto">
              {req.status === 'PENDING' ? (
                <>
                  <button 
                    disabled={isUpdating === req.id}
                    onClick={() => handleUpdateStatus(req.id, 'PAID')} 
                    className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-slate-200"
                  >
                    {isUpdating === req.id ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={16} />}
                    Confirm Transfer
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'REJECTED')} 
                    className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <XCircle size={24} />
                  </button>
                </>
              ) : (
                <div className={`flex items-center gap-2 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                  req.status === 'PAID' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                  : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                  {req.status === 'PAID' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {req.status}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[4rem] border border-dashed border-slate-200">
            <DollarSign size={64} strokeWidth={1} className="mb-4 opacity-10" />
            <p className="font-black uppercase italic tracking-[0.4em] text-sm">No {filter} Requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawal;