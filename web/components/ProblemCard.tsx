'use client';

import { useState } from 'react';

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

interface ProblemCardProps {
  problem: Problem;
  onSolve?: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

function getNextDueDate(events: RevisionEvent[]): string | null {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((e) => !e.is_completed && e.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  return upcoming[0]?.due_date ?? null;
}

export default function ProblemCard({ problem, onSolve }: ProblemCardProps) {
  const [loading, setLoading] = useState(false);
  const nextDue = getNextDueDate(problem.revision_events);

  const handleSolve = async () => {
    if (!onSolve) return;
    setLoading(true);
    await onSolve(problem.id);
    setLoading(false);
  };

  return (
    <div className="bg-[#1e1e2e] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={problem.problem_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium hover:text-orange-400 transition-colors truncate block"
          >
            {problem.problem_title}
          </a>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${difficultyColors[problem.difficulty] ?? ''}`}>
              {problem.difficulty}
            </span>
            {problem.topic_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          {nextDue && (
            <p className="text-xs text-gray-500 mt-2">
              Next revision: <span className="text-orange-400">{nextDue}</span>
            </p>
          )}
        </div>
        {!problem.is_solved && onSolve && (
          <button
            onClick={handleSolve}
            disabled={loading}
            className="shrink-0 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          >
            {loading ? 'Saving...' : 'Mark Solved'}
          </button>
        )}
        {problem.is_solved && (
          <span className="shrink-0 text-xs text-emerald-400 font-semibold">Solved</span>
        )}
      </div>
    </div>
  );
}
