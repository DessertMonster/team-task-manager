# Research: Team Task Manager MVP

## Auth and Account Lifecycle
- Decision: Use Cognito for registration, verification, authentication, and password
  recovery with temporary login throttling on failed attempts.
- Rationale: Meets constitution constraints and minimizes custom auth security risk.
- Alternatives considered:
  - Custom auth store/service: rejected for high security burden.
  - OAuth-only flow: rejected because email/password recovery is required.

## Team Authorization and Access Revocation
- Decision: Enforce server-side team-scoped RBAC on all mutating team/task actions
  with immediate membership revocation effects.
- Rationale: Required for security correctness and matches functional acceptance paths.
- Alternatives considered:
  - Client-only permission checks: rejected due to bypass risk.
  - Delayed revocation propagation: rejected due to policy/access gap risk.

## Optimistic Concurrency and Offline Sync
- Decision: Use entity version checks for task updates; reject stale writes with
  conflict responses; require explicit user confirmation before syncing queued
  offline edits after reconnect.
- Rationale: Prevents silent overwrite and aligns with accepted clarifications.
- Alternatives considered:
  - Last-write-wins: rejected due to data-loss risk.
  - Pessimistic record locking: rejected due to high collaboration friction.

## Feature-First Module Boundaries
- Decision: Canonical feature slices are `auth`, `teams`, and `tasks`, with a
  minimal `shared` module only for true cross-cutting utilities.
- Rationale: Satisfies constitutional maintainability principle and improves
  ownership/testing boundaries.
- Alternatives considered:
  - Layer-first structure (`models/services/controllers`): rejected by constitution.
  - Additional `activity` slice in MVP: deferred to avoid premature complexity.

## Identifier Strategy
- Decision: Use prefixed CUID identifiers for all primary entities and references
  (e.g., `usr_<cuid>`, `team_<cuid>`, `inv_<cuid>`, `task_<cuid>`).
- Rationale: Provides high collision resistance and better write performance
  characteristics than random UUIDs while keeping entity type obvious.
- Alternatives considered:
  - UUID v4: rejected due to poorer index locality and larger random distribution.
  - Auto-increment integer IDs: rejected due to predictability and merge/distribution constraints.

## Infrastructure and Deployment Strategy
- Decision: Manage infrastructure exclusively through AWS CDK (TypeScript), with
  stacks for identity (Cognito), API/Lambda compute, and data layer wiring.
- Rationale: Satisfies FR-024 and constitution technical constraints while keeping
  deployments reproducible, reviewable, and environment-safe.
- Alternatives considered:
  - Console/manual provisioning: rejected due to drift risk.
  - Raw CloudFormation only: rejected for lower developer ergonomics.

## Developer Documentation Strategy
- Decision: Maintain a root `README.md` as the canonical onboarding and deployment
  document, covering product purpose, architecture, setup, env vars, tests,
  and CDK deployment workflow.
- Rationale: Satisfies FR-025 and supports measurable onboarding success (SC-007).
- Alternatives considered:
  - Scattered docs only: rejected due to discoverability and onboarding friction.
  - Minimal README with external wiki dependency: rejected due to drift risk.

## Deployment URL Accessibility Verification
- Decision: Emit `frontendUrl` and `apiBaseUrl` as CDK stack outputs and gate
  deployment success on automated smoke checks against both URLs.
- Rationale: Satisfies FR-026 and FR-027 while ensuring the deployed application
  is actually reachable by end users.
- Alternatives considered:
  - Manual URL discovery and ad-hoc checks: rejected due to release risk.
  - Output URLs without automated checks: rejected as insufficient verification.
