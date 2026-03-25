'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StatsChartProps {
  data: Array<{ name: string; scheduled: number; solved: number }>;
  title: string;
}

export default function StatsChart({ data, title }: StatsChartProps) {
  return (
    <div className="bg-[#1e1e2e] rounded-lg p-5 border border-gray-800">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#161625', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Legend />
          <Bar dataKey="scheduled" name="Scheduled" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="solved" name="Solved" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
