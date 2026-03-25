-- ============================================================
-- LeetRevise Database Schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- TABLE: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT UNIQUE NOT NULL,
  google_id             TEXT UNIQUE,
  full_name             TEXT,
  avatar_url            TEXT,
  google_calendar_token TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- TABLE: scheduled_problems
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_problems (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
  problem_title  TEXT NOT NULL,
  problem_url    TEXT NOT NULL,
  difficulty     TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic_tags     TEXT[],
  is_solved      BOOLEAN DEFAULT false,
  scheduled_at   TIMESTAMPTZ DEFAULT now(),
  solved_at      TIMESTAMPTZ,
  UNIQUE(user_id, problem_url)
);

-- ------------------------------------------------------------
-- TABLE: revision_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revision_events (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id               UUID REFERENCES public.scheduled_problems(id) ON DELETE CASCADE,
  user_id                  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  due_date                 DATE NOT NULL,
  interval_day             INT NOT NULL,
  is_completed             BOOLEAN DEFAULT false,
  google_calendar_event_id TEXT,
  email_sent               BOOLEAN DEFAULT false,
  completed_at             TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_revision_events_due_date_completed
  ON public.revision_events(due_date, is_completed);

CREATE INDEX IF NOT EXISTS idx_scheduled_problems_user_solved
  ON public.scheduled_problems(user_id, is_solved);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_events    ENABLE ROW LEVEL SECURITY;

-- users: each user manages only their own row
CREATE POLICY users_select ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_insert ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_update ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY users_delete ON public.users
  FOR DELETE USING (auth.uid() = id);

-- scheduled_problems
CREATE POLICY sp_select ON public.scheduled_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY sp_insert ON public.scheduled_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY sp_update ON public.scheduled_problems
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY sp_delete ON public.scheduled_problems
  FOR DELETE USING (auth.uid() = user_id);

-- revision_events
CREATE POLICY re_select ON public.revision_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY re_insert ON public.revision_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY re_update ON public.revision_events
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY re_delete ON public.revision_events
  FOR DELETE USING (auth.uid() = user_id);
