'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface StatsData {
  total: number;
  solved: number;
  pending: number;
  by_difficulty: Record<string, { scheduled: number; solved: number }>;
  by_topic: Record<string, { scheduled: number; solved: number }>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export default function AnalyticsClient() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d.data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1e1e2e] rounded-lg h-64 animate-pulse border border-gray-800" />
          ))}
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-gray-400">
        Failed to load analytics.
      </main>
    );
  }

  const topicData = Object.entries(stats.by_topic)
    .map(([name, val]) => ({ name, scheduled: val.scheduled, solved: val.solved }))
    .sort((a, b) => b.scheduled - a.scheduled)
    .slice(0, 10);

  const difficultyPieData = Object.entries(stats.by_difficulty)
    .filter(([, val]) => val.scheduled > 0)
    .map(([name, val]) => ({ name, value: val.scheduled }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>

      <div className="space-y-6">
        <div className="bg-[#1e1e2e] rounded-lg p-5 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Problems by Topic</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topicData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" />
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

        <div className="bg-[#1e1e2e] rounded-lg p-5 border border-gray-800">
          <h3 className="text-white font-semibold mb-4">Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={difficultyPieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {difficultyPieData.map((entry) => (
                  <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#161625', border: '1px solid #374151', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
