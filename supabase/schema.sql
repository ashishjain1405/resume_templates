-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount_inr INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Row-level security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses RLS for inserts in API routes

-- Resume builder: stores user's resume data per template
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  accent_color TEXT,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id)
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resumes"
  ON resumes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pro Access: one-time purchase unlocking all templates + ATS checker
CREATE TABLE IF NOT EXISTS pro_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount_inr INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pro_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pro access"
  ON pro_access FOR SELECT
  USING (auth.uid() = user_id);

-- Expert sessions: 1:1 live resume review sessions (Pro only)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  google_event_id TEXT,
  meet_link TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);
