import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  DollarSign, Users, BookOpen, TrendingUp, 
  PieChart, Calendar, Clock, BarChart3,
  ShieldCheck, ArrowUpRight, Settings, 
  CreditCard, AlertCircle, Loader2,
  Sparkles, Megaphone // รวม Icon ที่จำเป็นทั้งหมด
} from 'lucide-react';
import RevenueChart from "../../components/admin/RevenueChart";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [systemSettings, setSystemSettings] = useState({ writerShare: 60, systemShare: 40 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/admin/settings')
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.data.success) {
          setStats(results[0].value.data.stats);
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.success) {
          setSystemSettings(results[1].value.data.data);
        }
      } catch (err) {
        console.error("Critical Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] italic text-center">
        Accessing bussababun.com Core Database... <br/> Operated by bongkochakorn
      </p>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border-4 border-slate-900 p-12 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] max-w-md text-center">
        <AlertCircle size={60} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-slate-900 font-black uppercase italic text-3xl tracking-tighter">Sync Failed</h2>
        <p className="text-slate-500 mt-4 font-bold uppercase text-xs tracking-widest leading-relaxed">
          The terminal could not establish a secure handshake with the administrative server.
        </p>
        <button onClick={() => window.location.reload()} className="mt-10 w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase hover:bg-orange-500 transition-all">
          Re-establish Protocol
        </button>
      </div>
    </div>
  );

  const currentData = stats[timeframe] || stats['monthly'] || {};
  const timeframeLabels = { daily: "ข้อมูลวันนี้", monthly: "ข้อมูลเดือนนี้", allTime: "ข้อมูลทั้งหมด" };

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen space-y-10 animate-fadeIn pb-24">
      
      {/* 1. TOP BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            Admin <span className="text-orange-500 underline decoration-slate-900 underline-offset-[12px]">Terminal</span>
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] italic">
              System Online: {timeframeLabels[timeframe]} | bussababun.com
            </p>
          </div>
        </div>

        <div className="flex bg-white/80 p-2 rounded-[2.5rem] shadow-sm border border-slate-200 backdrop-blur-md overflow-x-auto">
          {[
            { id: 'daily', label: 'Today', icon: <Clock size={16} /> },
            { id: 'monthly', label: 'Monthly', icon: <Calendar size={16} /> },
            { id: 'allTime', label: 'All-Time', icon: <BarChart3 size={16} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                timeframe === item.id 
                ? 'bg-slate-900 text-white shadow-xl scale-105' 
                : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Cash In (THB)" value={(timeframe === 'allTime' ? currentData.totalMoneyIn : currentData.moneyIn)} unit="THB" icon={<DollarSign />} color="bg-emerald-500" />
        <StatCard title="Gross Sales" value={(timeframe === 'allTime' ? currentData.totalSalesCoins : currentData.salesCoins)} unit="COINS" icon={<BookOpen />} color="bg-blue-600" />
        <StatCard title={`Writer Share (${systemSettings?.writerShare || 0}%)`} value={currentData.writerEarnings} unit="COINS" icon={<PieChart />} color="bg-orange-500" />
        <StatCard title="System Revenue" value={currentData.systemRevenue} unit="COINS" icon={<TrendingUp />} color="bg-indigo-600" />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="font-black italic uppercase text-slate-800 tracking-tighter text-2xl">Financial Stream</h3>
                <TrendingUp size={24} className="text-orange-500" />
            </div>
            <div className="h-[400px] relative z-10">
                <RevenueChart timeframe={timeframe} />
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
              <BarChart3 size={300} />
            </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] ml-8">Command Center</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* --- NEW: จัดการประกาศ --- */}
            <QuickActionLink 
              to="/admin/announcements" 
              title="จัดการประกาศ" 
              subtitle="Broadcast News to Users"
              icon={<Megaphone size={20} />}
              color="bg-indigo-50 text-indigo-600"
              hoverColor="hover:border-indigo-500 hover:bg-indigo-50/50"
              active={location.pathname === '/admin/announcements'}
            />

            <QuickActionLink 
              to="/admin/novels" 
              title="Novel Management" 
              subtitle="Editor's Choice & Recommend"
              icon={<Sparkles size={20} />}
              color="bg-orange-50 text-orange-600"
              hoverColor="hover:border-orange-500 hover:bg-orange-50/50"
            />

            <QuickActionLink 
              to="/admin/withdrawals" 
              title="Withdrawals" 
              subtitle={`Pending: ${stats.counts?.pendingWithdrawals || 0} req.`} 
              icon={<CreditCard size={20} />} 
              color="bg-emerald-50 text-emerald-600" 
              hoverColor="hover:border-emerald-500" 
            />

            <QuickActionLink 
              to="/admin/verify-writers" 
              title="Verification" 
              subtitle={`${stats.counts?.pendingWriters || 0} applicants`} 
              icon={<ShieldCheck size={20} />} 
              color="bg-blue-50 text-blue-600" 
              hoverColor="hover:border-blue-500" 
            />

            <QuickActionLink 
              to="/admin/settings" 
              title="Settings" 
              subtitle="System Config" 
              icon={<Settings size={20} />} 
              color="bg-slate-900 text-white" 
              hoverColor="hover:bg-orange-600" 
              dark 
            />
          </div>

          <div className="mt-2 bg-white p-8 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] group hover:-translate-y-1 transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Revenue Split Policy</p>
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-4xl font-black italic text-slate-900 leading-none">
                    {systemSettings?.writerShare || 0}/{systemSettings?.systemShare || 0}
                  </span>
                  <span className="text-[10px] font-bold text-orange-500 uppercase mt-1 tracking-tighter">Writer/System Ratio</span>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl group-hover:rotate-12 transition-transform">
                  <PieChart size={30} className="text-orange-500" />
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER STATS */}
      <div className="bg-slate-900 p-12 rounded-[4.5rem] text-white flex flex-wrap items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 relative z-10">
            <div>
              <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-3 italic">Active Users</p>
              <p className="text-6xl font-black tracking-tighter italic leading-none">
                {stats.counts?.userCount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="md:border-l md:border-white/10 md:pl-24">
              <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-3 italic">Published Works</p>
              <p className="text-6xl font-black tracking-tighter italic leading-none">
                {stats.counts?.novelCount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 px-10 py-8 rounded-[3rem] flex items-center gap-6 relative z-10 hover:bg-white/10 transition-all cursor-default">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Users size={24} strokeWidth={3} className="text-white" />
            </div>
            <p className="text-xs font-bold leading-relaxed uppercase tracking-widest">
              Critical: <span className="text-orange-400 font-black">{stats.counts?.pendingWriters || 0} applicants</span> <br/>
              waiting for approval.
            </p>
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px]"></div>
      </div>

    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, unit, icon, color }) => (
  <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
    <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
      {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic leading-none">
        {Number(value || 0).toLocaleString()}
      </h2>
      <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{unit}</span>
    </div>
    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-orange-50 transition-colors duration-500"></div>
  </div>
);

const QuickActionLink = ({ to, title, subtitle, icon, color, hoverColor, dark, active }) => (
  <Link 
    to={to} 
    className={`${dark ? color : active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border border-slate-100'} p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl ${hoverColor} transition-all group flex justify-between items-center overflow-hidden relative`}
  >
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-white/20 text-white' : !dark && color}`}>
        {icon}
      </div>
      <div>
        <h4 className={`font-black uppercase italic text-sm ${dark || active ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
        <p className={`text-[9px] font-bold uppercase tracking-widest ${dark || active ? 'text-white/60' : 'text-slate-400'}`}>{subtitle}</p>
      </div>
    </div>
    <ArrowUpRight size={20} className={`${dark || active ? 'text-white/20' : 'text-slate-200'} group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10`} />
  </Link>
);

export default AdminDashboard;