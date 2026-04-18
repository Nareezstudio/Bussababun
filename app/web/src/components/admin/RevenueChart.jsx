import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../api/axios';

const RevenueChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChart = async () => {
      const res = await api.get('/admin/chart-revenue');
      if (res.data.success) setData(res.data.data);
    };
    fetchChart();
  }, []);

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 w-full h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase italic">Revenue Analytics</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Last 7 Days Performance</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Income (THB)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-900"></span> Sales (Coins)</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#f97316" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
          />
          <Area 
            type="monotone" 
            dataKey="coins" 
            stroke="#0f172a" 
            strokeWidth={4}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;