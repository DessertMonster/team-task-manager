# Quickstart: Team Task Manager MVP Validation

## Prerequisites

- Node.js 24.12.0 and package manager configured.
- PostgreSQL instance available.
- Cognito user pool/app client configured.
- Required environment variables for backend/frontend/DB configured.

## Setup

1. Install dependencies for backend, frontend, and CDK workspaces.
2. Apply database migrations.
3. Seed at least two users and one team.
4. Start backend and frontend services.

## README Validation (FR-025 / SC-007)

1. Ensure root `README.md` exists and includes:
   - application purpose
   - architecture overview
   - local development setup
   - required environment variables
   - testing workflow
   - AWS CDK deployment steps
2. Follow `README.md` on a clean environment and verify setup + deployment prep
   can be completed within 45 minutes.

## Feature-Slice Check (Maintainability Gate)

1. Confirm backend code is organized under:
   - `backend/src/features/auth`
   - `backend/src/features/teams`
   - `backend/src/features/tasks`
   - `backend/src/shared`
2. Confirm frontend code is organized under:
   - `frontend/src/features/auth`
   - `frontend/src/features/teams`
   - `frontend/src/features/tasks`
   - `frontend/src/shared`

## Identifier Strategy Check (CUID Gate)

1. Verify created IDs use required prefixes:
   - User: `usr_`
   - Team: `team_`
   - Invitation: `inv_`
   - Task: `task_`
2. Submit malformed IDs and verify API rejects with validation error.

## Infrastructure Check (CDK Gate)

1. Run CDK synthesis and verify stacks compile successfully.
2. Validate stack boundaries for auth, app/API, and data integration concerns.
3. Run CDK deployment and confirm stack outputs include:
   - `frontendUrl`
   - `apiBaseUrl`
4. Run smoke checks against the published URLs and verify both endpoints are reachable.
5. Verify deployment configuration is environment-safe and reproducible.

## Core Functional Validation

1. Register user with timezone, verify account, login.
2. Create team with globally unique name.
3. Invite member and verify retry/status behavior on delivery failure.
4. Accept invitation and confirm membership updates.
5. Create, assign, filter, and complete tasks.
6. Attempt stale update with old version and verify conflict response.
7. Simulate offline queue and verify explicit confirmation is required before sync.
8. Soft-delete task, verify task disappears from normal lists, appears in Recently
   Deleted view, and can be restored within 30 days.

## Security and Audit Validation

1. Verify unauthorized task/team operations are rejected.
2. Verify repeated failed login attempts trigger throttling.
3. Verify audit events are created for auth attempts, invitation events,
   team membership changes, and task lifecycle changes.
4. Verify audit events include retention horizon of 1 year.

## Performance and Reliability Validation

1. Measure p95 interactive task actions (<1s).
2. Measure p95 page load (<2s).
3. Measure p95 API latency (<500ms).
4. Measure task update propagation to active collaborators (<2s).
5. Verify availability target tracking supports 99.5% objective.

## Exit Criteria

- Functional, security, performance, maintainability, identifier, and IaC checks pass.
- `README.md` is complete and verified for onboarding/deployment readiness.
- No unresolved clarification or contract mismatch remains.
