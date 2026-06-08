'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' };

export default function SpendingChart({ data, view }: { data: { month: string; spending: number; income: number }[]; view: 'spending' | 'income' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {view === 'spending' ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => '₹' + v.toLocaleString('en-IN')} />
          <Bar dataKey="spending" fill="#005BAC" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => '₹' + v.toLocaleString('en-IN')} />
          <Bar dataKey="income" fill="#28A745" radius={[6, 6, 0, 0]} barSize={20} />
          <Bar dataKey="spending" fill="#DC2626" radius={[6, 6, 0, 0]} barSize={20} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
