'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' };

export default function GrowthChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => '₹' + v.toLocaleString('en-IN')} />
        <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#growth)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
