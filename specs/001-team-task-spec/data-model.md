# Data Model: Team Task Manager MVP

## Feature Ownership
- `auth`: account lifecycle, login throttling, session events.
- `teams`: team creation, membership, invitations, ownership transfer.
- `tasks`: task lifecycle, filtering, concurrency control, deleted-task restore.
- `shared`: reusable utilities only (time, ID generation/validation, logging helpers).

## Identifier Standard
- All primary keys and foreign references use prefixed CUID strings.
- Prefixes:
  - User: `usr_`
  - Team: `team_`
  - Invitation: `inv_`
  - Task: `task_`
  - Audit Event: `audit_`
- Validation:
  - IDs MUST match `^<prefix>[a-z0-9]+$` and pass CUID format validation.

## Entity: User
- Primary Key: `id` (string, prefixed CUID: `usr_<cuid>`)
- Fields:
  - `email` (string, unique, required, normalized lowercase)
  - `displayName` (string, required, 1-120 chars)
  - `avatarUrl` (string, optional)
  - `timezone` (string, required, IANA timezone identifier)
  - `authStatus` (enum: `unverified`, `active`, `suspended`)
  - `failedLoginCount` (integer, default 0)
  - `lastFailedLoginAt` (timestamp UTC, optional)
  - `lastLoginAt` (timestamp UTC, optional)
  - `createdAt` (timestamp UTC, required)
  - `updatedAt` (timestamp UTC, required)
- Relationships:
  - One-to-many `TeamMembership`
  - One-to-many `Task` as creator
  - One-to-many `Task` as assignee

## Entity: Team
- Primary Key: `id` (string, prefixed CUID: `team_<cuid>`)
- Fields:
  - `name` (string, required, globally unique, 1-120 chars)
  - `ownerUserId` (string, required, FK -> User.id)
  - `createdAt` (timestamp UTC, required)
  - `updatedAt` (timestamp UTC, required)
- Relationships:
  - One-to-many `TeamMembership`
  - One-to-many `Invitation`
  - One-to-many `Task`

## Entity: TeamMembership
- Composite Key: (`teamId`, `userId`)
- Fields:
  - `teamId` (string, required, FK -> Team.id)
  - `userId` (string, required, FK -> User.id)
  - `role` (enum: `owner`, `admin`, `member`)
  - `joinedAt` (timestamp UTC, required)
  - `updatedAt` (timestamp UTC, required)
- Rules:
  - Team must always retain at least one admin-capable member (`owner` or `admin`).
  - Access revocation applies immediately when membership is removed.

## Entity: Invitation
- Primary Key: `id` (string, prefixed CUID: `inv_<cuid>`)
- Fields:
  - `teamId` (string, required, FK -> Team.id)
  - `email` (string, required, normalized lowercase)
  - `invitedByUserId` (string, required, FK -> User.id)
  - `status` (enum: `pending`, `accepted`, `expired`, `revoked`)
  - `deliveryStatus` (enum: `queued`, `sent`, `failed`)
  - `deliveryAttempts` (integer, default 0)
  - `lastDeliveryAttemptAt` (timestamp UTC, optional)
  - `expiresAt` (timestamp UTC, required)
  - `createdAt` (timestamp UTC, required)
  - `respondedAt` (timestamp UTC, optional)
- Rules:
  - Invitation record is created regardless of initial delivery outcome.
  - Active unique constraint for (`teamId`, `email`, `status = pending`).

## Entity: Task
- Primary Key: `id` (string, prefixed CUID: `task_<cuid>`)
- Fields:
  - `teamId` (string, required, FK -> Team.id)
  - `title` (string, required, 1-200 chars)
  - `description` (string, optional, max 5000 chars)
  - `status` (enum: `open`, `in_progress`, `completed`)
  - `createdByUserId` (string, required, FK -> User.id)
  - `assignedToUserId` (string, optional, FK -> User.id)
  - `dueDate` (timestamp UTC, optional)
  - `completedAt` (timestamp UTC, nullable)
  - `deletedAt` (timestamp UTC, nullable)
  - `version` (integer, required, default 1)
  - `createdAt` (timestamp UTC, required)
  - `updatedAt` (timestamp UTC, required)
- Rules:
  - Normal task list excludes rows where `deletedAt` is set.
  - Recently Deleted view includes only rows with `deletedAt` within last 30 days.
  - Task updates require matching `version`; stale versions are rejected.

## Entity: AuditEvent
- Primary Key: `id` (string, prefixed CUID: `audit_<cuid>`)
- Fields:
  - `actorUserId` (string, nullable)
  - `teamId` (string, nullable)
  - `eventType` (enum: `auth_attempt`, `auth_success`, `auth_failure`, `task_created`, `task_updated`, `task_completed`, `task_deleted`, `task_restored`, `invite_created`, `invite_delivery_failed`, `invite_delivery_sent`, `membership_removed`, `ownership_transferred`)
  - `targetType` (enum: `user`, `team`, `invitation`, `task`)
  - `targetId` (string, required)
  - `metadata` (json, optional)
  - `occurredAt` (timestamp UTC, required)
  - `retentionUntil` (timestamp UTC, required; occurredAt + 1 year)

## State Transitions

### Task Status
- `open -> in_progress`
- `open -> completed`
- `in_progress -> completed`
- `in_progress -> open`
- `completed -> open`

### Task Deletion Lifecycle
- `active -> soft_deleted` (set `deletedAt`)
- `soft_deleted -> restored` (if age <= 30 days)
- `soft_deleted -> expired` (age > 30 days; no restore)

### Invitation Lifecycle
- `pending -> accepted`
- `pending -> expired`
- `pending -> revoked`

### Invitation Delivery Lifecycle
- `queued -> sent`
- `queued -> failed`
- `failed -> queued` (retry)

## Validation Rules Summary
- Team names globally unique.
- Users and invitations use normalized email format.
- All IDs must match expected prefix and CUID format before persistence.
- All persisted timestamps are UTC; display conversion occurs at presentation layer.
- Deleted tasks hidden from standard lists; restore only via Recently Deleted path.
- Audit events retained exactly 1 year from creation.
