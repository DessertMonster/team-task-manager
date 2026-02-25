CREATE TYPE auth_status AS ENUM ('unverified', 'active', 'suspended');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE delivery_status AS ENUM ('queued', 'sent', 'failed');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed');
CREATE TYPE audit_target_type AS ENUM ('user', 'team', 'invitation', 'task', 'config');

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT NOT NULL,
  auth_status auth_status NOT NULL DEFAULT 'unverified',
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  last_failed_login_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_memberships (
  team_id TEXT NOT NULL REFERENCES teams(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role team_role NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  email TEXT NOT NULL,
  invited_by_user_id TEXT NOT NULL REFERENCES users(id),
  status invitation_status NOT NULL,
  delivery_status delivery_status NOT NULL,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  last_delivery_attempt_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_team_email_status
  ON invitations (team_id, email, status);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'open',
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  assigned_to_user_id TEXT REFERENCES users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_team_status ON tasks (team_id, status);
CREATE INDEX idx_tasks_team_deleted_at ON tasks (team_id, deleted_at);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  team_id TEXT,
  event_type TEXT NOT NULL,
  target_type audit_target_type NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  retention_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_audit_events_retention_until ON audit_events (retention_until);
CREATE INDEX idx_audit_events_team_occurred_at ON audit_events (team_id, occurred_at);
