import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { REPORT_DATA, TICKET_DISTRIBUTION } from '../../constants';

const ReportsView: React.FC = () => {
  return (
    <div className="px-6 pb-12 space-y-6 overflow-y-auto custom-scrollbar h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">speed</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sprint Velocity</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">42 pts</h3>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined">bug_report</span>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">+5%</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Bugs</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">12</h3>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">+8%</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed Tasks</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">38</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Burndown Chart</h3>
                <select className="bg-gray-100 dark:bg-dark-bg border-none text-xs rounded-md px-3 py-1 text-slate-700 dark:text-slate-300 focus:ring-0">
                    <option>Sprint 24</option>
                    <option>Sprint 23</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REPORT_DATA}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="ideal" 
                            stroke="#94a3b8" 
                            strokeDasharray="5 5" 
                            fill="none" 
                            strokeWidth={2}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorActual)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Ticket Distribution</h3>
            <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">143</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total</span>
                </div>
                <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={TICKET_DISTRIBUTION}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {TICKET_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                {TICKET_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
