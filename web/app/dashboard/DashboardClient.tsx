'use client';

import { useEffect, useState, useCallback } from 'react';

interface RevisionEvent {
  id: string;
  due_date: string;
  interval_day: number;
  is_completed: boolean;
}

interface Problem {
  id: string;
  problem_title: string;
  problem_url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic_tags: string[];
  is_solved: boolean;
  scheduled_at: string;
  revision_events: RevisionEvent[];
}

interface Stats {
  total: number;
  solved: number;
  pending: number;
  current_streak: number;
}

const difficultyStyle: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
};

function getNextDue(events: RevisionEvent[]): string | null {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((e) => !e.is_completed && e.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  if (!upcoming[0]) return null;
  const d = new Date(upcoming[0].due_date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getDaysUntil(events: RevisionEvent[]): number | null {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((e) => !e.is_completed && e.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  if (!upcoming[0]) return null;
  const diff = new Date(upcoming[0].due_date).getTime() - new Date(today).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardClient() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [solvingId, setSolvingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/problems?status=pending'),
        fetch('/api/stats'),
      ]);
      if (pRes.ok) setProblems((await pRes.json()).data ?? []);
      if (sRes.ok) setStats((await sRes.json()).data ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSolve = async (id: string) => {
    setSolvingId(id);
    const res = await fetch('/api/solve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem_id: id }),
    });
    if (res.ok) {
      setProblems((prev) => prev.filter((p) => p.id !== id));
      if (stats) setStats({ ...stats, solved: stats.solved + 1, pending: stats.pending - 1 });
    }
    setSolvingId(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const dueToday = problems.filter((p) =>
    p.revision_events.some((e) => !e.is_completed && e.due_date === today)
  );
  const filtered = problems.filter((p) => filter === 'all' || p.difficulty === filter);

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">

      {/* Stats row — minimal numbers, no boxes */}
      <div className="flex gap-8 mb-12 border-b border-white/5 pb-8">
        {[
          { label: 'scheduled', value: stats?.total ?? 0 },
          { label: 'solved', value: stats?.solved ?? 0 },
          { label: 'pending', value: stats?.pending ?? 0 },
          { label: 'day streak', value: stats?.current_streak ?? 0 },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Due Today */}
      {dueToday.length > 0 && (
        <section className="mb-10">
          <p className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-4">
            Due Today — {dueToday.length} problem{dueToday.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-px">
            {dueToday.map((p) => (
              <ProblemRow key={p.id} problem={p} onSolve={handleSolve} solvingId={solvingId} highlight />
            ))}
          </div>
        </section>
      )}

      {/* All Pending */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">All Pending</p>
          <div className="flex gap-1">
            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  filter === f
                    ? 'bg-white/10 text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/3 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/20 text-sm">No pending revisions. Go struggle on some problems.</p>
          </div>
        ) : (
          <div className="space-y-px">
            {filtered.map((p) => (
              <ProblemRow key={p.id} problem={p} onSolve={handleSolve} solvingId={solvingId} />
            ))}
          </div>
        )}
      </section>
      <footer className="text-center py-6 text-white/30 text-xs mt-16">
        <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
        <span className="mx-2">·</span>
        <span>© 2026 LeetRevise</span>
      </footer>
    </main>
  );
}

function ProblemRow({
  problem,
  onSolve,
  solvingId,
  highlight = false,
}: {
  problem: Problem;
  onSolve: (id: string) => void;
  solvingId: string | null;
  highlight?: boolean;
}) {
  const nextDue = getNextDue(problem.revision_events);
  const daysUntil = getDaysUntil(problem.revision_events);
  const isLoading = solvingId === problem.id;

  return (
    <div
      className={`group flex items-center justify-between py-3 px-3 rounded-lg transition-colors ${
        highlight ? 'bg-orange-500/5' : 'hover:bg-white/3'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Difficulty dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          problem.difficulty === 'Easy' ? 'bg-emerald-400' :
          problem.difficulty === 'Hard' ? 'bg-red-400' : 'bg-yellow-400'
        }`} />

        <div className="min-w-0">
          <a
            href={problem.problem_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/80 hover:text-white transition-colors truncate block font-medium"
          >
            {problem.problem_title}
          </a>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${difficultyStyle[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            {problem.topic_tags.slice(0, 2).map((t) => (
              <span key={t} className="text-xs text-white/20">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-4">
        {nextDue && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/40">{nextDue}</p>
            {daysUntil === 0 ? (
              <p className="text-xs text-orange-400">today</p>
            ) : daysUntil === 1 ? (
              <p className="text-xs text-yellow-400/70">tomorrow</p>
            ) : (
              <p className="text-xs text-white/20">in {daysUntil}d</p>
            )}
          </div>
        )}

        <button
          onClick={() => onSolve(problem.id)}
          disabled={isLoading}
          className="text-xs text-white/30 hover:text-emerald-400 transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
        >
          {isLoading ? 'saving...' : 'solved'}
        </button>
      </div>
    </div>
  );
}
