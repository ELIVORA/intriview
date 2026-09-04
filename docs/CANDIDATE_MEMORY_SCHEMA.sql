-- Interview Cracker Candidate Memory foundation for Supabase/PostgreSQL.
-- Run after enabling RLS. The Express server uses the service role and remains
-- the application authority; never expose SUPABASE_SERVICE_ROLE_KEY to Vite.

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  email text,
  full_name text,
  target_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidate_resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  file_name text,
  raw_text text,
  parsed_profile jsonb not null default '{}'::jsonb,
  ats_score integer,
  is_current boolean not null default true,
  uploaded_at timestamptz not null default now()
);

create table if not exists candidate_skills (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  skill_name text not null,
  category text,
  proficiency numeric not null default 0,
  confidence numeric not null default 0,
  evidence_count integer not null default 0,
  last_assessed_at timestamptz,
  unique(candidate_id, skill_name)
);

create table if not exists candidate_topics (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  topic text not null,
  category text,
  status text not null default 'not_assessed',
  mastery_score numeric not null default 0,
  confidence numeric not null default 0,
  assessment_count integer not null default 0,
  last_assessed_at timestamptz,
  recent_scores jsonb not null default '[]'::jsonb,
  unique(candidate_id, topic)
);

create table if not exists candidate_memory (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  memory jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  candidate_user_id text not null,
  mode text not null,
  interview_type text not null,
  status text not null,
  score numeric,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references interview_sessions(session_id) on delete cascade,
  sequence_number integer not null,
  question_text text not null,
  topic text,
  difficulty text,
  generated_from text,
  asked_at timestamptz not null default now(),
  unique(session_id, sequence_number)
);

create table if not exists interview_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references interview_questions(id) on delete cascade,
  answer_text text not null,
  duration_seconds integer,
  answered_at timestamptz not null default now()
);

create table if not exists interview_evaluations (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references interview_answers(id) on delete cascade,
  overall_score numeric,
  technical_score numeric,
  communication_score numeric,
  confidence_score numeric,
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_candidate_skills_candidate on candidate_skills(candidate_id);
create unique index if not exists uq_candidate_skills_candidate_skill on candidate_skills(candidate_id, skill_name);
create index if not exists idx_candidate_topics_candidate on candidate_topics(candidate_id);
create unique index if not exists uq_candidate_topics_candidate_topic on candidate_topics(candidate_id, topic);
create index if not exists idx_interview_sessions_candidate on interview_sessions(candidate_user_id);
create index if not exists idx_interview_questions_session on interview_questions(session_id);
create unique index if not exists uq_interview_questions_session_sequence on interview_questions(session_id, sequence_number);
create index if not exists idx_interview_answers_question on interview_answers(question_id);
create index if not exists idx_interview_evaluations_answer on interview_evaluations(answer_id);

alter table candidates enable row level security;
alter table candidate_resumes enable row level security;
alter table candidate_skills enable row level security;
alter table candidate_topics enable row level security;
alter table candidate_memory enable row level security;
alter table interview_sessions enable row level security;
alter table interview_questions enable row level security;
alter table interview_answers enable row level security;
alter table interview_evaluations enable row level security;
