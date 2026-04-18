import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Check, X, Eye, FileText, Loader2, UserCheck, 
  AlertCircle, ShieldCheck, CreditCard, Search, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyWriters = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/pending-writers');
      // ปรับให้รองรับทั้ง { data: [] } หรือ { data: { data: [] } } ตามโครงสร้าง API ของคุณ
      setList(data.success ? data.data : data || []);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลผู้สมัครได้");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, status) => {
    let reason = "";
    if (status === 'REJECTED') {
      reason = window.prompt("❌ ระบุเหตุผลที่ไม่ผ่านการอนุมัติ (จะส่งไปแจ้งเตือนผู้ใช้):");
      if (reason === null) return; 
      if (!reason.trim()) return toast.error("ต้องระบุเหตุผลในการปฏิเสธ");
    } else {
      if (!window.confirm("✅ ยืนยันการอนุมัติผู้ใช้รายนี้เป็นนักเขียน?")) return;
    }

    setProcessingId(userId);
    try {
      const { data } = await api.post('/admin/verify-writer', { userId, status, reason });
      if (data.success) {
        toast.success(status === 'APPROVED' ? "อนุมัตินักเขียนเรียบร้อย" : "ปฏิเสธคำขอแล้ว");
        setList(prev => prev.filter(item => item.id !== userId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => { 
    fetchPending(); 
  }, []);

  const filteredList = list.filter(item => 
    item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.realName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" strokeWidth={1} />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 w-6 h-6" />
      </div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] italic animate-pulse">
        System Scanning Applications...
      </p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
               <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">
              Writer <span className="text-orange-500">Verification</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic ml-12">
            Pending Review: <span className="text-orange-600 underline">{list.length} Applications</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search name, penname..."
              className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 font-bold text-sm w-full sm:w-64 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchPending}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <th className="p-8">Account & Pen Name</th>
                <th className="p-8">Legal Identity</th>
                <th className="p-8">Bank Details</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map((item) => (
                <tr key={item.id} className="group hover:bg-orange-50/20 transition-all duration-300">
                  {/* Account Info */}
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform uppercase">
                        {item.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic uppercase text-base">{item.username}</p>
                        <p className="text-[10px] font-black text-orange-500 uppercase">Pen: {item.penName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{item.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Legal Identity */}
                  <td className="p-8">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1 tracking-widest">Real Name</p>
                        <p className="font-bold text-slate-700 text-sm uppercase">{item.realName} {item.realSurname}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.idCardNumber}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DocButton 
                          label="ID CARD" 
                          icon={<IdCardIcon size={12}/>}
                          onClick={() => setSelectedImg(item.idCardImage)} 
                          active={!!item.idCardImage}
                        />
                        <DocButton 
                          label="BANK BOOK" 
                          icon={<ImageIcon size={12}/>}
                          onClick={() => setSelectedImg(item.bankBookImage)} 
                          active={!!item.bankBookImage}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Bank Details */}
                  <td className="p-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={14} className="text-blue-500" />
                        <p className="text-[10px] font-black text-blue-500 uppercase leading-none tracking-widest">{item.bankName || 'N/A'}</p>
                      </div>
                      <p className="font-mono text-sm font-black text-slate-800 tracking-wider">
                        {item.bankAccount || 'No Account'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate">Holder: {item.bankAccountName || 'N/A'}</p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-8">
                    <div className="flex justify-center gap-3">
                      {processingId === item.id ? (
                        <div className="flex items-center gap-2 text-slate-300 animate-pulse">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="text-[10px] font-black uppercase italic">Processing</span>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleVerify(item.id, 'APPROVED')}
                            className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                            title="Approve"
                          >
                            <Check size={24} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleVerify(item.id, 'REJECTED')}
                            className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                            title="Reject"
                          >
                            <X size={24} strokeWidth={3} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <UserCheck size={48} strokeWidth={1} className="text-slate-200" />
            </div>
            <p className="font-black uppercase italic tracking-[0.5em] text-slate-300 text-lg">Inbox Zero</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-2 tracking-widest max-w-xs leading-relaxed">
              Great job! All writers have been audited.
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-slate-950/98 z-[100] flex items-center justify-center p-4 md:p-12 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative w-full max-w-6xl flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
              onClick={() => setSelectedImg(null)}
            >
              Close <X size={20} />
            </button>

            <img 
              src={selectedImg} 
              alt="Verification Document" 
              className="max-w-full max-h-[80vh] rounded-[2rem] shadow-2xl border border-white/10 object-contain animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const IdCardIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 10h4M7 14h4M15 10v4" />
  </svg>
);

const DocButton = ({ label, onClick, active, icon }) => (
  <button 
    onClick={onClick}
    disabled={!active}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border
      ${active 
        ? 'bg-white border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600 shadow-sm' 
        : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed opacity-50'}`}
  >
    {icon}
    {label}
  </button>
);

export default VerifyWriters;